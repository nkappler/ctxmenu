describe("CTXMenu", () => {

    describe("setup", () => {
        it("global is available", () => {
            expect(window.ctxmenu).toBeDefined();
        });

        it("stylesheet is attached only once and as first stylesheet", () => {
            // Trigger style addition by showing a menu (styles are lazy-loaded on first show)
            window.ctxmenu.show(defaultMenuDeclaration, document.body);
            window.ctxmenu.hide();
            
            const findCTXRule = (sheet: CSSStyleSheet) => Array.from(sheet.cssRules).find(rule => rule.cssText.startsWith(".ctxmenu"));
            const sheets = Array.from(document.styleSheets);
            expect(sheets.filter(findCTXRule).length).toEqual(1);
            expect(sheets.findIndex(findCTXRule)).toEqual(0);
        });

        it("cache of handlers is private and cannot be messed with", () => {
            expect((window.ctxmenu as any).cache).toBeUndefined();
        });

        it("only public API should be exposed", () => {
            expect(Object.keys(window.ctxmenu)).toEqual(["attach", "delete", "hide", "show", "update", "setNonce"]);
        });
    });

    describe("setNonce method", () => {
        it("logs error when called after styles have been added to DOM", () => {
            error.and.stub();
            
            // First show a menu to add styles to DOM
            window.ctxmenu.show(defaultMenuDeclaration, document.body);
            window.ctxmenu.hide();
            
            // Now try to set nonce - should log error
            window.ctxmenu.setNonce('test-nonce');
            expect(console.error).toHaveBeenCalledWith('setNonce must be called before the first menu is shown. The nonce will have no effect.');
        });

        it("applies nonce attribute to style element when styles are added", () => {
            // Show a menu to add styles to DOM
            window.ctxmenu.show(defaultMenuDeclaration, document.body);
            window.ctxmenu.hide();
            
            // Find the ctxmenu style element (should be the first stylesheet)
            const styleElements = Array.from(document.head.querySelectorAll('style'));
            const ctxmenuStyle = styleElements.find(style => style.innerHTML.includes('.ctxmenu'));
            
            expect(ctxmenuStyle).toBeDefined();
            expect(ctxmenuStyle).not.toBeNull();
            
            // The nonce attribute should exist (even if empty string by default)
            if (ctxmenuStyle) {
                expect(ctxmenuStyle.hasAttribute('nonce')).toBe(true);
            }
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
            window.ctxmenu.show(defaultMenuDeclaration, new MouseEvent("click", { clientX: 50, clientY: 50 }));
            const menuBounds = getMenu().getBoundingClientRect();

            expect(50).toEqual(Math.round(menuBounds.left));
            expect(50).toEqual(Math.round(menuBounds.top));
        });

        it("closes any other open menus (multiple menus at once are not supported)", () => {
            window.ctxmenu.show(defaultMenuDeclaration, new MouseEvent("click", { clientX: 50, clientY: 50 }));
            expect(document.querySelectorAll(".ctxmenu").length).toEqual(1);

            window.ctxmenu.show(defaultMenuDeclaration, new MouseEvent("click", { clientX: 150, clientY: 150 }));
            expect(document.querySelectorAll(".ctxmenu").length).toEqual(1);
        });
    });

    describe("hide method", () => {
        it("closes any open menu", () => {
            window.ctxmenu.show(defaultMenuDeclaration, new MouseEvent("click", { clientX: 50, clientY: 50 }));
            expect(document.querySelectorAll(".ctxmenu").length).toEqual(1);

            window.ctxmenu.hide();
            expect(document.querySelectorAll(".ctxmenu").length).toEqual(0);
        });

        it("does not throw when no menus are open", () => {
            window.ctxmenu.show(defaultMenuDeclaration, new MouseEvent("click", { clientX: 50, clientY: 50 }));
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

    describe("lifecycle methods", () => {
        const onBeforeHide = jasmine.createSpy("onBeforeHide").and.callFake(() =>
            expect(getMenu).withContext("onBeforeHide must be called before menu is hidden").not.toThrow());
        const onHide = jasmine.createSpy("onHide").and.callFake(() =>
            expect(getMenu).withContext("onHide must be called after menu is hidden").toThrow());
        const onBeforeShow = jasmine.createSpy("onBeforeShow").and.callFake(m => {
            expect(getMenu).withContext("onBeforeShow must be called before menu is shown").toThrow();
            return m;
        });
        const onShow = jasmine.createSpy("onShow").and.callFake(() =>
            expect(getMenu).withContext("onShow must be called after menu is shown").not.toThrow());

        const config = {
            onBeforeHide,
            onBeforeShow,
            onHide,
            onShow
        };

        beforeEach(() => {
            onBeforeHide.calls.reset();
            onHide.calls.reset();
            onBeforeShow.calls.reset();
            onShow.calls.reset();
        });

        describe("using attach", () => {

            it("are called in correct order", () => {
                window.ctxmenu.attach("#TARGET", defaultMenuDeclaration, config);

                getTarget().dispatchEvent(new MouseEvent("contextmenu"));
                expect(getMenu().childElementCount).toBe(3);
                expect(onShow).toHaveBeenCalled();
                expect(onBeforeShow).toHaveBeenCalledBefore(onShow);
                expect(onBeforeHide).not.toHaveBeenCalled();
                expect(onHide).not.toHaveBeenCalled();

                window.dispatchEvent(new MouseEvent("click"));
                expect(getMenu).toThrow();
                expect(onHide).toHaveBeenCalled();
                expect(onBeforeHide).toHaveBeenCalledBefore(onHide);
            });

            it("are only called for corresponding menu", () => {
                window.ctxmenu.attach("#TARGET", defaultMenuDeclaration, config);
                window.ctxmenu.attach("body", [{ isDivider: true }]);

                getTarget().dispatchEvent(new MouseEvent("contextmenu"));
                expect(getMenu().childElementCount).toBe(3);
                expect(onShow).toHaveBeenCalled();
                expect(onBeforeShow).toHaveBeenCalledBefore(onShow);
                expect(onBeforeHide).not.toHaveBeenCalled();
                expect(onHide).not.toHaveBeenCalled();

                window.dispatchEvent(new MouseEvent("click"));
                expect(getMenu).toThrow();
                expect(onHide).toHaveBeenCalled();
                expect(onBeforeHide).toHaveBeenCalledBefore(onHide);

                document.body.dispatchEvent(new MouseEvent("contextmenu"));
                expect(getMenu().childElementCount).toBe(1);
                window.dispatchEvent(new MouseEvent("click"));
                expect(getMenu).toThrow();

                expect(onShow).toHaveBeenCalledTimes(1);
                expect(onBeforeShow).toHaveBeenCalledTimes(1);
                expect(onHide).toHaveBeenCalledTimes(1);
                expect(onBeforeHide).toHaveBeenCalledTimes(1);

                window.ctxmenu.delete("body");
            });

        });

        describe("using update", () => {
            it("to remove callbacks, are only called once", () => {
                window.ctxmenu.attach("#TARGET", defaultMenuDeclaration, config);

                getTarget().dispatchEvent(new MouseEvent("contextmenu"));
                expect(getMenu().childElementCount).toBe(3);
                expect(onShow).toHaveBeenCalled();
                expect(onBeforeShow).toHaveBeenCalledBefore(onShow);
                expect(onBeforeHide).not.toHaveBeenCalled();
                expect(onHide).not.toHaveBeenCalled();

                window.dispatchEvent(new MouseEvent("click"));
                expect(getMenu).toThrow();
                expect(onHide).toHaveBeenCalled();
                expect(onBeforeHide).toHaveBeenCalledBefore(onHide);

                window.ctxmenu.update("#TARGET", defaultMenuDeclaration, {
                    onBeforeHide: () => { },
                    onBeforeShow: m => m,
                    onHide: () => { },
                    onShow: () => { }
                });

                getTarget().dispatchEvent(new MouseEvent("contextmenu"));
                expect(getMenu().childElementCount).toBe(3);
                window.dispatchEvent(new MouseEvent("click"));
                expect(getMenu).toThrow();

                expect(onShow).toHaveBeenCalledTimes(1);
                expect(onBeforeShow).toHaveBeenCalledTimes(1);
                expect(onHide).toHaveBeenCalledTimes(1);
                expect(onBeforeHide).toHaveBeenCalledTimes(1);
            });

            it("to add or remove callbacks, one by one", () => {
                window.ctxmenu.attach("#TARGET", defaultMenuDeclaration);

                const cycleMenu = () => {
                    getTarget().dispatchEvent(new MouseEvent("contextmenu"));
                    expect(getMenu().childElementCount).toBe(3);
                    window.dispatchEvent(new MouseEvent("click"));
                    expect(getMenu).toThrow();
                }

                cycleMenu();
                expect(onShow).toHaveBeenCalledTimes(0);
                expect(onBeforeShow).toHaveBeenCalledTimes(0);
                expect(onBeforeHide).toHaveBeenCalledTimes(0);
                expect(onHide).toHaveBeenCalledTimes(0);

                window.ctxmenu.update("#TARGET", defaultMenuDeclaration, {
                    onShow
                });

                cycleMenu();
                expect(onShow).toHaveBeenCalledTimes(1);
                expect(onBeforeShow).toHaveBeenCalledTimes(0);
                expect(onBeforeHide).toHaveBeenCalledTimes(0);
                expect(onHide).toHaveBeenCalledTimes(0);

                window.ctxmenu.update("#TARGET", defaultMenuDeclaration, {
                    onShow: undefined,
                    onBeforeShow
                });

                cycleMenu();
                expect(onShow).toHaveBeenCalledTimes(1);
                expect(onBeforeShow).toHaveBeenCalledTimes(1);
                expect(onBeforeHide).toHaveBeenCalledTimes(0);
                expect(onHide).toHaveBeenCalledTimes(0);

                window.ctxmenu.update("#TARGET", defaultMenuDeclaration, {
                    onBeforeShow: undefined,
                    onBeforeHide
                });

                cycleMenu();
                expect(onShow).toHaveBeenCalledTimes(1);
                expect(onBeforeShow).toHaveBeenCalledTimes(1);
                expect(onBeforeHide).toHaveBeenCalledTimes(1);
                expect(onHide).toHaveBeenCalledTimes(0);

                window.ctxmenu.update("#TARGET", defaultMenuDeclaration, {
                    onBeforeHide: undefined,
                    onHide
                });

                cycleMenu();
                expect(onShow).toHaveBeenCalledTimes(1);
                expect(onBeforeShow).toHaveBeenCalledTimes(1);
                expect(onBeforeHide).toHaveBeenCalledTimes(1);
                expect(onHide).toHaveBeenCalledTimes(1);
            });
        });

        describe("using show", () => {

            it("are called in correct order", () => {
                showMenu(defaultMenuDeclaration, config);
                expect(getMenu().childElementCount).toBe(3);

                expect(onShow).toHaveBeenCalled();
                expect(onBeforeShow).toHaveBeenCalledBefore(onShow);
                expect(onBeforeHide).not.toHaveBeenCalled();
                expect(onHide).not.toHaveBeenCalled();

                window.dispatchEvent(new MouseEvent("click"));
                expect(getMenu).toThrow();
                expect(onHide).toHaveBeenCalled();
                expect(onBeforeHide).toHaveBeenCalledBefore(onHide);
            });


            it("are only called for corresponding menu", () => {
                showMenu(defaultMenuDeclaration, config);
                expect(getMenu().childElementCount).toBe(3);

                expect(onShow).toHaveBeenCalled();
                expect(onBeforeShow).toHaveBeenCalledBefore(onShow);
                expect(onBeforeHide).not.toHaveBeenCalled();
                expect(onHide).not.toHaveBeenCalled();

                window.dispatchEvent(new MouseEvent("click"));
                expect(getMenu).toThrow();
                expect(onHide).toHaveBeenCalled();
                expect(onBeforeHide).toHaveBeenCalledBefore(onHide);

                window.ctxmenu.show([{ isDivider: true }], document.querySelector("body")!);
                expect(getMenu().childElementCount).toBe(1);
                window.dispatchEvent(new MouseEvent("click"));
                expect(getMenu).toThrow();

                expect(onShow).toHaveBeenCalledTimes(1);
                expect(onBeforeShow).toHaveBeenCalledTimes(1);
                expect(onHide).toHaveBeenCalledTimes(1);
                expect(onBeforeHide).toHaveBeenCalledTimes(1);

                window.ctxmenu.delete("body");
            });
        });

        describe("menu definition can be altered in onBeforeShow", () => {
            it("using attach", () => {
                window.ctxmenu.attach("#TARGET", defaultMenuDeclaration, {
                    onBeforeShow: () => [{ isDivider: true } as const]
                });

                getTarget().dispatchEvent(new MouseEvent("contextmenu"));
                expect(getMenu().childElementCount).toBe(1);
            });

            it("using show", () => {
                showMenu(defaultMenuDeclaration, {
                    onBeforeShow: () => [{ isDivider: true }]
                });

                getTarget().dispatchEvent(new MouseEvent("contextmenu"));
                expect(getMenu().childElementCount).toBe(1);
            });
        });
    });
});
