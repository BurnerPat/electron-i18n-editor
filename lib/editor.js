import Config from "./config";

export default class Editor {
    constructor(id) {
        this._id = id;
    }

    init(bundle) {
        this._bundle = bundle;

        this._base = $(this._id);
        this._base.empty();

        this._tree = $("<div class='tree'></div>");
        this._detail = $("<div class='detail'></div>");

        const spacer = $("<div class='spacer'></div>");

        spacer.on("mousedown", () => {
            document.body.style.cursor = "ew-resize";

            const mouseMoveHandler = e => {
                this._tree.width(e.pageX);
            };

            $(document.body).on("mousemove", mouseMoveHandler);

            $(document.body).one("mouseup", () => {
                document.body.style.cursor = "inherit";

                $(document.body).off("mousemove", mouseMoveHandler);
            });
        });

        this._base.append(this._tree);
        this._base.append(spacer);
        this._base.append(this._detail);

        this._root = $("<ul class='root'></ul>");
        this._tree.append(this._root);

        this.rebuildTree("all");

        Config.addListener(Config.Keys.highlightEmptyParentProperties, () => this.rebuildTree());
    }

    getFilteredKeys() {
        switch (this._filter) {
            case "all": {
                return this._bundle.getAllKeys();
            }

            case "incomplete": {
                return this._bundle.getIncompleteKeys();
            }

            case "complete": {
                return  this._bundle.getCompleteKeys();
            }

            default: {
                throw new Error("Illegal filter value");
            }
        }
    }

    get selectedKey() {
        return this._selectedKey;
    }

    set selectedKey(value) {
        this._selectedKey = value;
    }

    rebuildTree(filter) {
        if (!filter) {
            filter = this._filter;
        }

        this._filter = filter;

        const keys = this.getFilteredKeys();

        this._bundle.removeAllListeners();
        this._root.empty();
        this._selectedKey = null;
        this.clearDetails();

        const tree = this._bundle.buildTree(keys);

        const buildLevel = (ctx, ul) => {
            for (const e of ctx) {
                const li = $("<li></li>");

                const title = $(`<div class='title'></div>`);
                const icon = $("<span class='icon fa'></span>");

                title.append(icon);
                title.append(`<span class='key'>${ e.key }</span>`);

                this.refreshStatus(title, e);

                this._bundle.addListener(e.fullKey, () => {
                    this.refreshStatus(title, e);
                });

                li.append(title);

                if (e.children.length > 0) {
                    const sub = $("<ul class='collapsed'></ul>");
                    buildLevel(e.children, sub);

                    icon.addClass("fa-plus-square-o");

                    icon.click(() => {
                        icon.toggleClass("fa-plus-square-o");
                        icon.toggleClass("fa-minus-square-o");

                        sub.toggleClass("collapsed");
                        sub.toggleClass("expanded");
                    });

                    li.append(sub);
                }
                else {
                    icon.addClass("dummy");
                }

                title.click((evt) => {
                    this._selectedKey = e.fullKey;
                    this._tree.find(".title").removeClass("selected");
                    title.addClass("selected");

                    this.showDetails(e.fullKey);
                    evt.stopPropagation();
                });

                ul.append(li);
            }
        };

        buildLevel(tree, this._root);
    }

    clearDetails() {
        this._detail.empty();
        this._detail.off("keypress");
    }

    showDetails(key) {
        this.clearDetails();

        const header = $("<div class='box header'></div>");
        header.append($("<div class='title'>Key</div>"));

        const keyInput = $(`<input type='text' value='${ key }'>`);
        header.append(keyInput);

        let oldValue = key;

        this._detail.on("keypress", (e) => {
            if (e.which !== 13) {
                return;
            }

            const values = this._bundle.getProperties(oldValue);

            this._bundle.removeProperties(oldValue);
            this._bundle.setProperties(keyInput.val(), values);

            this.rebuildTree();
        });

        this._detail.append(header);

        this._bundle.map(e => {
            const box = $("<div class='box'></div>");
            box.append($(`<div class='title'>${ e.language || "&lt;default&gt;" }</div>`));

            const input = $("<input type='text'>");
            box.append(input);

            input.val(this._bundle.getProperty(e.language, key));

            input.on("input", () => {
                this._bundle.setProperty(e.language, key, input.val())
            });

            this._detail.append(box);
        });
    }

    refreshStatus(div, e) {
        div.removeClass("complete");
        div.removeClass("empty");
        div.removeClass("incomplete");

        if (this._bundle.isEmpty(e.fullKey)) {
            if (!Config.getProperty(Config.Keys.highlightEmptyParentProperties) && e.children.length > 0) {
                div.addClass("complete");
            }
            else {
                div.addClass("empty");
            }
        }
        else if (this._bundle.isComplete(e.fullKey)) {
            div.addClass("complete");
        }
        else {
            div.addClass("incomplete");
        }
    }
}