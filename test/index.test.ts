/// <reference types="../standalone/ctxmenu" />

const defaultMenuDeclaration = [
    { text: "Heading" },
    { isDivider: true },
    { text: "Link", href: "javascript:void" }
];

const getTarget = (): HTMLElement => {
    const target = document.querySelector("#TARGET");
    if (target instanceof HTMLElement) return target;
    throw ("element #TARGET not found");
};

const getMenu = (): HTMLUListElement => {
    const menu = document.querySelector(".ctxmenu");
    if (menu instanceof HTMLUListElement) return menu;
    throw ("element .ctxmenu not found");
};

let error: jasmine.Spy;

const makeTarget = () => {
    const target = document.createElement("span");
    target.style.display = "inline-block";
    target.style.margin = "2rem";
    target.style.padding = "1rem";
    target.style.backgroundColor = "#55aaff";
    target.innerText = "TARGET";
    target.id = "TARGET";
    return target;
}

describe("CTXMenu", () => {
    beforeAll(async () => new Promise<void>((resolve, reject) => {
        error = spyOn(console, "error");
        const content = document.querySelector("#jasmine_content");
        if (!content) {
            return reject("element#jasmine_content not found.");
        }
        content.appendChild(makeTarget());

        let interval = setInterval(() => {
            if (window.ctxmenu) {
                resolve();
                clearInterval(interval);
            }
        });
    }));

    beforeEach(() =>  {
        expect(console.error).not.toHaveBeenCalled();
        expect(document.querySelector(".ctxmenu")).withContext("cleanup failed").toBeNull();
        getTarget().dispatchEvent(new MouseEvent("contextmenu"));
        expect(getMenu).toThrow();
    });

    afterEach(() =>  {
        window.ctxmenu.hide(); // todo should deleting an attached context menu also remove it from DOM? (probably should)
        error.and.stub();
        window.ctxmenu.delete("#TARGET");
        error.and.callThrough();
        error.calls.reset();
    });

    describe("setup", () => {
        it("global is available", () => {
            expect(window.ctxmenu).toBeDefined();
        });

        it("stylesheet is attached only once and as first stylesheet", () => {
            const findCTXRule = (sheet: CSSStyleSheet) => Array.from(sheet.cssRules).find(rule => rule.cssText.startsWith(".ctxmenu"));
            const sheets = Array.from(document.styleSheets);
            expect(sheets.filter(findCTXRule).length).toEqual(1);
            expect(sheets.findIndex(findCTXRule)).toEqual(0);
        });

        it("cache of handlers is private and cannot be messed with", () => {
            expect((window.ctxmenu as any).cache).toBeUndefined();
        });

        it("only public API should be exposed", () => {
            expect(Object.keys(window.ctxmenu)).toEqual(["attach", "delete", "hide", "show", "update"]);
        });
    });

    describe("show method", () => {
        it("immeadiately displays a menu", () => {
            window.ctxmenu.show(defaultMenuDeclaration, document.body);
            expect(document.querySelector(".ctxmenu")).toBeDefined();
        });

        it("passing a target element, menu appears next to the element", () => {
            const target = getTarget();
            window.ctxmenu.show(defaultMenuDeclaration, target);

            const targetBounds = target.getBoundingClientRect();
            const menuBounds = getMenu().getBoundingClientRect();

            expect(Math.round(targetBounds.right)).toEqual(menuBounds.left);
            expect(Math.round(targetBounds.top)).toEqual(menuBounds.top);
        });

        it("passing a MouseEvent, menu appears at event position", () => {
            window.ctxmenu.show(defaultMenuDeclaration, new MouseEvent("click", {clientX: 50, clientY: 50}));
            const menuBounds = getMenu().getBoundingClientRect();

            expect(50).toEqual(Math.round(menuBounds.left));
            expect(50).toEqual(Math.round(menuBounds.top));
        });

        it("closes any other open menus (multiple menus at once are not supported)", () => {
            window.ctxmenu.show(defaultMenuDeclaration, new MouseEvent("click", {clientX: 50, clientY: 50}));
            expect(document.querySelectorAll(".ctxmenu").length).toEqual(1);

            window.ctxmenu.show(defaultMenuDeclaration, new MouseEvent("click", {clientX: 150, clientY: 150}));
            expect(document.querySelectorAll(".ctxmenu").length).toEqual(1);
        });
    });

    describe("hide method", () => {
        it("closes any open menu", () => {
            window.ctxmenu.show(defaultMenuDeclaration, new MouseEvent("click", {clientX: 50, clientY: 50}));
            expect(document.querySelectorAll(".ctxmenu").length).toEqual(1);

            window.ctxmenu.hide();
            expect(document.querySelectorAll(".ctxmenu").length).toEqual(0);
        });

        it("does not throw when no menus are open", () => {
            window.ctxmenu.show(defaultMenuDeclaration, new MouseEvent("click", {clientX: 50, clientY: 50}));
            expect(document.querySelectorAll(".ctxmenu").length).toEqual(1);

            expect(() => window.ctxmenu.hide()).not.toThrow();
            expect(document.querySelectorAll(".ctxmenu").length).toEqual(0);
            expect(() => window.ctxmenu.hide()).not.toThrow();
        });
    });

    describe("attach method", () => {
        it("attaches menu to context menu handler", () => {
            window.ctxmenu.attach("#TARGET", defaultMenuDeclaration);
            getTarget().dispatchEvent(new MouseEvent("contextmenu"));

            expect(getMenu().childElementCount).toBe(3);
        });

        it("logs error when target already has a menu attached", () => {
            error.and.stub();

            window.ctxmenu.attach("#TARGET", defaultMenuDeclaration);
            expect(console.error).not.toHaveBeenCalled();
            window.ctxmenu.attach("#TARGET", defaultMenuDeclaration);
            expect(console.error).toHaveBeenCalledWith("target element #TARGET already has a context menu assigned. Use ContextMenu.update() intstead.");

        });

        it("logs error when target element is not found", () => {
            error.and.stub();

            window.ctxmenu.attach("#DOESNOTEXIST", defaultMenuDeclaration);
            expect(console.error).toHaveBeenCalledWith("target element #DOESNOTEXIST not found");
        });
    });

    describe("update method", () => {
        it("updates existing context menu", () => {
            window.ctxmenu.attach("#TARGET", defaultMenuDeclaration);
            window.ctxmenu.update("#TARGET", [...defaultMenuDeclaration, ...defaultMenuDeclaration]);
            getTarget().dispatchEvent(new MouseEvent("contextmenu"));

            expect(getMenu().childElementCount).toBe(6);
        });

        it("attaches context menu when none exists without logging an error", () => {
            window.ctxmenu.update("#TARGET", defaultMenuDeclaration);
            getTarget().dispatchEvent(new MouseEvent("contextmenu"));

            expect(getMenu().childElementCount).toBe(3);
            expect(console.error).not.toHaveBeenCalled();
        });
    });

    describe("delete method", () => {
        it("deletes existing context menu", () => {
            window.ctxmenu.attach("#TARGET", defaultMenuDeclaration);
            getTarget().dispatchEvent(new MouseEvent("contextmenu"));
            expect(getMenu().childElementCount).toBe(3);
            window.dispatchEvent(new MouseEvent("click"));
            expect(getMenu).toThrow();

            window.ctxmenu.delete("#TARGET");
            getTarget().dispatchEvent(new MouseEvent("contextmenu"));
            expect(getMenu).toThrow();
        });
        it("logs error when target has no menu attached", () => {
            error.and.stub();

            window.ctxmenu.delete("#TARGET");
            expect(console.error).toHaveBeenCalledWith('no context menu for target element #TARGET found');
        });
        it("logs error when target element is not found", () => {
            error.and.stub();

            window.ctxmenu.attach("#TARGET", defaultMenuDeclaration);
            const target = getTarget();
            const parent = target.parentElement;
            parent?.removeChild(target);

            window.ctxmenu.delete("#TARGET");
            expect(console.error).toHaveBeenCalledWith('target element #TARGET does not exist (anymore)');

            parent?.appendChild(makeTarget());
        });
        it("trying to delete a context menu for an element that doesn't exist anymore removes it from the cache", () => {
            error.and.stub();

            window.ctxmenu.attach("#TARGET", defaultMenuDeclaration);
            const target = getTarget();
            const parent = target.parentElement;
            parent?.removeChild(target);

            window.ctxmenu.delete("#TARGET");
            window.ctxmenu.delete("#TARGET");
            expect(error.calls.allArgs().flatMap(a => a)).toEqual([
                'target element #TARGET does not exist (anymore)',
                'no context menu for target element #TARGET found'
            ]);

            parent?.appendChild(makeTarget());
        });
    });
});