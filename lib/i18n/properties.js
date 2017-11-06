import fs from "fs-extra";

export default class Properties {
    constructor() {
        this._map = {};
    }

    getProperty(key) {
        return this._map[key];
    }

    setProperty(key, value) {
        this._map[key] = value;
    }

    get keys() {
        return Object.keys(this._map);
    }

    hasProperty(key) {
        return !!this._map[key];
    }

    async read(file) {
        const data = await fs.readFile(file);

        const text = data.toString();
        this.parse(text);

        return this;
    }

    async write(file, formatters) {
        const text = this.format(formatters);

        await fs.writeFile(file, text);

        return this;
    }

    format(formatters) {
        let lines = [];

        for (const key of Object.keys(this._map)) {
            lines.push([key, this._map[key]]);
        }

        if (formatters) {
            for (const formatter of formatters) {
                lines = formatter(lines);
            }
        }

        return lines.map(e => e.join(" = ")).join("\n");
    }

    parse(text) {
        this._map = {};

        const lines = text.split(/\r?\n/g);

        for (const line of lines) {
            if (!Properties.isValidLine(line)) {
                continue;
            }

            const parts = line.split(/=(.+)/);

            const key = parts[0].trim();
            const value = (parts[1] || "").trim();

            if (!key) {
                continue;
            }

            this.setProperty(key, value);
        }
    }

    static isValidLine(line) {
        return /^\s*[a-z.]+\s*=\s*[^$]*$/i.test(line);
    }
}