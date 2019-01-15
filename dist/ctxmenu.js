"use strict";
var ContextMenu = /** @class */ (function () {
    function ContextMenu() {
        var _this = this;
        this.cache = {};
        window.addEventListener("click", function () { return _this.closeMenu(); });
        window.addEventListener("resize", function () { return _this.closeMenu(); });
        window.addEventListener("scroll", function () { return _this.closeMenu(); });
    }
    ContextMenu.prototype.attach = function (target, ctxmenu) {
        var _this = this;
        var t = document.querySelector(target);
        if (this.cache[target] !== undefined) {
            console.error("target element " + target + " already has a context menu assigned. Use ContextMenu.update() intstead.");
            return;
        }
        if (!t) {
            console.error("target element " + target + " not found");
            return;
        }
        var handler = function (e) {
            e.stopImmediatePropagation();
            //close any open menu
            _this.closeMenu();
            _this.menu = ContextMenu.generateDOM(e, ctxmenu);
            document.body.appendChild(_this.menu);
            e.preventDefault();
        };
        this.cache[target] = {
            ctxmenu: ctxmenu,
            handler: handler
        };
        t.addEventListener("contextmenu", handler);
    };
    ContextMenu.prototype.update = function (target, ctxmenu) {
        var o = this.cache[target];
        var t = document.querySelector(target);
        t && t.removeEventListener("contextmenu", (o && o.handler));
        delete this.cache[target];
        this.attach(target, ctxmenu);
    };
    ContextMenu.prototype.delete = function (target) {
        var o = this.cache[target];
        if (!o) {
            console.error("no context menu for target element " + target + " found");
            return;
        }
        var t = document.querySelector(target);
        if (!t) {
            console.error("target element " + target + " does not exist (anymore)");
            return;
        }
        t.removeEventListener("contextmenu", o.handler);
        delete this.cache[target];
    };
    ContextMenu.prototype.closeMenu = function () {
        this.menu && this.menu.remove();
        delete this.menu;
    };
    ContextMenu.generateDOM = function (e, ctxmenu) {
        var container = document.createElement("ul");
        if (ctxmenu.length === 0) {
            container.style.display = "none";
        }
        ctxmenu.forEach(function (item) {
            var li = document.createElement("li");
            li.innerHTML = "<span>" + item.text + "</span>";
            li.title = item.title || "";
            if (ContextMenu.itemIsAction(item)) {
                li.addEventListener("click", function () { return item.action(); });
                li.className = "interactive";
            }
            else if (ContextMenu.itemIsAnchor(item)) {
                li.innerHTML = "<a href=\"" + item.href + "\" target=\"" + (item.target || "") + "\">" + item.text + "</a>";
                li.className = "interactive";
            }
            container.appendChild(li);
        });
        Object.assign(container.style, {
            position: "fixed",
            left: e.offsetX + "px",
            top: e.offsetY + "px"
        });
        container.className = "ctxmenu";
        return container;
    };
    ContextMenu.itemIsAction = function (item) {
        return item.hasOwnProperty("action");
    };
    ContextMenu.itemIsAnchor = function (item) {
        return item.hasOwnProperty("href");
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
        styles.innerHTML = "\n            ul.ctxmenu {\n                border: 1px solid #999;\n                padding: 2px 0;\n                box-shadow: 3px 3px 3px #aaa;\n                background: #fff;\n            }\n            ul.ctxmenu li {\n                margin: 1px 0;\n                display: block;\n            }\n            ul.ctxmenu li * {\n                display: block;\n                padding: 2px 20px;\n            }\n            ul.ctxmenu li a {\n                color: inherit;\n                text-decoration: none;\n            }\n            ul.ctxmenu li.interactive {\n                cursor: pointer;\n            }\n            ul.ctxmenu li.interactive:hover {\n                background: rgba(0,0,0,0.1);\n            }\n        ";
        document.head.insertBefore(styles, document.head.childNodes[0]);
    }
});
