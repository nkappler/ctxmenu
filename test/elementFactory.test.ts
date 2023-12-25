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
                debugger;
            });
            it("events property");

        });

        describe("custom elements", () => {
            const element = document.createElement("p");
            element.innerText = "Hello Paragraph";

            it("should not have any classnames", async  () => {
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
        })
        it("anchor");
        it("action");
        it("devider");
        it("submenu");
    });
});
