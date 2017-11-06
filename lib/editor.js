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

        this.rebuildTree(this._bundle.getAllKeys());
    }

    rebuildTree(keys) {
        const tree = this._bundle.buildTree(keys);

        const buildLevel = (ctx, ul) => {
            for (const e of ctx) {
                const li = $("<li></li>");

                const header = $(`<div class='title'></div>`);
                const icon = $("<span class='fa'></span>");

                header.append(icon);
                header.append(`<span>${ e.key }</span>`);

                if (this._bundle.isComplete(e.fullKey)) {
                    header.css("color", "green");
                }
                else {
                    header.css("color", "red");
                }

                li.append(header);

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

                header.click((evt) => {
                    this.showDetails(e.fullKey);
                    evt.stopPropagation();
                });

                ul.append(li);
            }
        };

        buildLevel(tree, this._root);
    }

    showDetails(key) {
        this._detail.empty();

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
}