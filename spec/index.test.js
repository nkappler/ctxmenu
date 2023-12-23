/// <reference types="../standalone/ctxmenu" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _this = this;
var defaultMenuDeclaration = [
    { text: "Heading" },
    { isDivider: true },
    { text: "Link", href: "javascript:void" }
];
var getTarget = function () {
    var target = document.querySelector("#TARGET");
    if (target instanceof HTMLElement)
        return target;
    throw ("element #TARGET not found");
};
var getMenu = function () {
    var menu = document.querySelector(".ctxmenu");
    if (menu instanceof HTMLUListElement)
        return menu;
    throw ("element .ctxmenu not found");
};
var error;
var makeTarget = function () {
    var target = document.createElement("span");
    target.style.display = "inline-block";
    target.style.margin = "2rem";
    target.style.padding = "1rem";
    target.style.backgroundColor = "#55aaff";
    target.innerText = "TARGET";
    target.id = "TARGET";
    return target;
};
describe("CTXMenu", function () {
    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    error = spyOn(console, "error");
                    var content = document.querySelector("#jasmine_content");
                    if (!content) {
                        return reject("element#jasmine_content not found.");
                    }
                    content.appendChild(makeTarget());
                    var interval = setInterval(function () {
                        if (window.ctxmenu) {
                            resolve();
                            clearInterval(interval);
                        }
                    });
                })];
        });
    }); });
    beforeEach(function () {
        expect(console.error).not.toHaveBeenCalled();
        expect(document.querySelector(".ctxmenu")).withContext("cleanup failed").toBeNull();
        getTarget().dispatchEvent(new MouseEvent("contextmenu"));
        expect(getMenu).toThrow();
    });
    afterEach(function () {
        window.ctxmenu.hide(); // todo should deleting an attached context menu also remove it from DOM? (probably should)
        error.and.stub();
        window.ctxmenu["delete"]("#TARGET");
        error.and.callThrough();
        error.calls.reset();
    });
    describe("setup", function () {
        it("global is available", function () {
            expect(window.ctxmenu).toBeDefined();
        });
        it("stylesheet is attached only once and as first stylesheet", function () {
            var findCTXRule = function (sheet) { return Array.from(sheet.cssRules).find(function (rule) { return rule.cssText.startsWith(".ctxmenu"); }); };
            var sheets = Array.from(document.styleSheets);
            expect(sheets.filter(findCTXRule).length).toEqual(1);
            expect(sheets.findIndex(findCTXRule)).toEqual(0);
        });
        it("cache of handlers is private and cannot be messed with", function () {
            expect(window.ctxmenu.cache).toBeUndefined();
        });
        it("only public API should be exposed", function () {
            expect(Object.keys(window.ctxmenu)).toEqual(["attach", "delete", "hide", "show", "update"]);
        });
    });
    describe("show method", function () {
        it("immeadiately displays a menu", function () {
            window.ctxmenu.show(defaultMenuDeclaration, document.body);
            expect(document.querySelector(".ctxmenu")).toBeDefined();
        });
        it("passing a target element, menu appears next to the element", function () {
            var target = getTarget();
            window.ctxmenu.show(defaultMenuDeclaration, target);
            var targetBounds = target.getBoundingClientRect();
            var menuBounds = getMenu().getBoundingClientRect();
            expect(Math.round(targetBounds.right)).toEqual(menuBounds.left);
            expect(Math.round(targetBounds.top)).toEqual(menuBounds.top);
        });
        it("passing a MouseEvent, menu appears at event position", function () {
            window.ctxmenu.show(defaultMenuDeclaration, new MouseEvent("click", { clientX: 50, clientY: 50 }));
            var menuBounds = getMenu().getBoundingClientRect();
            expect(50).toEqual(Math.round(menuBounds.left));
            expect(50).toEqual(Math.round(menuBounds.top));
        });
        it("closes any other open menus (multiple menus at once are not supported)", function () {
            window.ctxmenu.show(defaultMenuDeclaration, new MouseEvent("click", { clientX: 50, clientY: 50 }));
            expect(document.querySelectorAll(".ctxmenu").length).toEqual(1);
            window.ctxmenu.show(defaultMenuDeclaration, new MouseEvent("click", { clientX: 150, clientY: 150 }));
            expect(document.querySelectorAll(".ctxmenu").length).toEqual(1);
        });
    });
    describe("hide method", function () {
        it("closes any open menu", function () {
            window.ctxmenu.show(defaultMenuDeclaration, new MouseEvent("click", { clientX: 50, clientY: 50 }));
            expect(document.querySelectorAll(".ctxmenu").length).toEqual(1);
            window.ctxmenu.hide();
            expect(document.querySelectorAll(".ctxmenu").length).toEqual(0);
        });
        it("does not throw when no menus are open", function () {
            window.ctxmenu.show(defaultMenuDeclaration, new MouseEvent("click", { clientX: 50, clientY: 50 }));
            expect(document.querySelectorAll(".ctxmenu").length).toEqual(1);
            expect(function () { return window.ctxmenu.hide(); }).not.toThrow();
            expect(document.querySelectorAll(".ctxmenu").length).toEqual(0);
            expect(function () { return window.ctxmenu.hide(); }).not.toThrow();
        });
    });
    describe("attach method", function () {
        it("attaches menu to context menu handler", function () {
            window.ctxmenu.attach("#TARGET", defaultMenuDeclaration);
            getTarget().dispatchEvent(new MouseEvent("contextmenu"));
            expect(getMenu().childElementCount).toBe(3);
        });
        it("logs error when target already has a menu attached", function () {
            error.and.stub();
            window.ctxmenu.attach("#TARGET", defaultMenuDeclaration);
            expect(console.error).not.toHaveBeenCalled();
            window.ctxmenu.attach("#TARGET", defaultMenuDeclaration);
            expect(console.error).toHaveBeenCalledWith("target element #TARGET already has a context menu assigned. Use ContextMenu.update() intstead.");
        });
        it("logs error when target element is not found", function () {
            error.and.stub();
            window.ctxmenu.attach("#DOESNOTEXIST", defaultMenuDeclaration);
            expect(console.error).toHaveBeenCalledWith("target element #DOESNOTEXIST not found");
        });
    });
    describe("update method", function () {
        it("updates existing context menu", function () {
            window.ctxmenu.attach("#TARGET", defaultMenuDeclaration);
            window.ctxmenu.update("#TARGET", __spreadArray(__spreadArray([], defaultMenuDeclaration, true), defaultMenuDeclaration, true));
            getTarget().dispatchEvent(new MouseEvent("contextmenu"));
            expect(getMenu().childElementCount).toBe(6);
        });
        it("attaches context menu when none exists without logging an error", function () {
            window.ctxmenu.update("#TARGET", defaultMenuDeclaration);
            getTarget().dispatchEvent(new MouseEvent("contextmenu"));
            expect(getMenu().childElementCount).toBe(3);
            expect(console.error).not.toHaveBeenCalled();
        });
    });
    describe("delete method", function () {
        it("deletes existing context menu", function () {
            window.ctxmenu.attach("#TARGET", defaultMenuDeclaration);
            getTarget().dispatchEvent(new MouseEvent("contextmenu"));
            expect(getMenu().childElementCount).toBe(3);
            window.dispatchEvent(new MouseEvent("click"));
            expect(getMenu).toThrow();
            window.ctxmenu["delete"]("#TARGET");
            getTarget().dispatchEvent(new MouseEvent("contextmenu"));
            expect(getMenu).toThrow();
        });
        it("logs error when target has no menu attached", function () {
            error.and.stub();
            window.ctxmenu["delete"]("#TARGET");
            expect(console.error).toHaveBeenCalledWith('no context menu for target element #TARGET found');
        });
        it("logs error when target element is not found", function () {
            error.and.stub();
            window.ctxmenu.attach("#TARGET", defaultMenuDeclaration);
            var target = getTarget();
            var parent = target.parentElement;
            parent === null || parent === void 0 ? void 0 : parent.removeChild(target);
            window.ctxmenu["delete"]("#TARGET");
            expect(console.error).toHaveBeenCalledWith('target element #TARGET does not exist (anymore)');
            parent === null || parent === void 0 ? void 0 : parent.appendChild(makeTarget());
        });
        it("trying to delete a context menu for an element that doesn't exist anymore removes it from the cache", function () {
            error.and.stub();
            window.ctxmenu.attach("#TARGET", defaultMenuDeclaration);
            var target = getTarget();
            var parent = target.parentElement;
            parent === null || parent === void 0 ? void 0 : parent.removeChild(target);
            window.ctxmenu["delete"]("#TARGET");
            window.ctxmenu["delete"]("#TARGET");
            expect(error.calls.allArgs().flatMap(function (a) { return a; })).toEqual([
                'target element #TARGET does not exist (anymore)',
                'no context menu for target element #TARGET found'
            ]);
            parent === null || parent === void 0 ? void 0 : parent.appendChild(makeTarget());
        });
    });
});
