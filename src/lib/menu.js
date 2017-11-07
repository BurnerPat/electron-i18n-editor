import {remote} from "electron";
import App from "./app";
import Config from "./config";

const {Menu: _Menu, MenuItem: _MenuItem, dialog} = remote;

class ToolbarItem {
    constructor(descriptor) {
        this._descriptor = descriptor;
    }

    get icon() {
        return this._descriptor.icon;
    }

    get tooltip() {
        return this._descriptor.tooltip;
    }

    get click() {
        return this._descriptor.click;
    }

    expand() {
        const result = $("<span class='item'></span>");
        result.append($(`<span class='fa fa-${ this.icon }'></span>`));

        result.click(this.click);

        return result;
    }
}

class ToolbarSpacer {
    constructor() {

    }

    // noinspection JSMethodCanBeStatic
    expand() {
        return $("<span class='spacer'>|</span>");
    }
}

class Toolbar {
    constructor() {
        this._items = [];
    }

    addItem(item) {
        this._items.push(item);
    }

    expand() {
        const result = $("<div class='toolbar'></div>");

        for (const e of this._items) {
            result.append(e.expand());
        }

        return result;
    }
}

function openFile() {
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

function saveFile() {
    if (App.isOpen()) {
        App.save().catch((e) => {
            console.error("Failed to save bundle", e);
        });
    }
}

export default class Menu {
    static createMenu() {
        const menu = new _Menu();

        menu.append(new _MenuItem({
            label: "File",
            submenu: [
                {
                    label: "Open...",
                    accelerator: "Ctrl+O",
                    click: openFile
                },
                {
                    label: "Save",
                    accelerator: "Ctrl+S",
                    click: saveFile
                }
            ]
        }));

        menu.append(new _MenuItem({
            label: "Filter",
            submenu: [
                {
                    label: "Show all properties",
                    accelerator: "Alt+Shift+A",
                    click() {
                        if (App.isOpen()) {
                            App.applyFilter("all");
                        }
                    }
                },
                {
                    label: "Show only incomplete properties",
                    accelerator: "Alt+Shift+I",
                    click() {
                        if (App.isOpen()) {
                            App.applyFilter("incomplete");
                        }
                    }
                },
                {
                    label: "Show only complete properties",
                    accelerator: "Alt+Shift+C",
                    click() {
                        if (App.isOpen()) {
                            App.applyFilter("complete");
                        }
                    }
                }
            ]
        }));

        menu.append(new _MenuItem({
            label: "View",
            submenu: [
                {
                    label: "Highlight incomplete parent properties",
                    type: "checkbox",
                    checked: true,
                    click: Config.createWriteBinder("checked", Config.Keys.highlightEmptyParentProperties)
                }
            ]
        }));

        menu.append(new _MenuItem({
            label: "Help",
            submenu: [
                {
                    label: "Open developer tools",
                    accelerator: "F12",
                    click() {
                        App.openDeveloperTools()
                    }
                }
            ]
        }));

        return menu;
    }

    static createToolbar() {
        const toolbar = new Toolbar();

        toolbar.addItem(new ToolbarItem({
            icon: "folder-open-o",
            click: openFile
        }));

        toolbar.addItem(new ToolbarItem({
            icon: "floppy-o",
            click: saveFile
        }));

        toolbar.addItem(new ToolbarSpacer());

        toolbar.addItem(new ToolbarItem({
            icon: "plus",
            click() {
                if (App.isOpen()) {
                    App.createProperty();
                }
            }
        }));

        toolbar.addItem(new ToolbarItem({
            icon: "minus",
            click() {
                if (App.isOpen()) {
                    App.deleteProperty();
                }
            }
        }));

        return toolbar.expand();
    }
}