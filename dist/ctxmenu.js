"use strict";
function itemIsAction(item) {
    return item.hasOwnProperty("action");
}
function itemIsAnchor(item) {
    return item.hasOwnProperty("href");
}
var ContextMenu = /** @class */ (function () {
    function ContextMenu() {
        var _this = this;
        window.addEventListener("click", function () { return _this.closeMenu(); });
        window.addEventListener("resize", function () { return _this.closeMenu(); });
        window.addEventListener("scroll", function () { return _this.closeMenu(); });
    }
    ContextMenu.prototype.attach = function (target, ctxmenu) {
        var _this = this;
        var t = typeof target === "string" ? document.querySelector(target) : target;
        if (t) {
            window.addEventListener("contextmenu", function (e) {
                if (e.target === t) {
                    e.stopImmediatePropagation();
                    //close any open menu
                    _this.closeMenu();
                    var container_1 = document.createElement("ul");
                    ctxmenu.forEach(function (item) {
                        var li = document.createElement("li");
                        li.innerHTML = item.text;
                        li.title = item.title || "";
                        if (itemIsAction(item)) {
                            li.addEventListener("click", function () { return item.action(); });
                            li.className = "interactive";
                        }
                        else if (itemIsAnchor(item)) {
                            li.innerHTML = "<a href=\"" + item.href + "\" target=\"" + (item.target || "") + "\">" + item.text + "</a>";
                            li.className = "interactive";
                        }
                        container_1.appendChild(li);
                    });
                    Object.assign(container_1.style, {
                        position: "fixed",
                        left: e.offsetX + "px",
                        top: e.offsetY + "px"
                    });
                    container_1.className = "ctxmenu";
                    _this.menu = container_1;
                    document.body.appendChild(container_1);
                    e.preventDefault();
                }
            });
        }
        else {
            console.error("target element " + target + " not found");
        }
    };
    ContextMenu.prototype.closeMenu = function () {
        this.menu && this.menu.remove();
    };
    return ContextMenu;
}());
Object.assign(window, {
    ContextMenu: new ContextMenu()
});
document.addEventListener("readystatechange", function (e) {
    if (document.readyState === "interactive") {
        //insert default styles as css -> low priority
        var styles = document.createElement("style");
        styles.innerHTML = "\n            ul.ctxmenu {\n                border: 1px solid #999;\n                padding: 2px 0;\n                box-shadow: 3px 3px 3px #aaa;\n                background: #fff;\n            }\n            ul.ctxmenu li {\n                margin: 1px 0;\n                padding: 2px 15px;\n                display: block;\n            }\n            ul.ctxmenu li a {\n                color: inherit;\n                text-decoration: none;\n            }\n            ul.ctxmenu li.interactive {\n                cursor: pointer;\n            }\n            ul.ctxmenu li.interactive:hover {\n                background: rgba(0,0,0,0.1);\n            }\n        ";
        document.head.insertBefore(styles, document.head.childNodes[0]);
    }
});
