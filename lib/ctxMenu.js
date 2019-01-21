"use strict";
/*! ctxMenu v0.1 | (c) Nikolaj Kappler | https://github.com/nkappler/ctxmenu/blob/master/LICENSE !*/

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ContextMenu = function () {
    function ContextMenu() {
        var _this = this;

        _classCallCheck(this, ContextMenu);

        this.cache = {};
        window.addEventListener("click", function () {
            return _this.closeMenu();
        });
        window.addEventListener("resize", function () {
            return _this.closeMenu();
        });
        window.addEventListener("scroll", function () {
            return _this.closeMenu();
        });
    }

    ContextMenu.prototype.attach = function attach(target, ctxmenu) {
        var _this2 = this;

        var beforeRender = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (m) {
            return m;
        };

        var t = document.querySelector(target);
        if (this.cache[target] !== undefined) {
            console.error("target element " + target + " already has a context menu assigned. Use ContextMenu.update() intstead.");
            return;
        }
        if (!t) {
            console.error("target element " + target + " not found");
            return;
        }
        var handler = function handler(e) {
            e.stopImmediatePropagation();
            _this2.closeMenu();
            var newMenu = beforeRender([].concat(ctxmenu), e);
            _this2.menu = _this2.generateDOM(e, newMenu);
            document.body.appendChild(_this2.menu);
            e.preventDefault();
        };
        this.cache[target] = {
            ctxmenu: ctxmenu,
            handler: handler
        };
        t.addEventListener("contextmenu", handler);
    };

    ContextMenu.prototype.update = function update(target, ctxmenu) {
        var o = this.cache[target];
        var t = document.querySelector(target);
        t && t.removeEventListener("contextmenu", o && o.handler);
        delete this.cache[target];
        this.attach(target, ctxmenu);
    };

    ContextMenu.prototype.delete = function _delete(target) {
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

    ContextMenu.prototype.closeMenu = function closeMenu() {
        if (this.menu) {
            var p = this.menu.parentElement;
            p && p.removeChild(this.menu);
            delete this.menu;
        }
    };

    ContextMenu.prototype.generateDOM = function generateDOM(e, ctxmenu) {
        var _this3 = this;

        var parentMenu = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.menu;

        var container = document.createElement("ul");
        if (ctxmenu.length === 0) {
            container.style.display = "none";
        }
        ctxmenu.forEach(function (item) {
            var li = document.createElement("li");
            if (ContextMenu.itemIsDivider(item)) {
                li.className = "divider";
            } else {
                li.innerHTML = "<span>" + item.text + "</span>";
                li.title = item.tooltip || "";
                if (ContextMenu.itemIsInteractive(item)) {
                    if (!item.disabled) {
                        li.className = "interactive";
                        if (ContextMenu.itemIsAction(item)) {
                            li.addEventListener("click", item.action);
                        } else if (ContextMenu.itemIsAnchor(item)) {
                            li.innerHTML = "<a onclick=\"" + _this3.closeMenu() + "\" href=\"" + item.href + "\" target=\"" + (item.target || "") + "\">" + item.text + "</a>";
                        } else {
                            if (item.subMenu.length === 0) {
                                li.className = "disabled submenu";
                            } else {
                                li.className = "interactive submenu";
                                li.addEventListener("mouseenter", function (ev) {
                                    _this3.openSubMenu(ev, item.subMenu, parentMenu);
                                });
                            }
                        }
                    } else {
                        li.className = "disabled";
                    }
                } else {
                    li.style.fontWeight = "bold";
                    li.style.marginLeft = "-5px";
                }
            }
            container.appendChild(li);
        });
        container.style.position = "fixed";
        container.className = "ctxmenu";
        var rect = ContextMenu.getBounding(container);
        var pos = ContextMenu.getPosition(rect, { x: e.clientX, y: e.clientY });
        container.style.left = pos.x + "px";
        container.style.top = pos.y + "px";
        container.addEventListener("contextmenu", function (ev) {
            ev.stopPropagation();
            ev.preventDefault();
        });
        container.addEventListener("click", function (ev) {
            var item = ev.target && ev.target.parentElement;
            if (item && item.className !== "interactive") {
                ev.stopPropagation();
            }
        });
        return container;
    };

    ContextMenu.prototype.openSubMenu = function openSubMenu(e, ctxMenu) {
        var parentMenu = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.menu;

        parentMenu["subMenu"] = this.generateDOM(e, ctxMenu, parentMenu);
        document.body.appendChild(parentMenu["subMenu"]);
    };

    ContextMenu.getBounding = function getBounding(elem) {
        var container = elem.cloneNode(true);
        container.style.visibility = "hidden";
        document.body.appendChild(container);
        var result = container.getBoundingClientRect();
        document.body.removeChild(container);
        return result;
    };

    ContextMenu.getPosition = function getPosition(rect, pos) {
        return {
            x: pos.x + rect.width > window.innerWidth ? window.innerWidth - rect.width : pos.x,
            y: pos.y + rect.height > window.innerHeight ? window.innerHeight - rect.height : pos.y
        };
    };

    ContextMenu.itemIsInteractive = function itemIsInteractive(item) {
        return this.itemIsAction(item) || this.itemIsAnchor(item) || this.itemIsSubMenu(item);
    };

    ContextMenu.itemIsAction = function itemIsAction(item) {
        return item.hasOwnProperty("action");
    };

    ContextMenu.itemIsAnchor = function itemIsAnchor(item) {
        return item.hasOwnProperty("href");
    };

    ContextMenu.itemIsDivider = function itemIsDivider(item) {
        return item.hasOwnProperty("isDivider");
    };

    ContextMenu.itemIsSubMenu = function itemIsSubMenu(item) {
        return item.hasOwnProperty("subMenu");
    };

    return ContextMenu;
}();

window.ContextMenu = new ContextMenu();
document.addEventListener("readystatechange", function (e) {
    if (document.readyState === "interactive") {
        var styles = document.createElement("style");
        styles.innerHTML = ".ctxmenu{border:1px solid #999;padding:2px 0;box-shadow:3px 3px 3px #aaa;background:#fff;margin:0;font-size:15px}.ctxmenu li{margin:1px 0;display:block;position:relative}.ctxmenu li *{display:block;padding:2px 20px;cursor:default}.ctxmenu li a{color:inherit;text-decoration:none}.ctxmenu li.disabled{color:#ccc}.ctxmenu li.divider{border-bottom:1px solid #aaa;margin:5px 0}.ctxmenu li.interactive:hover{background:rgba(0,0,0,0.1)}.ctxmenu li.submenu::after{content:'>';position:absolute;display:block;top:0;right:0.3em;font-family:monospace}";
        document.head.insertBefore(styles, document.head.childNodes[0]);
    }
});