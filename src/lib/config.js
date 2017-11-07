export default class Config {
    static setProperty(key, value) {
        const oldValue = Config._values[key];
        Config._values[key] = value;

        Config.notifyListeners(key, value, oldValue);
    }

    static getProperty(key) {
        return Config._values[key];
    }

    static addListener(key, listener, data) {
        if (!Config._listeners[key]) {
            Config._listeners[key] = [];
        }

        Config._listeners[key].push({
            listener: listener,
            data: data
        });
    }

    static removeListener(key, listener) {
        if (Config._listeners[key]) {
            const i = Config._listeners.indexOf(listener);

            if (i >= 0) {
                Config._listeners = Config._listeners.splice(i, 1);
            }
        }
    }

    static notifyListeners(key, newValue, oldValue) {
        if (Config._listeners[key]) {
            for (const e of Config._listeners[key]) {
                e.listener(key, newValue, oldValue, e.data);
            }
        }
    }

    static createWriteBinder(property, key) {
        return function (e) {
            Config.setProperty(key, e[property]);
        };
    }
}

Config.Keys = {
    highlightEmptyParentProperties: "highlightEmptyParentProperties"
};

Config._values = {
    [Config.Keys.highlightEmptyParentProperties]: true
};

Config._listeners = {};