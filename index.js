"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, 
    k++) r[k] = a[j];
    return r;
}

function getProp(prop) {
    return "function" === typeof prop ? prop() : prop;
}

function itemIsInteractive(item) {
    return itemIsAction(item) || itemIsAnchor(item) || itemIsSubMenu(item) || itemIsCustom(item);
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

function isDisabled(item) {
    return getProp(item.disabled) || itemIsSubMenu(item) && 0 === item.subMenu.length;
}

function generateMenuItem(item) {
    var li = document.createElement("li");
    if (itemIsDivider(item)) {
        li.className = "divider";
        return li;
    }
    generateBaseItemContent(item, li);
    if (!itemIsInteractive(item)) {
        li.classList.add("heading");
        return li;
    }
    if (isDisabled(item)) {
        li.classList.add("disabled");
        if (itemIsSubMenu(item)) li.classList.add("submenu");
        return li;
    }
    li.classList.add("interactive");
    if (itemIsAnchor(item)) {
        var a = document.createElement("a");
        a.append.apply(a, Array.from(li.childNodes));
        a.href = getProp(item.href);
        if (item.hasOwnProperty("download")) a.download = getProp(item.download);
        if (item.hasOwnProperty("target")) a.target = getProp(item.target);
        li.append(a);
        return li;
    }
    if (itemIsAction(item)) {
        li.addEventListener("click", item.action);
        return li;
    }
    li.classList.add("submenu");
    return li;
}

function generateBaseItemContent(item, li) {
    var html = getProp(item.html);
    var text = "<span>" + getProp(item.text) + "</span>";
    var elem = getProp(item.element);
    elem ? li.append(elem) : li.innerHTML = html ? html : text;
    li.title = getProp(item.tooltip) || "";
    if (item.style) li.setAttribute("style", getProp(item.style));
    if (item.icon) {
        li.classList.add("icon");
        li.innerHTML += '<img class="icon" src="' + getProp(item.icon) + '" />';
    }
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
            x: "r" === hdir ? x + width_1 : x - rect.width,
            y: y
        };
        if (parentOrEvent.className.includes("submenu")) pos.y += "d" === vdir ? 4 : -12;
        var safePos = getPosition(rect, pos);
        if (pos.x !== safePos.x) {
            hdir = "r" === hdir ? "l" : "r";
            pos.x = "r" === hdir ? x + width_1 : x - rect.width;
        }
        if (pos.y !== safePos.y) {
            vdir = "u" === vdir ? "d" : "u";
            pos.y = safePos.y;
        }
        pos = getPosition(rect, pos);
    } else {
        var hasTransform = "" !== document.body.style.transform;
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
    var hasTransform = "" !== document.body.style.transform;
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
        x: "r" === hdir ? pos.x + rect.width > maxX ? maxX - rect.width : pos.x : pos.x < minX ? minX : pos.x,
        y: "d" === vdir ? pos.y + rect.height > maxY ? maxY - rect.height : pos.y : pos.y < minY ? minY : pos.y
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

var styles = 'html{min-height:100%}.ctxmenu{position:fixed;border:1px solid #999;padding:2px 0;box-shadow:#aaa 3px 3px 3px;background:#fff;margin:0;z-index:9999;overflow-y:auto;font:15px Verdana, sans-serif;box-sizing:border-box}.ctxmenu li{margin:1px 0;display:block;position:relative;user-select:none}.ctxmenu li.heading{font-weight:bold;margin-left:-5px}.ctxmenu li span{display:block;padding:2px 20px;cursor:default}.ctxmenu li a{color:inherit;text-decoration:none}.ctxmenu li.icon{padding-left:15px}.ctxmenu img.icon{position:absolute;width:18px;left:10px;top:2px}.ctxmenu li.disabled{color:#ccc}.ctxmenu li.divider{border-bottom:1px solid #aaa;margin:5px 0}.ctxmenu li.interactive:hover{background:rgba(0, 0, 0, .1)}.ctxmenu li.submenu::after{content:"";position:absolute;display:block;top:0;bottom:0;right:.4em;margin:auto .1rem auto auto;border-right:1px solid #000;border-top:1px solid #000;transform:rotate(45deg);width:.3rem;height:.3rem}.ctxmenu li.submenu.disabled::after{border-color:#ccc}';

/*! ctxMenu v1.5.0 | (c) Nikolaj Kappler | https://github.com/nkappler/ctxmenu/blob/master/LICENSE !*/ var ContextMenu = function() {
    function ContextMenu() {
        var _this = this;
        this.cache = {};
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
        window.addEventListener("keydown", (function(e) {
            if ("Escape" === e.key) _this.hide();
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
        resetDirections();
        if (menu) {
            if (menu === this.menu) delete this.menu;
            null === (_a = menu.parentElement) || void 0 === _a ? void 0 : _a.removeChild(menu);
        }
    };
    ContextMenu.prototype.generateDOM = function(ctxMenu, parentOrEvent) {
        var _this = this;
        var container = document.createElement("ul");
        if (0 === ctxMenu.length) container.style.display = "none";
        ctxMenu.forEach((function(item) {
            var li = generateMenuItem(item);
            onHoverDebounced(li, (function() {
                var _a;
                var subMenu = null === (_a = li.parentElement) || void 0 === _a ? void 0 : _a.querySelector("ul");
                if (subMenu && subMenu.parentElement !== li) _this.hide(subMenu);
            }));
            if (itemIsInteractive(item) && !isDisabled(item)) if (itemIsSubMenu(item)) onHoverDebounced(li, (function(ev) {
                var subMenu = li.querySelector("ul");
                if (!subMenu) _this.openSubMenu(ev, getProp(item.subMenu), li);
            })); else li.addEventListener("click", (function() {
                return _this.hide();
            }));
            container.appendChild(li);
        }));
        container.className = "ctxmenu";
        setPosition(container, parentOrEvent);
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
    ContextMenu.addStylesToDom = function() {
        var append = function() {
            if ("loading" === document.readyState) return document.addEventListener("readystatechange", append);
            var style = document.createElement("style");
            style.innerHTML = styles;
            document.head.insertBefore(style, document.head.childNodes[0]);
            append = function() {};
        };
        append();
    };
    return ContextMenu;
}();

var ctxmenu = ContextMenu.getInstance();

exports.ctxmenu = ctxmenu;
