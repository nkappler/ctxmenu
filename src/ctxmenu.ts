/*! ctxMenu v1.2.0 | (c) Nikolaj Kappler | https://github.com/nkappler/ctxmenu/blob/master/LICENSE !*/

export type ValueOrFunction<T> = T | (() => T);

/** This is a Divider Menu Item */
export interface CTXMDivider {
    isDivider: true;
}

/**
 * This is a heading item which displays a text and optionally shows a tooltip when hovering over it.
 *
 * NOTE: _All other menu items (except the divider item) derive from this and have at least these properties_
 */
export interface CTXMHeading {
    /** The text of the Context Menu Item */
    text?: ValueOrFunction<string>;
    /** The tooltip of the Context Menu Item */
    tooltip?: ValueOrFunction<string>;
    /** Define custom html content instead of text for the Context Menu Item */
    html?: ValueOrFunction<string>;
    /** Define a custom HTMLElement as content of the Context Menu Item  */
    element?: ValueOrFunction<HTMLElement>;
    /** URL or :data URL to an image, used as icon */
    icon?: ValueOrFunction<string>;
    /** inline attribute appended to the `<li>` Element */
    style?: ValueOrFunction<string>;
}

export interface CTXMInteractive extends CTXMHeading {
    /** Whether the Context Menu Item is disabled or not. Defaults to `false` */
    disabled?: ValueOrFunction<boolean>;
}

/** This is an interactive item which will execute a given javascript function when clicked. */
export interface CTXMAction extends CTXMInteractive {
    /** A function that is called when the Action Item is clicked. Takes a `MouseEvent` as parameter. */
    action: (ev: MouseEvent) => void;
}

/** This is an interactive item which implements an anchor tag (`<a>`) and will redirect to a given URL (`href`). */
export interface CTXMAnchor extends CTXMInteractive {
    /** Contains a URL or a URL fragment that the hyperlink points to. */
    href: ValueOrFunction<string>;
    /** Specifies where to display the linked URL. (e.g. `"_blank"` to open it in a new tab) */
    target?: ValueOrFunction<string>;
    /** Prompts the user to save the linked URL instead of navigating to it. The specified value will be the filename, use empty string to inherit filename from target url. 
     * 
     * __Note:__ works only with same-origin URLs */
    download?: ValueOrFunction<string>;
}

/** This is an interactive item which holds a menu definition. You can create infinitely deep nested submenus. */
export interface CTXMSubMenu extends CTXMInteractive {
    /** The menu definition for the nested menu */
    subMenu: ValueOrFunction<CTXMenu>;
}

export type CTXMItem = CTXMAnchor | CTXMAction | CTXMHeading | CTXMDivider | CTXMSubMenu;

/**
 * This is a Menu Definition. In fact, it's just an array of Context Menu Items
 */
export type CTXMenu = CTXMItem[];

/**
 * A function that is called before the context menu is opened.
 * It is passed the menu definition and the MouseEvent.
 * Can be used to manipulate the menu based on the Event. (e.g. Cursor Position)
 * Needs to return a menu definition.
 */
export type BeforeRenderFN = (menu: CTXMenu, e: MouseEvent) => CTXMenu;

export interface CTXMenuSingleton {
    /**
     * The attach method is used to bind a context menu to any DOM Node and takes the following arguments:
     * @param target A selector string to define the target node (eg `'body'`, or `'#someID'`)
     * @param ctxMenu An array of objects defining the menu layout.
     * @param beforeRender An optional callback function that is called before the context menu is opened.
     * It is passed two arguments:
     * `menu` - the menu definition,
     * `event` - the MouseEvent.
     * `beforeRender` needs to return a new menu definition which will be used.
     */
    attach(target: string, ctxMenu: CTXMenu, beforeRender?: BeforeRenderFN): void;
    /**
     * The update method is used to update an existing context menu.
     * You can update each the menu definition or beforeRender function only by passing undefined for the other argument.
     * If you try to update a menu which does not exist, it will silently be attached instead.
     * @param target A selector string to define the target node (eg `'body'`, or `'#someID'`)
     * @param ctxMenu An array of objects defining the updated menu layout. _(might be undefined when only updating beforeRender)_
     * @param beforeRender The updated callback function that is called before the context menu is opened.
     * It is passed two arguments:
     * `menu` - the menu definition,
     * `event` - the MouseEvent.
     * `beforeRender` needs to return a new menu definition which will be used.
     */
    update(target: string, ctxMenu?: CTXMenu, beforeRender?: BeforeRenderFN): void;
    /**
     * The delete method is used to delete a context menu
     * @param target A selector string to define the target node (eg `'body'`, or `'#someID'`)
     */
    delete(target: string): void;
}

type CTXHandler = Exclude<HTMLElement["oncontextmenu"], null>;

interface CTXCache {
    [key: string]: {
        ctxmenu: CTXMenu,
        handler: CTXHandler,
        beforeRender: BeforeRenderFN
    } | undefined;
}

interface Pos {
    x: number;
    y: number;
}

class ContextMenu implements CTXMenuSingleton {
    private static instance: ContextMenu;
    private menu: HTMLUListElement | undefined;
    private cache: CTXCache = {};
    private hdir: "r" | "l" = "r";
    private vdir: "u" | "d" = "d";
    private constructor() {
        window.addEventListener("click", ev => {
            const item = ev.target instanceof Element && ev.target.parentElement;
            if (item && item.className === "interactive") {
                return;
            }
            this.closeMenu();
        });
        window.addEventListener("resize", () => this.closeMenu());
        window.addEventListener("scroll", () => this.closeMenu());
        ContextMenu.addStylesToDom();
    }

    public static getInstance() {
        if (!ContextMenu.instance) {
            ContextMenu.instance = new ContextMenu();
        }
        return ContextMenu.instance;
    }

    public attach(target: string, ctxMenu: CTXMenu, beforeRender: BeforeRenderFN = m => m) {
        const t = document.querySelector<HTMLElement>(target);
        if (this.cache[target] !== undefined) {
            console.error(`target element ${target} already has a context menu assigned. Use ContextMenu.update() intstead.`);
            return;
        }
        if (!t) {
            console.error(`target element ${target} not found`);
            return;
        }
        const handler: CTXHandler = e => {
            e.stopImmediatePropagation();
            //close any open menu
            this.closeMenu();

            const newMenu = beforeRender([...ctxMenu], e);
            this.menu = this.generateDOM(newMenu, e);
            document.body.appendChild(this.menu);

            e.preventDefault();
        };

        this.cache[target] = {
            ctxmenu: ctxMenu,
            handler,
            beforeRender
        };
        t.addEventListener("contextmenu", handler);
    }

    public update(target: string, ctxMenu?: CTXMenu, beforeRender?: BeforeRenderFN) {
        const o = this.cache[target];
        const t = document.querySelector<HTMLElement>(target);
        o && t?.removeEventListener("contextmenu", o.handler);
        delete this.cache[target];
        this.attach(target, ctxMenu || o?.ctxmenu || [], beforeRender || o?.beforeRender);
    }

    public delete(target: string) {
        const o = this.cache[target];
        if (!o) {
            console.error(`no context menu for target element ${target} found`);
            return;
        }
        const t = document.querySelector<HTMLElement>(target);
        if (!t) {
            console.error(`target element ${target} does not exist (anymore)`);
            return;
        }
        t.removeEventListener("contextmenu", o.handler);
        delete this.cache[target];
    }

    private closeMenu(menu: Element | undefined = this.menu) {
        //reset directions
        this.hdir = "r";
        this.vdir = "d";

        if (menu) {
            if (menu === this.menu) {
                delete this.menu;
            }
            menu.parentElement?.removeChild(menu);
        }
    }

    /**
     * assigns an eventhandler to a list item, that gets triggered after a short timeout,
     * but only if the cursor is still targeting that list item after the timeout. when
     * hovering fast over different list items, the actions do not get triggered.
     * @param target the target list item
     * @param action the event that should trigger after the timeout
     */
    private debounce(target: HTMLLIElement, action: (e: MouseEvent) => void) {
        let timeout: number;
        target.addEventListener("mouseenter", (e) => {
            timeout = setTimeout(() => action(e), 150);
        });
        target.addEventListener("mouseleave", () => clearTimeout(timeout));
    }

    private generateDOM(ctxMenu: CTXMenu, event: MouseEvent): HTMLUListElement;
    private generateDOM(ctxMenu: CTXMenu, parentElement: HTMLLIElement): HTMLUListElement;
    private generateDOM(ctxMenu: CTXMenu, parentOrEvent: HTMLLIElement | MouseEvent): HTMLUListElement {
        //This has grown pretty messy and could use a rework

        const container = document.createElement("ul");
        if (ctxMenu.length === 0) {
            container.style.display = "none";
        }
        ctxMenu.forEach(item => {
            const li = document.createElement("li");
            //all items shoud have a handler to close submenus on hover (except if its their own)
            this.debounce(li, () => {
                const subMenu = li.parentElement?.querySelector("ul");
                if (subMenu && subMenu.parentElement !== li) {
                    this.closeMenu(subMenu);
                }
            });

            //Item type specific stuff
            if (ContextMenu.itemIsDivider(item)) {
                li.className = "divider";
            } else {
                const html = ContextMenu.getProp(item.html);
                const text = `<span>${ContextMenu.getProp(item.text)}</span>`;
                const elem = ContextMenu.getProp(item.element);
                elem
                    ? li.append(elem)
                    : li.innerHTML = html ? html : text;
                li.title = ContextMenu.getProp(item.tooltip) || "";
                if (item.style) { li.setAttribute("style", ContextMenu.getProp(item.style)) }
                if (ContextMenu.itemIsInteractive(item)) {
                    if (!ContextMenu.getProp(item.disabled)) {
                        li.classList.add("interactive");
                        if (ContextMenu.itemIsAction(item)) {
                            li.addEventListener("click", (e) => {
                                item.action(e);
                                this.closeMenu();
                            }
                            );
                        }
                        else if (ContextMenu.itemIsAnchor(item)) {
                            const a = document.createElement("a");
                            elem
                                ? a.append(elem)
                                : a.innerHTML = html ? html : text;
                            a.onclick = () => this.closeMenu();
                            a.href = ContextMenu.getProp(item.href);
                            if (item.hasOwnProperty("download")) { a.download = ContextMenu.getProp(item.download!) }
                            if (item.hasOwnProperty("target")) { a.target = ContextMenu.getProp(item.target!) }
                            li.childNodes.forEach(n => n.remove());
                            li.append(a);
                        }
                        else if (ContextMenu.itemIsSubMenu(item)) {
                            if (ContextMenu.getProp(item.subMenu).length === 0) {
                                li.classList.add("disabled");
                            } else {
                                li.classList.add("submenu");
                                this.debounce(li, (ev) => {
                                    const subMenu = li.querySelector("ul");
                                    if (!subMenu) { //if it's already open, do nothing
                                        this.openSubMenu(ev, ContextMenu.getProp(item.subMenu), li);
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
                    //Heading
                    li.setAttribute("style", "font-weight: bold; margin-left: -5px;" + li.getAttribute("style"));
                }

                if (ContextMenu.getProp(item.icon)) {
                    li.classList.add("icon");
                    li.innerHTML += `<img class="icon" src="${ContextMenu.getProp(item.icon)}" />`;
                }
            }
            container.appendChild(li);
        });
        container.style.position = "fixed";
        container.className = "ctxmenu";

        const rect = ContextMenu.getBounding(container);
        let pos = { x: 0, y: 0 };
        if (parentOrEvent instanceof Element) {
            const parentRect = parentOrEvent.getBoundingClientRect();
            pos = {
                x: this.hdir === "r" ? parentRect.left + parentRect.width : parentRect.left - rect.width,
                y: parentRect.top + (this.vdir === "d" ? 4 : -12) //-4px means no vertical movement with default styles
            };
            const savePos = this.getPosition(rect, pos);
            // change direction when reaching edge of screen
            if (pos.x !== savePos.x) {
                this.hdir = this.hdir === "r" ? "l" : "r";
                pos.x = this.hdir === "r" ? parentRect.left + parentRect.width : parentRect.left - rect.width;
            }
            if (pos.y !== savePos.y) {
                this.vdir = this.vdir === "u" ? "d" : "u";
                pos.y = savePos.y
            }
            pos = this.getPosition(rect, pos); //on very tiny screens, the submenu may overlap the parent menu
        } else {
            pos = this.getPosition(rect, { x: parentOrEvent.clientX, y: parentOrEvent.clientY });
        }

        container.style.left = pos.x + "px";
        container.style.top = pos.y + "px";
        container.addEventListener("contextmenu", ev => {
            ev.stopPropagation();
            ev.preventDefault();
        });
        container.addEventListener("click", ev => {
            const item = ev.target instanceof Element && ev.target.parentElement;
            if (item && item.className !== "interactive") {
                ev.stopPropagation();
            }
        });
        return container;
    }

    private openSubMenu(e: MouseEvent, ctxMenu: CTXMenu, listElement: HTMLLIElement) {
        // check if other submenus on this level are open and close them
        const subMenu = listElement.parentElement?.querySelector("li > ul");
        if (subMenu && subMenu.parentElement !== listElement) {
            this.closeMenu(subMenu);
        }
        listElement.appendChild(this.generateDOM(ctxMenu, listElement));
    }

    private static getBounding(elem: HTMLElement): ClientRect | DOMRect {
        const container = elem.cloneNode(true) as HTMLElement;
        container.style.visibility = "hidden";
        document.body.appendChild(container);
        const result = container.getBoundingClientRect();
        document.body.removeChild(container);
        return result;
    }

    /** gets a save position inside the screen */
    private getPosition(rect: DOMRect | ClientRect, pos: Pos): Pos {
        return {
            x: this.hdir === "r"
                ? pos.x + rect.width > window.innerWidth ? window.innerWidth - rect.width : pos.x
                : pos.x < 0 ? 0 : pos.x,
            y: this.vdir === "d"
                ? pos.y + rect.height > window.innerHeight ? window.innerHeight - rect.height : pos.y
                : pos.y < 0 ? 0 : pos.y
        };
    }

    private static getProp<T>(prop: ValueOrFunction<T>): T {
        return typeof prop === "function" ? (prop as () => T)() : prop;
    }

    private static itemIsInteractive(item: CTXMItem): item is (CTXMAction | CTXMAnchor | CTXMSubMenu) {
        return this.itemIsAction(item) || this.itemIsAnchor(item) || this.itemIsSubMenu(item)
            || this.itemIsCustom(item); /* <-- not really an interactive item,
          since it might miss the 'disabled' prop but doesn't matter since it is optionial anyway.
          using this check for styling reasons mainly, so that custom elements don't get header styling */
    }

    private static itemIsAction(item: CTXMItem): item is CTXMAction {
        return item.hasOwnProperty("action");
    }

    private static itemIsAnchor(item: CTXMItem): item is CTXMAnchor {
        return item.hasOwnProperty("href");
    }

    private static itemIsDivider(item: CTXMItem): item is CTXMDivider {
        return item.hasOwnProperty("isDivider");
    }

    private static itemIsSubMenu(item: CTXMItem): item is CTXMSubMenu {
        return item.hasOwnProperty("subMenu");
    }

    private static itemIsCustom(item: CTXMItem): item is CTXMHeading {
        return item.hasOwnProperty("html") || item.hasOwnProperty("element");
    }

    private static addStylesToDom() {
        let append = () => {
            //insert default styles as first css -> low priority -> user can overwrite it easily
            const styles: Record<string, Partial<CSSStyleDeclaration>> = {
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

            const rules = Object.entries(styles).map(s => `${s[0]} { ${Object.assign(document.createElement("p").style, s[1]).cssText} }`);
            const styleSheet = document.head.insertBefore(document.createElement("style"), document.head.childNodes[0]);
            rules.forEach(r => styleSheet.sheet?.insertRule(r));
            append = () => { };
        };

        if (document.readyState !== "loading") {
            append();
        } else {
            document.addEventListener("readystatechange", () => {
                if (document.readyState !== "loading") {
                    append();
                }
            });
        }
    }
}

export const ctxmenu: CTXMenuSingleton = ContextMenu.getInstance();
