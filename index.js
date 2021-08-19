"use strict";
/*! ctxMenu v1.2.0 | (c) Nikolaj Kappler | https://github.com/nkappler/ctxmenu/blob/master/LICENSE !*/

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ctxmenu = void 0;

var ContextMenu = /*#__PURE__*/function () {
  function ContextMenu() {
    var _this = this;

    _classCallCheck(this, ContextMenu);

    this.cache = {};
    this.hdir = "r";
    this.vdir = "d";
    window.addEventListener("click", function (ev) {
      var item = ev.target instanceof Element && ev.target.parentElement;

      if (item && item.className === "interactive") {
        return;
      }

      _this.closeMenu();
    });
    window.addEventListener("resize", function () {
      return _this.closeMenu();
    });
    window.addEventListener("scroll", function () {
      return _this.closeMenu();
    });
    ContextMenu.addStylesToDom();
  }

  _createClass(ContextMenu, [{
    key: "attach",
    value: function attach(target, ctxMenu) {
      var _this2 = this;

      var beforeRender = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (m) {
        return m;
      };
      var t = document.querySelector(target);

      if (this.cache[target] !== undefined) {
        console.error("target element ".concat(target, " already has a context menu assigned. Use ContextMenu.update() intstead."));
        return;
      }

      if (!t) {
        console.error("target element ".concat(target, " not found"));
        return;
      }

      var handler = function handler(e) {
        e.stopImmediatePropagation();

        _this2.closeMenu();

        var newMenu = beforeRender(_toConsumableArray(ctxMenu), e);
        _this2.menu = _this2.generateDOM(newMenu, e);
        document.body.appendChild(_this2.menu);
        e.preventDefault();
      };

      this.cache[target] = {
        ctxmenu: ctxMenu,
        handler: handler,
        beforeRender: beforeRender
      };
      t.addEventListener("contextmenu", handler);
    }
  }, {
    key: "update",
    value: function update(target, ctxMenu, beforeRender) {
      var o = this.cache[target];
      var t = document.querySelector(target);
      o && (t === null || t === void 0 ? void 0 : t.removeEventListener("contextmenu", o.handler));
      delete this.cache[target];
      this.attach(target, ctxMenu || (o === null || o === void 0 ? void 0 : o.ctxmenu) || [], beforeRender || (o === null || o === void 0 ? void 0 : o.beforeRender));
    }
  }, {
    key: "delete",
    value: function _delete(target) {
      var o = this.cache[target];

      if (!o) {
        console.error("no context menu for target element ".concat(target, " found"));
        return;
      }

      var t = document.querySelector(target);

      if (!t) {
        console.error("target element ".concat(target, " does not exist (anymore)"));
        return;
      }

      t.removeEventListener("contextmenu", o.handler);
      delete this.cache[target];
    }
  }, {
    key: "closeMenu",
    value: function closeMenu() {
      var menu = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.menu;

      var _a;

      this.hdir = "r";
      this.vdir = "d";

      if (menu) {
        if (menu === this.menu) {
          delete this.menu;
        }

        (_a = menu.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(menu);
      }
    }
  }, {
    key: "debounce",
    value: function debounce(target, action) {
      var timeout;
      target.addEventListener("mouseenter", function (e) {
        timeout = setTimeout(function () {
          return action(e);
        }, 150);
      });
      target.addEventListener("mouseleave", function () {
        return clearTimeout(timeout);
      });
    }
  }, {
    key: "generateDOM",
    value: function generateDOM(ctxMenu, parentOrEvent) {
      var _this3 = this;

      var container = document.createElement("ul");

      if (ctxMenu.length === 0) {
        container.style.display = "none";
      }

      ctxMenu.forEach(function (item) {
        var li = document.createElement("li");

        _this3.debounce(li, function () {
          var _a;

          var subMenu = (_a = li.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector("ul");

          if (subMenu && subMenu.parentElement !== li) {
            _this3.closeMenu(subMenu);
          }
        });

        if (ContextMenu.itemIsDivider(item)) {
          li.className = "divider";
        } else {
          var html = ContextMenu.getProp(item.html);
          var text = "<span>".concat(ContextMenu.getProp(item.text), "</span>");
          var elem = ContextMenu.getProp(item.element);
          elem ? li.append(elem) : li.innerHTML = html ? html : text;
          li.title = ContextMenu.getProp(item.tooltip) || "";

          if (ContextMenu.itemIsInteractive(item)) {
            if (!ContextMenu.getProp(item.disabled)) {
              li.classList.add("interactive");

              if (ContextMenu.itemIsAction(item)) {
                li.addEventListener("click", function (e) {
                  item.action(e);

                  _this3.closeMenu();
                });
              } else if (ContextMenu.itemIsAnchor(item)) {
                var a = document.createElement("a");
                elem ? a.append(elem) : a.innerHTML = html ? html : text;

                a.onclick = function () {
                  return _this3.closeMenu();
                };

                a.href = ContextMenu.getProp(item.href);

                if (item.hasOwnProperty("download")) {
                  a.download = ContextMenu.getProp(item.download);
                }

                if (item.hasOwnProperty("target")) {
                  a.target = ContextMenu.getProp(item.target);
                }

                li.childNodes.forEach(function (n) {
                  return n.remove();
                });
                li.append(a);
              } else if (ContextMenu.itemIsSubMenu(item)) {
                if (ContextMenu.getProp(item.subMenu).length === 0) {
                  li.classList.add("disabled");
                } else {
                  li.classList.add("submenu");

                  _this3.debounce(li, function (ev) {
                    var subMenu = li.querySelector("ul");

                    if (!subMenu) {
                      _this3.openSubMenu(ev, ContextMenu.getProp(item.subMenu), li);
                    }
                  });
                }
              }
            } else {
              li.classList.add("disabled");

              if (ContextMenu.itemIsSubMenu(item)) {
                li.classList.add("submenu");
              }
            }
          } else {
            li.style.fontWeight = "bold";
            li.style.marginLeft = "-5px";
          }

          if (ContextMenu.getProp(item.icon)) {
            li.classList.add("icon");
            li.innerHTML += "<img class=\"icon\" src=\"".concat(ContextMenu.getProp(item.icon), "\" />");
          }
        }

        container.appendChild(li);
      });
      container.style.position = "fixed";
      container.className = "ctxmenu";
      var rect = ContextMenu.getBounding(container);
      var pos = {
        x: 0,
        y: 0
      };

      if (parentOrEvent instanceof Element) {
        var parentRect = parentOrEvent.getBoundingClientRect();
        pos = {
          x: this.hdir === "r" ? parentRect.left + parentRect.width : parentRect.left - rect.width,
          y: parentRect.top + (this.vdir === "d" ? 4 : -12)
        };
        var savePos = this.getPosition(rect, pos);

        if (pos.x !== savePos.x) {
          this.hdir = this.hdir === "r" ? "l" : "r";
          pos.x = this.hdir === "r" ? parentRect.left + parentRect.width : parentRect.left - rect.width;
        }

        if (pos.y !== savePos.y) {
          this.vdir = this.vdir === "u" ? "d" : "u";
          pos.y = savePos.y;
        }

        pos = this.getPosition(rect, pos);
      } else {
        pos = this.getPosition(rect, {
          x: parentOrEvent.clientX,
          y: parentOrEvent.clientY
        });
      }

      container.style.left = pos.x + "px";
      container.style.top = pos.y + "px";
      container.addEventListener("contextmenu", function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
      });
      container.addEventListener("click", function (ev) {
        var item = ev.target instanceof Element && ev.target.parentElement;

        if (item && item.className !== "interactive") {
          ev.stopPropagation();
        }
      });
      return container;
    }
  }, {
    key: "openSubMenu",
    value: function openSubMenu(e, ctxMenu, listElement) {
      var _a;

      var subMenu = (_a = listElement.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector("li > ul");

      if (subMenu && subMenu.parentElement !== listElement) {
        this.closeMenu(subMenu);
      }

      listElement.appendChild(this.generateDOM(ctxMenu, listElement));
    }
  }, {
    key: "getPosition",
    value: function getPosition(rect, pos) {
      return {
        x: this.hdir === "r" ? pos.x + rect.width > window.innerWidth ? window.innerWidth - rect.width : pos.x : pos.x < 0 ? 0 : pos.x,
        y: this.vdir === "d" ? pos.y + rect.height > window.innerHeight ? window.innerHeight - rect.height : pos.y : pos.y < 0 ? 0 : pos.y
      };
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!ContextMenu.instance) {
        ContextMenu.instance = new ContextMenu();
      }

      return ContextMenu.instance;
    }
  }, {
    key: "getBounding",
    value: function getBounding(elem) {
      var container = elem.cloneNode(true);
      container.style.visibility = "hidden";
      document.body.appendChild(container);
      var result = container.getBoundingClientRect();
      document.body.removeChild(container);
      return result;
    }
  }, {
    key: "getProp",
    value: function getProp(prop) {
      return typeof prop === "function" ? prop() : prop;
    }
  }, {
    key: "itemIsInteractive",
    value: function itemIsInteractive(item) {
      return this.itemIsAction(item) || this.itemIsAnchor(item) || this.itemIsSubMenu(item) || this.itemIsCustom(item);
    }
  }, {
    key: "itemIsAction",
    value: function itemIsAction(item) {
      return item.hasOwnProperty("action");
    }
  }, {
    key: "itemIsAnchor",
    value: function itemIsAnchor(item) {
      return item.hasOwnProperty("href");
    }
  }, {
    key: "itemIsDivider",
    value: function itemIsDivider(item) {
      return item.hasOwnProperty("isDivider");
    }
  }, {
    key: "itemIsSubMenu",
    value: function itemIsSubMenu(item) {
      return item.hasOwnProperty("subMenu");
    }
  }, {
    key: "itemIsCustom",
    value: function itemIsCustom(item) {
      return item.hasOwnProperty("html") || item.hasOwnProperty("element");
    }
  }, {
    key: "addStylesToDom",
    value: function addStylesToDom() {
      var _append = function append() {
        var styles = {
          ".ctxmenu": {
            border: "1px solid #999",
            padding: "2px 0",
            boxShadow: "3px 3px 3px #aaa",
            background: "#fff",
            margin: "0",
            fontSize: "15px",
            fontFamily: "Verdana, sans-serif",
            zIndex: "9999"
          },
          ".ctxmenu li": {
            margin: "1px 0",
            display: "block",
            position: "relative"
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
        var rules = Object.entries(styles).map(function (s) {
          return "".concat(s[0], " { ").concat(Object.assign(document.createElement("p").style, s[1]).cssText, " }");
        });
        var styleSheet = document.head.insertBefore(document.createElement("style"), document.head.childNodes[0]);
        rules.forEach(function (r) {
          var _a;

          return (_a = styleSheet.sheet) === null || _a === void 0 ? void 0 : _a.insertRule(r);
        });

        _append = function append() {};
      };

      if (document.readyState !== "loading") {
        _append();
      } else {
        document.addEventListener("readystatechange", function () {
          if (document.readyState !== "loading") {
            _append();
          }
        });
      }
    }
  }]);

  return ContextMenu;
}();

exports.ctxmenu = ContextMenu.getInstance();
