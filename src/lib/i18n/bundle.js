import path from "path";
import fs from "fs-extra";

import Util from "./util";
import Properties from "./properties";

class BundleStatusCache {
    constructor(bundle) {
        this._bundle = bundle;
        this._status = {};
    }

    lookup(key) {
        if (this._status[key]) {
            return this._status[key];
        }

        const ref = this._status[key] = {};

        for (const method of ["isEmpty", "isComplete", "hasIncompleteChildren"]) {
            ref[method] = Bundle.prototype[method].apply(this._bundle, [key]);
        }

        return ref;
    }

    invalidate(key) {
        delete this._status[key];
    }
}

class Bundle {
    constructor() {
        this._files = {};
        this._regex = /_([A-Za-z]+)/;
    }

    map(modifier) {
        return Object.keys(this._files).map(e => modifier(this._files[e]));
    }

    async load(base) {
        base = path.resolve(base);

        this._files[null] = {
            file: base,
            language: null,
            properties: new Properties()
        };

        const dir = path.dirname(base);
        const ext = path.extname(base);
        const baseWithoutExt = base.substring(0, base.length - ext.length);

        let tempRegex = this.regex.toString();
        tempRegex = tempRegex.substring(1, tempRegex.length - 1);

        const regex = new RegExp(Util.escapeRegex(baseWithoutExt) + tempRegex + Util.escapeRegex(ext));

        const files = await fs.readdir(dir);

        for (let file of files) {
            file = path.join(dir, file);

            const match = regex.exec(file);

            if (!match) {
                continue;
            }

            this._files[match[1]] = {
                file: file,
                language: match[1],
                properties: new Properties()
            };
        }

        await Promise.all(this.map(e => e.properties.read(e.file)));

        return this;
    }

    async save(formatters) {
        this.map(e => e.properties.write(e.file, formatters));
    }

    get regex() {
        return this._regex;
    }

    set regex(regex) {
        this._regex = regex;
    }

    getLanguageCodes() {
        return this.map(e => e.language);
    }

    getAllKeys() {
        return Util.distinct([].concat(...this.map(e => e.properties.keys)));
    }

    getIncompleteKeys() {
        return Util.complement(this.getAllKeys(), ...this.map(e => e.properties.keys));
    }

    getCompleteKeys() {
        return Util.intersection(this.getAllKeys(), ...this.map(e => e.properties.keys));
    }

    getChildren(key) {
        return this.getAllKeys().filter(e => e.indexOf(key) === 0);
    }

    hasIncompleteChildren(key) {
        return this.getChildren(key).reduce((acc, e) => acc || !this.isComplete(key) || !this.hasIncompleteChildren(key), false);
    }

    isComplete(key) {
        let result = true;
        this.map(e => result = result && (e.properties.hasProperty(key)));
        return result;
    }

    isEmpty(key) {
        let result = true;
        this.map(e => result = result && (!e.properties.hasProperty(key)));
        return result;
    }

    getProperties(key) {
        const result = {};
        this.map(e => result[e.language] = e.properties.getProperty(key));
        return result;
    }

    setProperties(key, values) {
        for (const e of Object.keys(values)) {
            this._files[e].properties.setProperty(key, values[e]);
        }
    }

    removeProperties(key) {
        this.map(e => e.properties.removeProperty(key));
    }

    getProperty(language, key) {
        if (this._files[language]) {
            return this._files[language].properties.getProperty(key);
        }
    }

    setProperty(language, key, value) {
        if (this._files[language]) {
            this._files[language].properties.setProperty(key, value);
        }
    }

    buildTree(keys) {
        const result = [];
        keys = keys.map(e => e.split("."));

        for (const key of keys) {
            let ctx = result;

            for (const [i, k] of key.entries()) {
                let element = ctx.filter(e => e.key === k)[0];

                if (!element) {
                    const path = key.slice(0, i + 1).join(".");

                    element = {
                        key: k,
                        path: path,
                        values: this.getProperties(path),
                        children: []
                    };

                    ctx.push(element);
                }

                ctx = element.children;
            }
        }

        return result;
    }

    addListener(key, listener) {
        this.map(e => {
            e.properties.addListener(key, listener, e.language);
        })
    }

    removeAllListeners() {
        this.map(e => {
            e.properties.removeAllListeners();
        });
    }

    static traverseTree(tree, callback) {
        for (const e of tree) {
            callback(e);

            if (e.children.length > 0) {
                Bundle.traverseTree(e.children, callback);
            }
        }
    }
}

export default class CachingBundle extends Bundle {
    constructor() {
        super();

        this._proxies = {};
        this._cache = new BundleStatusCache(this);
    }

    invalidate(key) {
        this._proxies = {};
        this._cache.invalidate(key);
    }

    setProperties(key, values) {
        super.setProperties(key, values);
        this.invalidate(key);
    }

    setProperty(language, key, value) {
        super.setProperty(language, key, value);
        this.invalidate(key);
    }

    removeProperties(key) {
        super.removeProperties(key);
        this.invalidate(key);
    }

    static override(method) {
        CachingBundle.prototype[method] = function (key) {
            return this._cache.lookup(key)[method];
        };
    }

    static proxify(method) {
        CachingBundle.prototype[method] = function () {
            if (!this._proxies[method]) {
                this._proxies[method] = Bundle.prototype[method].apply(this)
            }

            return this._proxies[method];
        };
    }
}

CachingBundle.override("isEmpty");
CachingBundle.override("isComplete");
CachingBundle.override("hasIncompleteChildren");

CachingBundle.proxify("getAllKeys");
CachingBundle.proxify("getCompleteKeys");
CachingBundle.proxify("getIncompleteKeys");