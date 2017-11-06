import {remote} from "electron";

import Bundle from "./i18n/bundle";
import Formatter from "./i18n/formatter";

import Menu from "./menu";
import Editor from "./editor";

export default class App {
    static init() {
        const menu = Menu.create();
        remote.getCurrentWindow().setMenu(menu);
    }

    static async open(file) {
        App._bundle = new Bundle();
        await App._bundle.load(file);

        App._editor = new Editor("#horizon");
        App._editor.init(App._bundle);
    }

    static async save() {
        if (App._bundle) {
            await App._bundle.save([Formatter.align, Formatter.sort]);
        }
    }

    static isOpen() {
        return (typeof App._bundle !== "undefined");
    }
}