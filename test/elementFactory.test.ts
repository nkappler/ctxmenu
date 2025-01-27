const stringifyAttribute = ({ name, value }: Attr) => `${name}="${value}"`;
const stringifyAttributes = ({ attributes }: Element) => Array.from(attributes).map(stringifyAttribute).sort();

const timeout = window.setTimeout;

/**
 * Although this suite tests code specifically from the element factory,
 * we won't call it directly but use only the public API until deemed necessary
 */
describe("ElementFactory", () => {

    beforeAll(() => {
        // disable timeout for opening submenu
        (window.setTimeout as any) = (callback: Function, _timeout: number) => callback() as any;
    });

    describe("container", () => {
        it("clicking it has no effect", () => {
            showMenu([
                { text: "Hello World" }
            ]);
            const menu = getMenu();
            menu.click();
            expect(getMenu).not.toThrow();
        });
    });

    describe("property callbacks", () => {

        it("are executed just before the menu opens", () => {
            const getText = jasmine.createSpy().and.callFake(() => {
                expect(getMenu).toThrow();
                return "Hello World from a callback!";
            });
            window.ctxmenu.attach("#TARGET", [
                { text: getText },
            ]);
            expect(getText).not.toHaveBeenCalled();

            getTarget().dispatchEvent(new MouseEvent("contextmenu"));

            expect(getText).toHaveBeenCalledTimes(1);
            const li = getMenu().firstElementChild!;
            expect(li.innerHTML).toEqual("<span>Hello World from a callback!</span>");
        });
    });

    describe("Item Types", () => {

        describe("heading", () => {
            beforeEach(() => showMenu([
                { text: "Hello World" },
                { text: () => "Hello World" },
            ]));

            it("is ListElement", () => {
                const li = getMenu().firstElementChild!;
                expect(li.tagName).toEqual("LI");
            });

            it("has no inline styles", () => {
                const li = getMenu().firstElementChild!;
                expect((li as HTMLElement).style.all).toEqual("");
            });

            it("has classname 'heading'", () => {
                const li = getMenu().firstElementChild!;
                expect(stringifyAttributes(li)).toContain(`class="heading"`);
            });

            it("has no additional attributes other than class and title", () => {
                const li = getMenu().firstElementChild!
                expect(stringifyAttributes(li).length).toBe(2);
                expect(stringifyAttributes(li)).toEqual([`class="heading"`, `title=""`]);
            })

            it("text property is encapsulated in a span", () => {
                const li = getMenu().firstElementChild!;
                expect(li.innerHTML).toEqual("<span>Hello World</span>");
            });

            it("text property callback is encapsulated in a span", () => {
                const li = getMenu().children[1];
                expect(li.innerHTML).toEqual("<span>Hello World</span>");
            });

            it("tooltip property generates title attribute", () => {
                const li1 = showMenu([{ text: "Hello World", tooltip: "Hello Tooltip" }]);
                expect(stringifyAttributes(li1)).toEqual([`class="heading"`, `title="Hello Tooltip"`]);

                const li2 = showMenu([{ text: "Hello World", tooltip: () => "Hello Tooltip" }]);
                expect(stringifyAttributes(li2)).toEqual([`class="heading"`, `title="Hello Tooltip"`]);
            });

            it("style property generates inline style attribute", () => {
                const li1 = showMenu([{ text: "Hello World", style: "margin: 10px" }]);
                expect(li1.style.margin).toEqual("10px");
                expect(stringifyAttributes(li1)).toEqual([`class="heading"`, `style="margin: 10px"`, `title=""`]);

                const li2 = showMenu([{ text: "Hello World", style: () => "margin: 10px" }]);
                expect(li2.style.margin).toEqual("10px");
                expect(stringifyAttributes(li2)).toEqual([`class="heading"`, `style="margin: 10px"`, `title=""`]);
            });

            it("icon property generates classname icon and img element ", () => {
                const li1 = showMenu([{ text: "Hello World", icon: "data:abcxyz" }]);
                expect(li1.innerHTML).toEqual(`<span>Hello World</span><img class="icon" src="data:abcxyz">`);
                expect(Array.from(li1.classList).sort()).toEqual(["heading", "icon"]);

                const li2 = showMenu([{ text: "Hello World", icon: () => "data:abcxyz" }]);
                expect(li2.innerHTML).toEqual(`<span>Hello World</span><img class="icon" src="data:abcxyz">`);
                expect(Array.from(li1.classList).sort()).toEqual(["heading", "icon"]);
            });
        });

        describe("anchor", () => {
            it("has classname interactive", () => {
                const li = showMenu([{ text: "Hello Anchor", href: () => "google.de" }]);
                expect(Array.from(li.classList)).toEqual(["interactive"]);
            });

            it("has no additional attributes", () => {
                const li = showMenu([{ text: "Hello Action", href: () => "google.de" }]);
                expect(li.attributes.length).toEqual(2);
            });

            it("has anchor and span child elements", () => {
                const li = showMenu([{ text: "Hello Anchor", href: "google.de" }]);
                const a = li.firstElementChild as HTMLAnchorElement;

                expect(a.tagName).toEqual("A");
                expect(a.innerHTML).toEqual(`<span>Hello Anchor</span>`);
            });

            it("target and download properties are passed to anchor element", () => {
                const li = showMenu([{ text: "Hello Anchor", href: "google.de", target: () => "_blank", download: "" }]);
                const a = li.firstElementChild as HTMLAnchorElement;
                expect(a.tagName).toEqual("A");
                expect(stringifyAttributes(a)).toEqual([`download=""`, `href="google.de"`, `target="_blank"`]);
            });

            it("clicking the anchor element should close the menu", async () => {
                window.location.hash = "";
                const li = showMenu([{ text: "Hello Anchor", href: "#clicked" }]);
                const a = li.firstElementChild as HTMLAnchorElement;

                a.click();

                expect(getMenu).toThrow();
                await new Promise(resolve => timeout(resolve));
                expect(window.location.hash).toEqual("#clicked");
                window.location.hash = "";
            });

            it("item child nodes keep the correct order", () => {
                const li = showMenu([{ href: "google.de", html: `<span>1</span><span>2</span><span>3</span>` }]);
                const a = li.firstElementChild as HTMLAnchorElement;
                expect(a.innerHTML).toEqual("<span>1</span><span>2</span><span>3</span>");
            });

            describe("disabled", () => {

                it("disabled item replaces classname with disabled", () => {
                    const li = showMenu([{ text: "Hello Anchor", href: () => "google.de", disabled: () => true }]);
                    expect(Array.from(li.classList)).toEqual(["disabled"]);
                });

                it("clicking the anchor element should do nothing", () => {
                    const click = jasmine.createSpy().and.callFake((e: MouseEvent) => {
                        expect((e.target as HTMLElement).tagName).toEqual("SPAN");
                        // cancel navigation just in case something is broken
                        e.preventDefault();
                    });

                    const li = showMenu([{ text: "Hello Anchor", href: "google.de", events: { click }, disabled: true }]);
                    const a = li.firstElementChild as HTMLAnchorElement;

                    a.click();

                    expect(click).toHaveBeenCalled();
                    expect(getMenu).not.toThrow();
                });

            });
        });

        describe("action", () => {
            const action = jasmine.createSpy();

            afterEach(() => {
                action.calls.reset();
                action.and.stub();
            });

            it("has classname interactive", () => {
                const li = showMenu([{ text: "Hello Action", action }]);
                expect(Array.from(li.classList)).toEqual(["interactive"]);
            });

            it("has span as child element", () => {
                const li = showMenu([{ text: "Hello Action", action }]);
                expect(li.innerHTML).toEqual(`<span>Hello Action</span>`);
            });

            it("has no additional attributes", () => {
                const li = showMenu([{ text: "Hello Action", action }]);
                expect(li.attributes.length).toEqual(2);
            });

            it("handler is executed on click", () => {
                showMenu([{ text: "Hello Action", action }]).click();

                expect(action).toHaveBeenCalled();
                expect(action.calls.mostRecent().args[0]).toBeInstanceOf(MouseEvent);
            });

            it("clicking the item closes the menu after the callback was executed", () => {
                showMenu([{ text: "Hello Action", action }]).click();
                expect(getMenu).toThrow();
            });

            it("action is executed before the menu is closed", () => {
                let menu: any;
                action.and.callFake(() => menu = getMenu());

                showMenu([{ text: "Hello Action", action }]).click();

                expect(menu).toBeDefined();
            });

            it("with custom element also has interactive class", () => {
                const element = document.createElement("span");
                element.innerText = "Hello Action";
                const li = showMenu([{ element, action }]);
                expect(Array.from(li.classList)).toEqual(["interactive"]);
            });

            it("clicking the item with custom element also closes the menu", () => {
                const element = document.createElement("span");
                element.innerText = "Hello Action";
                showMenu([{ element, action }]).click();
                expect(getMenu).toThrow();
            });

            it("with custom html also has interactive class", () => {
                const li = showMenu([{ html: "<span>Hello Action</span>", action }]);
                expect(Array.from(li.classList)).toEqual(["interactive"]);
            });

            it("clicking the item with custom html also closes the menu", () => {
                showMenu([{ html: "<span>Hello Action</span>", action }]).click();
                expect(getMenu).toThrow();
            });

            describe("disabled", () => {

                it("disabled item replaces classname with disabled", () => {
                    const li = showMenu([{ text: "Hello Action", action, disabled: true }]);
                    expect(Array.from(li.classList)).toEqual(["disabled"]);
                });

                it("clicking disabled item should do nothing", () => {
                    showMenu([{ text: "Hello Action", action, disabled: true }]).click();
                    expect(action).not.toHaveBeenCalled();
                    expect(getMenu).not.toThrow();
                });
            });

        });

        describe("divider", () => {
            it("has only classname divider", () => {
                const li = showMenu([{ isDivider: true }, { text: "Hello World" }]);
                expect(Array.from(li.classList)).toEqual(["divider"]);
            });

            it("has no additional attributes", () => {
                const li = showMenu([{ isDivider: true }, { text: "Hello World" }]);
                expect(Array.from(li.attributes).length).toEqual(1);
            });

            it("has no innerHTML", () => {
                const li = showMenu([{ isDivider: true }, { text: "Hello World" }]);
                expect(li.innerHTML).toBeFalsy();
            });

            it("ignores any additional properties", () => {
                const li = showMenu([
                    {
                        isDivider: true,
                        // @ts-expect-error isDivider together with other properties should be typescript error
                        tooltip: "Test",
                        text: "Hello World",
                        subMenu: [],
                        disabled: true,
                        html: "<b></b>",
                        element: document.createElement("h1"),
                    },
                    { text: "Hello World" }
                ]);
                expect(Array.from(li.attributes).length).toEqual(1);
                expect(li.innerHTML).toBeFalsy();
                expect(Array.from(li.classList)).toEqual(["divider"]);
            });

            it("clicking it has no effect", () => {
                showMenu([{ isDivider: true }, { text: "Hello World" }]).click();
                expect(getMenu).not.toThrow();
            });
        });

        describe("submenu", () => {
            it("has classnames interactive and submenu", () => {
                const li = showMenu([{ text: "Hello Submenu", subMenu: [{ text: "Hello Submenu Item" }] }]);
                expect(Array.from(li.classList).sort()).toEqual(["interactive", "submenu"]);
            });

            it("has span child element", () => {
                const li = showMenu([{ text: "Hello Submenu", subMenu: [{ text: "Hello Submenu Item" }] }]);
                expect(li.innerHTML).toEqual(`<span>Hello Submenu</span>`)
            });

            it("has arrow pseudo element", () => {
                const li = showMenu([{ text: "Hello Submenu", subMenu: () => [{ text: "Hello Submenu Item" }] }]);
                // can't reference the pseudo element directly
                const rarrstyles = window.getComputedStyle(li, ":after");
                expect(rarrstyles.content).toEqual(`""`);
                expect(rarrstyles.borderWidth).toEqual("1px 1px 0px 0px");
            });

            describe("custom item with submenu has classname and interactive submenu", () => {
                it("using html property", () => {
                    const li = showMenu([{ html: "<span>Hello Submenu</span>", subMenu: [{ text: "Hello Submenu Item" }] }]);
                    expect(Array.from(li.classList)).toEqual(["submenu", "interactive"]);
                });

                it("using element property", () => {
                    const element = document.createElement("span");
                    element.innerText = "Hello Submenu";
                    const li = showMenu([{ element, subMenu: [{ text: "Hello Submenu Item" }] }]);
                    expect(Array.from(li.classList)).toEqual(["submenu", "interactive"]);
                });
            });

            describe("disabled", () => {
                it("has classnames disabled and submenu", () => {
                    const li = showMenu([{ text: "Hello Submenu", subMenu: () => [{ text: "Hello Submenu Item" }], disabled: true }]);
                    expect(Array.from(li.classList).sort()).toEqual(["disabled", "submenu"]);
                });

                it("having an empty submenu implicitly disables the menu item", () => {
                    const li = showMenu([{ text: "Hello Submenu", subMenu: [] }]);
                    expect(Array.from(li.classList).sort()).toEqual(["disabled", "submenu"]);
                });
            });
        });

    });
    describe("click away listener", function () {
        it("clicking something in the window closes any open menu", () => {
            const clickAway = jasmine.createSpy();
            window.addEventListener("click", clickAway);
            var click = jasmine.createSpy().and.callFake(e => {
                expect(e.target.tagName).toEqual("A");
                // cancel navigation
                e.preventDefault();
            });
            showMenu([{ text: "Hello Anchor", href: "google.de", events: { click } }]);

            document.body.click();

            expect(click).not.toHaveBeenCalled();
            expect(clickAway).toHaveBeenCalled();
            expect(getMenu).toThrow();
        });

        it("clicking an action item closes the menu without triggering the click away listener", () => {
            const clickAway = jasmine.createSpy();
            window.addEventListener("click", clickAway);
            var click = jasmine.createSpy().and.callFake(e => {
                expect(e.target.tagName).toEqual("A");
                // cancel navigation
                e.preventDefault();
            });
            var li = showMenu([{ text: "Hello Anchor", href: "google.de", events: { click } }]);
            var a = li.firstElementChild as HTMLAnchorElement;

            a.click();

            expect(click).toHaveBeenCalled();
            expect(clickAway).not.toHaveBeenCalled();
            expect(getMenu).toThrow();
        });
    });

    describe("event registry", () => {
        const focus = jasmine.createSpy();
        const blur = jasmine.createSpy();

        afterEach(() => {
            focus.calls.reset();
            blur.calls.reset();
        });

        it("basic event callback function is attached as listener", () => {
            const li1 = showMenu([{ text: "Hello World", events: { focus } }]);
            li1.setAttribute("tabindex", "1");
            li1.focus();
            expect(document.activeElement).toBe(li1);

            expect(focus).toHaveBeenCalledTimes(1);
            expect(focus.calls.mostRecent().args[0]).toBeInstanceOf(FocusEvent);
            expect((focus.calls.mostRecent().args[0] as FocusEvent).target).toBe(li1);
        });

        it("multiple event handlers are corectly attached", () => {
            const li1 = showMenu([{ text: "Hello World", events: { focus, blur } }]);
            li1.setAttribute("tabindex", "1");
            li1.focus();
            expect(document.activeElement).toBe(li1);

            li1.blur();
            expect(document.activeElement).toBe(document.body);

            expect(focus).toHaveBeenCalledTimes(1);
            expect(focus.calls.mostRecent().args[0]).toBeInstanceOf(FocusEvent);
            expect((focus.calls.mostRecent().args[0] as FocusEvent).target).toBe(li1);

            expect(blur).toHaveBeenCalledTimes(1);
            expect(blur.calls.mostRecent().args[0]).toBeInstanceOf(FocusEvent);
            expect((blur.calls.mostRecent().args[0] as FocusEvent).target).toBe(li1);
        });

        it("passing the listeners in an event config object", () => {
            const li1 = showMenu([{
                text: "Hello World", events: {
                    focus: { listener: focus },
                    blur: { listener: blur }
                }
            }]);
            li1.setAttribute("tabindex", "1");
            li1.focus();
            expect(document.activeElement).toBe(li1);

            li1.blur();
            expect(document.activeElement).toBe(document.body);

            li1.focus();
            expect(document.activeElement).toBe(li1);

            li1.blur();
            expect(document.activeElement).toBe(document.body);

            expect(focus).toHaveBeenCalledTimes(2);
            expect(focus.calls.mostRecent().args[0]).toBeInstanceOf(FocusEvent);
            expect((focus.calls.mostRecent().args[0] as FocusEvent).target).toBe(li1);

            expect(blur).toHaveBeenCalledTimes(2);
            expect(blur.calls.mostRecent().args[0]).toBeInstanceOf(FocusEvent);
            expect((blur.calls.mostRecent().args[0] as FocusEvent).target).toBe(li1);
        });

        it("passing options to the event handler, like 'once'", () => {
            const li1 = showMenu([{
                text: "Hello World", events: () => ({
                    focus: { listener: focus, options: { once: true } },
                    blur: { listener: blur, options: { once: true } }
                })
            }]);
            li1.setAttribute("tabindex", "1");
            li1.focus();
            expect(document.activeElement).toBe(li1);

            li1.blur();
            expect(document.activeElement).toBe(document.body);

            li1.focus();
            expect(document.activeElement).toBe(li1);

            li1.blur();
            expect(document.activeElement).toBe(document.body);

            expect(focus).toHaveBeenCalledTimes(1);
            expect(focus.calls.mostRecent().args[0]).toBeInstanceOf(FocusEvent);
            expect((focus.calls.mostRecent().args[0] as FocusEvent).target).toBe(li1);

            expect(blur).toHaveBeenCalledTimes(1);
            expect(blur.calls.mostRecent().args[0]).toBeInstanceOf(FocusEvent);
            expect((blur.calls.mostRecent().args[0] as FocusEvent).target).toBe(li1);
        });
    });

    describe("custom elements", () => {
        const element = document.createElement("p");
        element.innerText = "Hello Paragraph";

        it("should not have any classnames", () => {
            const li1 = showMenu([{ text: "Hello World", html: "Hello HTML" }]);
            expect(stringifyAttributes(li1)).toEqual([`title=""`]);

            const li2 = showMenu([{ text: "Hello World", element: () => element, tooltip: "Tooltip" }]);
            expect(stringifyAttributes(li2)).toEqual([`title="Tooltip"`]);
        });

        it("html property overwrites text property and sets innerHTML directly", () => {
            const li1 = showMenu([{ text: "Hello World", html: "Hello HTML" }]);
            expect(li1.innerHTML).toEqual("Hello HTML");

            const li2 = showMenu([{ text: "Hello World", html: () => "Hello HTML" }]);
            expect(li2.innerHTML).toEqual("Hello HTML");
        });

        it("element property overwrites text property and gets attached as child", () => {
            const li1 = showMenu([{ text: "Hello World", element }]);
            expect(li1.innerHTML).toEqual("<p>Hello Paragraph</p>");

            const li2 = showMenu([{ text: "Hello World", element: () => element }]);
            expect(li2.innerHTML).toEqual("<p>Hello Paragraph</p>");
        });
    });

    describe("can set attributes", () => {

        it("on list item, arbitrarily", () => {
            const li1 = showMenu([{ text: "Hello World", attributes: { "data-hello": "world" } }]);
            expect(li1.innerHTML).toEqual("<span>Hello World</span>");
            expect(li1.dataset["hello"]).toEqual("world");

            const li2 = showMenu([{ text: "Hello World", attributes: () => ({ "data-hello": "world" }) }]);
            expect(li2.innerHTML).toEqual("<span>Hello World</span>");
            expect(li2.dataset["hello"]).toEqual("world");
        });

        it("already set by other properties", () => {
            const li1 = showMenu([{ text: "Hello World", attributes: { "title": "overwrite" }, tooltip: "Tooltip" }]);
            expect(li1.title).toEqual("overwrite");

            const li2 = showMenu([{ text: "Hello World", attributes: () => ({ "title": "overwrite" }), tooltip: "Tooltip" }]);
            expect(li2.title).toEqual("overwrite");
        });

        it("on individual submenu items", () => {
            const li1 = showMenu([{
                text: "Submenu",
                subMenu: [
                    {
                        text: "Hello World",
                        attributes: { "data-hello": "world" }
                    }
                ]
            }]);
            li1.dispatchEvent(new MouseEvent("mouseenter"));

            const lili1 = li1.querySelector("li");
            expect(lili1?.dataset["hello"]).toEqual("world");

        });

        it("on the nested container (ul) of as submenu item", () => {
            const li1 = showMenu([{
                text: "Submenu",
                subMenu: [
                    {
                        text: "Hello World",
                    }
                ],
                subMenuAttributes: { "data-hello": "world" }
            }]);
            li1.dispatchEvent(new MouseEvent("mouseenter"));

            const liul = li1.querySelector("ul");
            expect(liul?.dataset["hello"]).toEqual("world");
        });

        it("on the parent container (ul)", () => {
            const li1 = showMenu([{ text: "Hello World" }], { attributes: { "data-hello": "world" } });
            expect(li1.parentElement?.dataset["hello"]).toEqual("world");
        });

    });
});
