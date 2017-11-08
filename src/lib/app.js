import {remote} from "electron";

import Bundle from "./i18n/bundle";
import Formatter from "./i18n/formatter";
import Export from "./i18n/export";

import Menu from "./menu";
import Editor from "./editor";

export default class App {
    static init() {
        const menu = Menu.createMenu();
        remote.getCurrentWindow().setMenu(menu);

        $("#toolbar").replaceWith(Menu.createToolbar());
    }

    static async open(file) {
        App._bundle = new Bundle();
        await App._bundle.load(file);

        App._editor = new Editor("#horizon");
        App._editor.init(App._bundle);
    }

    static async save() {
        if (App.isOpen()) {
            await App._bundle.save([Formatter.align, Formatter.sort]);
        }
    }

    static applyFilter(filter) {
        if (!App.isOpen()) {
            throw new Error("Illegal state");
        }

        App._editor.rebuildTree(filter);
    }

    static isOpen() {
        return (typeof App._bundle !== "undefined");
    }

    static openDeveloperTools() {
        remote.getCurrentWindow().toggleDevTools();
    }

    static createProperty() {
        App._editor.showDetails(null);
    }

    static deleteProperty() {
        App._bundle.removeProperties(App._editor.selectedKey);
        App._editor.rebuildTree();
    }

    static async export(file, format) {
        if (!App._bundle) {
            throw new Error("Illegal state");
        }

        switch (format) {
            case "xlsx": {
                await Export.toXLSX(this._bundle, file);
                break;
            }
            default: {
                throw new Error("Unknown format");
            }
        }
    }
}