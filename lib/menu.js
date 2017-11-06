import {remote} from "electron";
import App from "./app";

const {Menu: _Menu, MenuItem: _MenuItem, dialog} = remote;

export default class Menu {
    static create() {
        const menu = new _Menu();

        menu.append(new _MenuItem({
            label: "File",
            submenu: [
                {
                    label: "Open...",
                    accelerator: "Ctrl+O",
                    click() {
                        let file = dialog.showOpenDialog({
                            properties: ["openFile"],
                            filters: [
                                {
                                    name: "Properties file",
                                    extensions: ["properties"]
                                }
                            ]
                        })[0];

                        App.open(file).catch((e) => {
                            console.error("Failed to open bundle", e);
                        });
                    }
                },
                {
                    label: "Save",
                    accelerator: "Ctrl+S",
                    click() {
                        if (App.isOpen()) {
                            App.save().catch((e) => {
                                console.error("Failed to save bundle", e);
                            });
                        }
                    }
                }
            ]
        }));

        return menu;
    }
}