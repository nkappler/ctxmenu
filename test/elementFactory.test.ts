const stringifyAttribute = ({ name, value }: Attr) => `${name}="${value}"`;
const stringifyAttributes = ({ attributes }: Element) => Array.from(attributes).map(stringifyAttribute).sort();

const showMenu = (menu: Parameters<typeof window.ctxmenu.show>[0]) => {
    window.ctxmenu.show(menu, getTarget());
    return getMenu().firstElementChild! as HTMLElement;
}

/**
 * Although this suite tests code specifically from the element factory,
 * we won't call it directly but use only the public API until deemed necessary
 */
describe("ElementFactory", () => {

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
                expect(stringifyAttributes(li1)).toEqual([`class="icon heading"`, `title=""`]);

                const li2 = showMenu([{ text: "Hello World", icon: () => "data:abcxyz" }]);
                expect(li2.innerHTML).toEqual(`<span>Hello World</span><img class="icon" src="data:abcxyz">`);
                expect(stringifyAttributes(li2)).toEqual([`class="icon heading"`, `title=""`]);
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

            it("clicking the anchor element should close the menu", () => {
                const click = jasmine.createSpy().and.callFake((e: MouseEvent) => {
                    expect((e.target as HTMLElement).tagName).toEqual("A");
                    // cancel navigation
                    e.preventDefault();
                });

                const li = showMenu([{ text: "Hello Anchor", href: "google.de", events: { click } }]);
                const a = li.firstElementChild as HTMLAnchorElement;

                a.click();

                expect(click).toHaveBeenCalled();
                expect(getMenu).toThrow();
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
                    // @ts-expect-error TODO: isDivider together with other properties should be typescript error
                    {
                        isDivider: true,
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
        });

        it("submenu");

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
});
