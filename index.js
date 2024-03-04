"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function getProp(prop) {
    return typeof prop === "function" ? prop() : prop;
}

function itemIsInteractive(item) {
    return !itemIsCustom(item) && (itemIsAction(item) || itemIsAnchor(item) || itemIsSubMenu(item));
}

function itemIsAction(item) {
    return item.hasOwnProperty("action");
}

function itemIsAnchor(item) {
    return item.hasOwnProperty("href");
}

function itemIsDivider(item) {
    return item.hasOwnProperty("isDivider");
}

function itemIsSubMenu(item) {
    return item.hasOwnProperty("subMenu");
}

function itemIsCustom(item) {
    return item.hasOwnProperty("html") || item.hasOwnProperty("element");
}

function itemIsHeading(item) {
    return !itemIsInteractive(item) && !itemIsDivider(item) && !itemIsCustom(item);
}

function isDisabled(item) {
    return itemIsInteractive(item) && getProp(item.disabled) || itemIsSubMenu(item) && getProp(item.subMenu).length === 0;
}

function onHoverDebounced(target, action) {
    var timeout;
    target.addEventListener("mouseenter", (function(e) {
        timeout = setTimeout((function() {
            return action(e);
        }), 150);
    }));
    target.addEventListener("mouseleave", (function() {
        return clearTimeout(timeout);
    }));
}

function generateMenu(ctxMenu) {
    var menu = document.createElement("ul");
    menu.className = "ctxmenu";
    menu.append.apply(menu, ctxMenu.map(generateMenuItem));
    if (ctxMenu.length === 0) menu.style.display = "none";
    var noop = function(e) {
        e.stopPropagation();
        e.preventDefault();
    };
    menu.addEventListener("contextmenu", noop);
    menu.addEventListener("click", noop);
    return menu;
}

function generateMenuItem(item) {
    var li = document.createElement("li");
    populateClassList([ [ itemIsDivider, "divider", false ], [ function(item) {
        return item.icon;
    }, "icon", true ], [ itemIsHeading, "heading", false ], [ itemIsSubMenu, "submenu", true ], [ isDisabled, "disabled", false ], [ itemIsInteractive, "interactive", true ] ], item, li);
    if (itemIsDivider(item)) return li;
    [ makeInnerHTML, makeAttributes, makeIcon, addEventHandlers, makeAnchor ].forEach((function(step) {
        return step.call(null, item, li);
    }));
    return li;
}

function populateClassList(rules, item, li) {
    rules.filter((function(_a) {
        var matcher = _a[0];
        return matcher(item);
    })).every((function(_a) {
        _a[0];
        var className = _a[1], supportsSubSequent = _a[2];
        return !void li.classList.add(className) && supportsSubSequent;
    }));
}

function makeInnerHTML(_a, li) {
    var _b;
    var html = _a.html, text = _a.text, element = _a.element;
    var elem = getProp(element);
    elem ? li.append(elem) : li.innerHTML = (_b = getProp(html)) !== null && _b !== void 0 ? _b : "<span>".concat(getProp(text), "</span>");
}

function makeAttributes(_a, li) {
    var tooltip = _a.tooltip, style = _a.style;
    li.title = getProp(tooltip) || "";
    if (style) li.setAttribute("style", getProp(style));
}

function makeIcon(_a, li) {
    var icon = _a.icon;
    icon && (li.innerHTML += '<img class="icon" src="'.concat(getProp(icon), '" />'));
}

function addEventHandlers(item, li) {
    for (var _i = 0, _a = Object.entries(getProp(item.events) || {}); _i < _a.length; _i++) {
        var _b = _a[_i], event_1 = _b[0], handler = _b[1];
        var _c = typeof handler === "function" ? {
            listener: handler,
            options: {}
        } : handler, listener = _c.listener, options = _c.options;
        li.addEventListener(event_1, listener, options);
    }
    li.addEventListener("click", (function(e) {
        if (isDisabled(item) || itemIsSubMenu(item)) return;
        itemIsAction(item) && item.action(e);
        itemIsInteractive(item) && ctxmenu.hide();
    }));
}

function makeAnchor(item, li) {
    if (!itemIsAnchor(item) || isDisabled(item)) return;
    var href = item.href, download = item.download, target = item.target;
    var a = document.createElement("a");
    a.innerHTML = li.innerHTML;
    a.href = getProp(href);
    download !== void 0 && (a.download = getProp(download));
    target && (a.target = getProp(target));
    li.replaceChildren(a);
}

var hdir = "r";

var vdir = "d";

function resetDirections() {
    hdir = "r";
    vdir = "d";
}

function setPosition(container, parentOrEvent) {
    var scale = getScale();
    var _a = window.visualViewport, width = _a.width, height = _a.height;
    Object.assign(container.style, {
        maxHeight: height / scale.y + "px",
        maxWidth: width / scale.x + "px"
    });
    var rect = getUnmountedBoundingRect(container);
    rect.width = Math.trunc(rect.width) + 1;
    rect.height = Math.trunc(rect.height) + 1;
    var pos = {
        x: 0,
        y: 0
    };
    if (parentOrEvent instanceof Element) {
        var _b = getBoundingRect(parentOrEvent), x = _b.x, width_1 = _b.width, y = _b.y;
        pos = {
            x: hdir === "r" ? x + width_1 : x - rect.width,
            y: y
        };
        if (parentOrEvent.className.includes("submenu")) pos.y += vdir === "d" ? 4 : -12;
        var safePos = getPosition(rect, pos);
        if (pos.x !== safePos.x) {
            hdir = hdir === "r" ? "l" : "r";
            pos.x = hdir === "r" ? x + width_1 : x - rect.width;
        }
        if (pos.y !== safePos.y) {
            vdir = vdir === "u" ? "d" : "u";
            pos.y = safePos.y;
        }
        pos = getPosition(rect, pos);
    } else {
        var hasTransform = document.body.style.transform !== "";
        var body = hasTransform ? document.body.getBoundingClientRect() : {
            x: 0,
            y: 0
        };
        pos = getPosition(rect, {
            x: (parentOrEvent.clientX - body.x) / scale.x,
            y: (parentOrEvent.clientY - body.y) / scale.y
        });
    }
    Object.assign(container.style, {
        left: pos.x + "px",
        top: pos.y + "px",
        width: rect.width + "px",
        height: rect.height + "px"
    });
}

function getPosition(rect, pos) {
    var _a = window.visualViewport, width = _a.width, height = _a.height;
    var hasTransform = document.body.style.transform !== "";
    var _b = hasTransform ? document.body.getBoundingClientRect() : {
        left: 0,
        top: 0
    }, left = _b.left, top = _b.top;
    var scale = getScale();
    var minX = -left / scale.x;
    var minY = -top / scale.y;
    var maxX = (width - left) / scale.x;
    var maxY = (height - top) / scale.y;
    return {
        x: hdir === "r" ? pos.x + rect.width > maxX ? maxX - rect.width : pos.x : pos.x < minX ? minX : pos.x,
        y: vdir === "d" ? pos.y + rect.height > maxY ? maxY - rect.height : pos.y : pos.y < minY ? minY : pos.y + rect.height > maxY ? maxY - rect.height : pos.y
    };
}

function getUnmountedBoundingRect(elem) {
    var container = elem.cloneNode(true);
    container.style.visibility = "hidden";
    document.body.appendChild(container);
    var result = getBoundingRect(container);
    document.body.removeChild(container);
    return result;
}

function getBoundingRect(elem) {
    var x = elem.offsetLeft, y = elem.offsetTop, height = elem.offsetHeight, width = elem.offsetWidth;
    if (elem.offsetParent instanceof HTMLElement) {
        var parent_1 = getBoundingRect(elem.offsetParent);
        return {
            x: x + parent_1.x,
            y: y + parent_1.y,
            width: width,
            height: height
        };
    }
    return {
        x: x,
        y: y,
        width: width,
        height: height
    };
}

function getScale() {
    var body = document.body;
    var rect = body.getBoundingClientRect();
    return {
        x: rect.width / body.offsetWidth,
        y: rect.height / body.offsetHeight
    };
}

var styles = 'html{min-height:100%}.ctxmenu{position:fixed;border:1px solid #999;padding:2px 0;box-shadow:#aaa 3px 3px 3px;background:#fff;margin:0;z-index:9999;overflow-y:auto;font:15px Verdana,sans-serif;box-sizing:border-box}.ctxmenu li{margin:1px 0;display:block;position:relative;user-select:none}.ctxmenu li.heading{font-weight:bold;margin-left:-5px}.ctxmenu li span{display:block;padding:2px 20px;cursor:default}.ctxmenu li a{color:inherit;text-decoration:none}.ctxmenu li.icon{padding-left:15px}.ctxmenu img.icon{position:absolute;width:18px;left:10px;top:2px}.ctxmenu li.disabled{color:#ccc}.ctxmenu li.divider{border-bottom:1px solid #aaa;margin:5px 0}.ctxmenu li.interactive:hover{background:rgba(0,0,0,.1)}.ctxmenu li.submenu::after{content:"";position:absolute;display:block;top:0;bottom:0;right:.4em;margin:auto .1rem auto auto;border:solid #000;border-width:1px 1px 0 0;transform:rotate(45deg);width:.3rem;height:.3rem}.ctxmenu li.submenu.disabled::after{border-color:#ccc}';

/*! ctxMenu v1.6.2 | (c) Nikolaj Kappler | https://github.com/nkappler/ctxmenu/blob/master/LICENSE !*/ var ContextMenu = function() {
    function ContextMenu() {
        var _this = this;
        this.cache = {};
        this.preventCloseOnScroll = false;
        window.addEventListener("click", (function() {
            return void _this.hide();
        }));
        window.addEventListener("resize", (function() {
            return void _this.hide();
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
        window.addEventListener("keydown", (function(e) {
            if (e.key === "Escape") _this.hide();
        }));
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
    ContextMenu.prototype.attach = function(target, ctxMenu, _config) {
        var _this = this;
        if (_config === void 0) _config = {};
        if (typeof _config === "function") return this.attach(target, ctxMenu, {
            onBeforeShow: _config
        });
        var config = this.getConfig(_config);
        var t = document.querySelector(target);
        if (this.cache[target] !== void 0) {
            console.error("target element ".concat(target, " already has a context menu assigned. Use ContextMenu.update() intstead."));
            return;
        }
        if (!t) {
            console.error("target element ".concat(target, " not found"));
            return;
        }
        var handler = function(e) {
            var newMenu = config.onBeforeShow(__spreadArray([], ctxMenu, true), e);
            _this.show(newMenu, e, config);
        };
        this.cache[target] = {
            ctxMenu: ctxMenu,
            handler: handler,
            config: config
        };
        t.addEventListener("contextmenu", handler);
    };
    ContextMenu.prototype.update = function(target, ctxMenu, _config) {
        if (_config === void 0) _config = {};
        if (typeof _config === "function") return this.update(target, ctxMenu, {
            onBeforeShow: _config
        });
        var o = this.cache[target];
        var config = __assign(__assign({}, o === null || o === void 0 ? void 0 : o.config), _config);
        var t = document.querySelector(target);
        o && (t === null || t === void 0 ? void 0 : t.removeEventListener("contextmenu", o.handler));
        delete this.cache[target];
        this.attach(target, ctxMenu || (o === null || o === void 0 ? void 0 : o.ctxMenu) || [], config);
    };
    ContextMenu.prototype.delete = function(target) {
        var o = this.cache[target];
        if (!o) return console.error("no context menu for target element ".concat(target, " found"));
        delete this.cache[target];
        var t = document.querySelector(target);
        if (!t) return console.error("target element ".concat(target, " does not exist (anymore)"));
        t.removeEventListener("contextmenu", o.handler);
    };
    ContextMenu.prototype.show = function(ctxMenu, eventOrElement, _config) {
        var _this = this;
        if (eventOrElement instanceof MouseEvent) eventOrElement.stopImmediatePropagation();
        this.hide();
        var config = this.getConfig(_config);
        this.onHide = config.onHide;
        this.onBeforeHide = config.onBeforeHide;
        this.menu = this.generateDOM(__spreadArray([], ctxMenu, true), eventOrElement);
        document.body.appendChild(this.menu);
        config.onShow(this.menu);
        this.menu.addEventListener("wheel", (function() {
            return void (_this.preventCloseOnScroll = true);
        }), {
            passive: true
        });
        if (eventOrElement instanceof MouseEvent) eventOrElement.preventDefault();
    };
    ContextMenu.prototype.hide = function(menu) {
        var _a, _b;
        if (menu === void 0) menu = this.menu;
        (_a = this.onBeforeHide) === null || _a === void 0 ? void 0 : _a.call(this, menu);
        resetDirections();
        if (!menu) return;
        if (menu === this.menu) delete this.menu;
        menu.remove();
        (_b = this.onHide) === null || _b === void 0 ? void 0 : _b.call(this, menu);
        this.onBeforeHide = void 0;
        this.onHide = void 0;
    };
    ContextMenu.prototype.getConfig = function(config) {
        if (config === void 0) config = {};
        return __assign({
            onBeforeShow: function(m) {
                return m;
            },
            onBeforeHide: function() {},
            onShow: function() {},
            onHide: function() {}
        }, config);
    };
    ContextMenu.prototype.generateDOM = function(ctxMenu, parentOrEvent) {
        var _this = this;
        var container = generateMenu(ctxMenu);
        setPosition(container, parentOrEvent);
        ctxMenu.forEach((function(item, i) {
            var li = container.children[i];
            onHoverDebounced(li, (function() {
                var _a;
                var subMenu = (_a = li.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector("ul");
                if (subMenu && subMenu.parentElement !== li) _this.hide(subMenu);
            }));
            if (isDisabled(item)) return;
            if (!itemIsSubMenu(item)) return;
            onHoverDebounced(li, (function() {
                if (li.querySelector("ul")) return;
                li.appendChild(_this.generateDOM(getProp(item.subMenu), li));
            }));
        }));
        return container;
    };
    ContextMenu.addStylesToDom = function() {
        if (document.readyState === "loading") return document.addEventListener("readystatechange", this.addStylesToDom, {
            once: true
        });
        var style = document.createElement("style");
        style.innerHTML = styles;
        document.head.insertBefore(style, document.head.childNodes[0]);
    };
    return ContextMenu;
}();

var ctxmenu = ContextMenu.getInstance();

exports.ctxmenu = ctxmenu;
