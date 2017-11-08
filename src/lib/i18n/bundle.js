import path from "path";
import fs from "fs-extra";

import Util from "./util";
import Properties from "./properties";

export default class Bundle {
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
                    const fullKey = key.slice(0, i + 1).join(".");

                    element = {
                        key: k,
                        fullKey: fullKey,
                        values: this.getProperties(fullKey),
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
}