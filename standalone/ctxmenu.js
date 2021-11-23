(function() {
    "use strict";
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, 
        k++) r[k] = a[j];
        return r;
    }
    var styles = {
        ".ctxmenu": {
            position: "fixed",
            maxHeight: "100vh",
            border: "1px solid #999",
            padding: "2px 0",
            boxShadow: "3px 3px 3px #aaa",
            background: "#fff",
            margin: "0",
            fontSize: "15px",
            fontFamily: "Verdana, sans-serif",
            zIndex: "9999",
            overflowY: "auto"
        },
        ".ctxmenu li": {
            margin: "1px 0",
            display: "block",
            position: "relative",
            userSelect: "none",
            webkitUserSelect: "none"
        },
        ".ctxmenu li span": {
            display: "block",
            padding: "2px 20px",
            cursor: "default"
        },
        ".ctxmenu li a": {
            color: "inherit",
            textDecoration: "none"
        },
        ".ctxmenu li.icon": {
            paddingLeft: "15px"
        },
        ".ctxmenu img.icon": {
            position: "absolute",
            width: "18px",
            left: "10px",
            top: "2px"
        },
        ".ctxmenu li.disabled": {
            color: "#ccc"
        },
        ".ctxmenu li.divider": {
            borderBottom: "1px solid #aaa",
            margin: "5px 0"
        },
        ".ctxmenu li.interactive:hover": {
            background: "rgba(0,0,0,0.1)"
        },
        ".ctxmenu li.submenu::after": {
            content: "''",
            position: "absolute",
            display: "block",
            top: "0",
            bottom: "0",
            right: "0.4em",
            margin: "auto",
            borderRight: "1px solid #000",
            borderTop: "1px solid #000",
            transform: "rotate(45deg)",
            width: "0.3rem",
            height: "0.3rem",
            marginRight: "0.1rem"
        },
        ".ctxmenu li.submenu.disabled::after": {
            borderColor: "#ccc"
        }
    };
    /*! ctxMenu v1.4.2 | (c) Nikolaj Kappler | https://github.com/nkappler/ctxmenu/blob/master/LICENSE !*/    var ContextMenu = function() {
        function ContextMenu() {
            var _this = this;
            this.cache = {};
            this.hdir = "r";
            this.vdir = "d";
            this.preventCloseOnScroll = false;
            window.addEventListener("click", (function(ev) {
                var item = ev.target instanceof Element && ev.target.parentElement;
                if (item && "interactive" === item.className) return;
                _this.hide();
            }));
            window.addEventListener("resize", (function() {
                return _this.hide();
            }));
            var timeout = 0;
            window.addEventListener("wheel", (function() {
                clearTimeout(timeout);
                timeout = setTimeout((function() {
                    if (_this.preventCloseOnScroll) {
                        _this.preventCloseOnScroll = false;
                        return;
                    }
                    _this.hide();
                }));
            }), {
                passive: true
            });
            ContextMenu.addStylesToDom();
        }
        ContextMenu.getInstance = function() {
            if (!ContextMenu.instance) ContextMenu.instance = new ContextMenu;
            var instance = ContextMenu.instance;
            return {
                attach: instance.attach.bind(instance),
                delete: instance.delete.bind(instance),
                hide: instance.hide.bind(instance),
                show: instance.show.bind(instance),
                update: instance.update.bind(instance)
            };
        };
        ContextMenu.prototype.attach = function(target, ctxMenu, beforeRender) {
            var _this = this;
            if (void 0 === beforeRender) beforeRender = function(m) {
                return m;
            };
            var t = document.querySelector(target);
            if (void 0 !== this.cache[target]) {
                console.error("target element " + target + " already has a context menu assigned. Use ContextMenu.update() intstead.");
                return;
            }
            if (!t) {
                console.error("target element " + target + " not found");
                return;
            }
            var handler = function(e) {
                var newMenu = beforeRender(__spreadArrays(ctxMenu), e);
                _this.show(newMenu, e);
            };
            this.cache[target] = {
                ctxMenu: ctxMenu,
                handler: handler,
                beforeRender: beforeRender
            };
            t.addEventListener("contextmenu", handler);
        };
        ContextMenu.prototype.update = function(target, ctxMenu, beforeRender) {
            var o = this.cache[target];
            var t = document.querySelector(target);
            o && (null === t || void 0 === t ? void 0 : t.removeEventListener("contextmenu", o.handler));
            delete this.cache[target];
            this.attach(target, ctxMenu || (null === o || void 0 === o ? void 0 : o.ctxMenu) || [], beforeRender || (null === o || void 0 === o ? void 0 : o.beforeRender));
        };
        ContextMenu.prototype.delete = function(target) {
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
        ContextMenu.prototype.show = function(ctxMenu, eventOrElement) {
            var _this = this;
            if (eventOrElement instanceof MouseEvent) eventOrElement.stopImmediatePropagation();
            this.hide();
            this.menu = this.generateDOM(__spreadArrays(ctxMenu), eventOrElement);
            document.body.appendChild(this.menu);
            this.menu.addEventListener("wheel", (function() {
                return _this.preventCloseOnScroll = true;
            }), {
                passive: true
            });
            if (eventOrElement instanceof MouseEvent) eventOrElement.preventDefault();
        };
        ContextMenu.prototype.hide = function(menu) {
            var _a;
            if (void 0 === menu) menu = this.menu;
            this.hdir = "r";
            this.vdir = "d";
            if (menu) {
                if (menu === this.menu) delete this.menu;
                null === (_a = menu.parentElement) || void 0 === _a ? void 0 : _a.removeChild(menu);
            }
        };
        ContextMenu.prototype.debounce = function(target, action) {
            var timeout;
            target.addEventListener("mouseenter", (function(e) {
                timeout = setTimeout((function() {
                    return action(e);
                }), 150);
            }));
            target.addEventListener("mouseleave", (function() {
                return clearTimeout(timeout);
            }));
        };
        ContextMenu.prototype.generateDOM = function(ctxMenu, parentOrEvent) {
            var _this = this;
            var container = document.createElement("ul");
            if (0 === ctxMenu.length) container.style.display = "none";
            ctxMenu.forEach((function(item) {
                var li = document.createElement("li");
                _this.debounce(li, (function() {
                    var _a;
                    var subMenu = null === (_a = li.parentElement) || void 0 === _a ? void 0 : _a.querySelector("ul");
                    if (subMenu && subMenu.parentElement !== li) _this.hide(subMenu);
                }));
                if (ContextMenu.itemIsDivider(item)) li.className = "divider"; else {
                    var html = ContextMenu.getProp(item.html);
                    var text = "<span>" + ContextMenu.getProp(item.text) + "</span>";
                    var elem = ContextMenu.getProp(item.element);
                    elem ? li.append(elem) : li.innerHTML = html ? html : text;
                    li.title = ContextMenu.getProp(item.tooltip) || "";
                    if (item.style) li.setAttribute("style", ContextMenu.getProp(item.style));
                    if (ContextMenu.itemIsInteractive(item)) if (!ContextMenu.getProp(item.disabled)) {
                        li.classList.add("interactive");
                        if (ContextMenu.itemIsAction(item)) li.addEventListener("click", (function(e) {
                            item.action(e);
                            _this.hide();
                        })); else if (ContextMenu.itemIsAnchor(item)) {
                            var a = document.createElement("a");
                            elem ? a.append(elem) : a.innerHTML = html ? html : text;
                            a.onclick = function() {
                                return _this.hide();
                            };
                            a.href = ContextMenu.getProp(item.href);
                            if (item.hasOwnProperty("download")) a.download = ContextMenu.getProp(item.download);
                            if (item.hasOwnProperty("target")) a.target = ContextMenu.getProp(item.target);
                            li.childNodes.forEach((function(n) {
                                return n.remove();
                            }));
                            li.append(a);
                        } else if (ContextMenu.itemIsSubMenu(item)) if (0 === ContextMenu.getProp(item.subMenu).length) li.classList.add("disabled"); else {
                            li.classList.add("submenu");
                            _this.debounce(li, (function(ev) {
                                var subMenu = li.querySelector("ul");
                                if (!subMenu) _this.openSubMenu(ev, ContextMenu.getProp(item.subMenu), li);
                            }));
                        }
                    } else {
                        li.classList.add("disabled");
                        if (ContextMenu.itemIsSubMenu(item)) li.classList.add("submenu");
                    } else li.setAttribute("style", "font-weight: bold; margin-left: -5px;" + li.getAttribute("style"));
                    if (ContextMenu.getProp(item.icon)) {
                        li.classList.add("icon");
                        li.innerHTML += '<img class="icon" src="' + ContextMenu.getProp(item.icon) + '" />';
                    }
                }
                container.appendChild(li);
            }));
            container.className = "ctxmenu";
            var rect = ContextMenu.getBounding(container);
            var pos = {
                x: 0,
                y: 0
            };
            if (parentOrEvent instanceof Element) {
                var parentRect = parentOrEvent.getBoundingClientRect();
                pos = {
                    x: "r" === this.hdir ? parentRect.left + parentRect.width : parentRect.left - rect.width,
                    y: parentRect.top
                };
                if (parentOrEvent.className.includes("submenu")) pos.y += "d" === this.vdir ? 4 : -12;
                var savePos = this.getPosition(rect, pos);
                if (pos.x !== savePos.x) {
                    this.hdir = "r" === this.hdir ? "l" : "r";
                    pos.x = "r" === this.hdir ? parentRect.left + parentRect.width : parentRect.left - rect.width;
                }
                if (pos.y !== savePos.y) {
                    this.vdir = "u" === this.vdir ? "d" : "u";
                    pos.y = savePos.y;
                }
                pos = this.getPosition(rect, pos, false);
            } else pos = this.getPosition(rect, {
                x: parentOrEvent.clientX,
                y: parentOrEvent.clientY
            });
            container.style.left = pos.x + "px";
            container.style.top = pos.y + "px";
            container.addEventListener("contextmenu", (function(ev) {
                ev.stopPropagation();
                ev.preventDefault();
            }));
            container.addEventListener("click", (function(ev) {
                var item = ev.target instanceof Element && ev.target.parentElement;
                if (item && "interactive" !== item.className) ev.stopPropagation();
            }));
            return container;
        };
        ContextMenu.prototype.openSubMenu = function(e, ctxMenu, listElement) {
            var _a;
            var subMenu = null === (_a = listElement.parentElement) || void 0 === _a ? void 0 : _a.querySelector("li > ul");
            if (subMenu && subMenu.parentElement !== listElement) this.hide(subMenu);
            listElement.appendChild(this.generateDOM(ctxMenu, listElement));
        };
        ContextMenu.getBounding = function(elem) {
            var container = elem.cloneNode(true);
            container.style.visibility = "hidden";
            document.body.appendChild(container);
            var result = container.getBoundingClientRect();
            document.body.removeChild(container);
            return result;
        };
        ContextMenu.prototype.getPosition = function(rect, pos, addScrollOffset) {
            if (void 0 === addScrollOffset) addScrollOffset = true;
            var width = window.innerWidth;
            var height = window.innerHeight;
            var hasTransform = "" !== document.body.style.transform;
            var minX = hasTransform ? window.scrollX : 0;
            var minY = hasTransform ? window.scrollY : 0;
            var maxX = hasTransform ? width + window.scrollX : width;
            var maxY = hasTransform ? height + window.scrollY : height;
            if (hasTransform && addScrollOffset) {
                pos.x += window.scrollX;
                pos.y += window.scrollY;
            }
            return {
                x: "r" === this.hdir ? pos.x + rect.width > maxX ? maxX - rect.width : pos.x : pos.x < minX ? minX : pos.x,
                y: "d" === this.vdir ? pos.y + rect.height > maxY ? maxY - rect.height : pos.y : pos.y < minY ? minY : pos.y
            };
        };
        ContextMenu.getProp = function(prop) {
            return "function" === typeof prop ? prop() : prop;
        };
        ContextMenu.itemIsInteractive = function(item) {
            return this.itemIsAction(item) || this.itemIsAnchor(item) || this.itemIsSubMenu(item) || this.itemIsCustom(item);
        };
        ContextMenu.itemIsAction = function(item) {
            return item.hasOwnProperty("action");
        };
        ContextMenu.itemIsAnchor = function(item) {
            return item.hasOwnProperty("href");
        };
        ContextMenu.itemIsDivider = function(item) {
            return item.hasOwnProperty("isDivider");
        };
        ContextMenu.itemIsSubMenu = function(item) {
            return item.hasOwnProperty("subMenu");
        };
        ContextMenu.itemIsCustom = function(item) {
            return item.hasOwnProperty("html") || item.hasOwnProperty("element");
        };
        ContextMenu.addStylesToDom = function() {
            var append = function() {
                var rules = Object.entries(styles).map((function(s) {
                    return s[0] + " { " + Object.assign(document.createElement("p").style, s[1]).cssText + " }";
                }));
                var styleSheet = document.head.insertBefore(document.createElement("style"), document.head.childNodes[0]);
                rules.forEach((function(r) {
                    var _a;
                    return null === (_a = styleSheet.sheet) || void 0 === _a ? void 0 : _a.insertRule(r);
                }));
                append = function() {};
            };
            if ("loading" !== document.readyState) append(); else document.addEventListener("readystatechange", (function() {
                if ("loading" !== document.readyState) append();
            }));
        };
        return ContextMenu;
    }();
    var ctxmenu = ContextMenu.getInstance();
    window.ctxmenu = ctxmenu;
})();
