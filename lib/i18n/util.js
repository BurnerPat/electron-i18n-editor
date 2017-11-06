export default class Util {
    static regexify(str) {
        return new RegExp(Util.escapeRegex(str));
    }

    static escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    static distinct(arr) {
        const result = [];

        for (let e of arr) {
            if (result.indexOf(e) < 0) {
                result.push(e);
            }
        }

        return result;
    }

    static intersection(arr0, ...arrX) {
        let result = [];

        for (const e of arr0) {
            let found = true;

            for (const arr of arrX) {
                if (arr.indexOf(e) < 0) {
                    found = false;
                    break;
                }
            }

            if (found) {
                result.push(e);
            }
        }

        return result;
    }

    static complement(arr0, ...arrX) {
        const result = [];

        for (const arr of arrX) {
            for (const e of arr0) {
                if (arr.indexOf(e) < 0) {
                    result.push(e);
                }
            }
        }

        return Util.distinct(result);
    }

    static set(obj, key, value) {
        let ctx = obj;
        const parts = key.split(".");

        if (parts.length > 1) {
            for (const e of parts.slice(0, parts.length - 2)) {
                if (!ctx[e]) {
                    ctx[e] = {};
                }

                ctx = obj[e];
            }
        }

        ctx[parts[parts.length - 1]] = value;
    }

    static get(obj, key) {
        let ctx = obj;

        for (const e of key.split(".")) {
            if (ctx) {
                ctx = ctx[e];
            }
        }

        return ctx;
    }
}