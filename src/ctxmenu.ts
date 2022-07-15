/*! ctxMenu v1.5.0 | (c) Nikolaj Kappler | https://github.com/nkappler/ctxmenu/blob/master/LICENSE !*/

import { generateMenuItem, isDisabled, onHoverDebounced } from "./elementFactory";
import type { BeforeRenderFN, CTXMenu, CTXMenuSingleton } from "./interfaces";
import { resetDirections, setPosition } from "./position";
//@ts-ignore file will only be present after first run of npm run build
import { styles } from "./styles";
import { getProp, itemIsInteractive, itemIsSubMenu } from "./typeguards";

type CTXHandler = Exclude<HTMLElement["oncontextmenu"], null>;

interface CTXCache {
    [key: string]: {
        ctxMenu: CTXMenu,
        handler: CTXHandler,
        beforeRender: BeforeRenderFN
    } | undefined;
}

class ContextMenu implements CTXMenuSingleton {
    private static instance: ContextMenu;
    private menu: HTMLUListElement | undefined;
    private cache: CTXCache = {};
    /**
     * used to track if wheel events originated from the ctx menu.
     * in that case we don't want to close the menu. (#28)
     */
    private preventCloseOnScroll = false;
    private constructor() {
        window.addEventListener("click", ev => {
            const item = ev.target instanceof Element && ev.target.parentElement;
            if (item && item.className === "interactive") {
                return;
            }
            this.hide();
        });
        window.addEventListener("resize", () => this.hide());
        let timeout = 0;
        window.addEventListener("wheel", () => {
            clearTimeout(timeout);
            // use a timeout to make sure this handler is always executed after the flag has been set
            timeout = setTimeout(() => {
                if (this.preventCloseOnScroll) {
                    this.preventCloseOnScroll = false;
                    return;
                }
                this.hide();
            });
        }, { passive: true });
        window.addEventListener("keydown", e => {
            if (e.key === "Escape") this.hide();
        });
        ContextMenu.addStylesToDom();
    }

    public static getInstance(): CTXMenuSingleton {
        if (!ContextMenu.instance) {
            ContextMenu.instance = new ContextMenu();
        }
        const instance = ContextMenu.instance;
        return {
            // proxy element to prevent access to internals
            attach: instance.attach.bind(instance),
            delete: instance.delete.bind(instance),
            hide: instance.hide.bind(instance),
            show: instance.show.bind(instance),
            update: instance.update.bind(instance)
        };
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
            const newMenu = beforeRender([...ctxMenu], e);
            this.show(newMenu, e);
        };

        this.cache[target] = {
            ctxMenu,
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
        this.attach(target, ctxMenu || o?.ctxMenu || [], beforeRender || o?.beforeRender);
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

    public show(ctxMenu: CTXMenu, eventOrElement: HTMLElement | MouseEvent) {
        if (eventOrElement instanceof MouseEvent) {
            eventOrElement.stopImmediatePropagation();
        }
        //close any open menu
        this.hide();

        this.menu = this.generateDOM([...ctxMenu], eventOrElement);
        document.body.appendChild(this.menu);
        this.menu.addEventListener("wheel", () => this.preventCloseOnScroll = true, { passive: true });

        if (eventOrElement instanceof MouseEvent) {
            eventOrElement.preventDefault();
        }
    }

    public hide(menu: Element | undefined = this.menu) {
        resetDirections();

        if (menu) {
            if (menu === this.menu) {
                delete this.menu;
            }
            menu.parentElement?.removeChild(menu);
        }
    }

    private generateDOM(ctxMenu: CTXMenu, parentOrEvent: HTMLElement | MouseEvent): HTMLUListElement {
        //This has grown pretty messy and could use a rework

        const container = document.createElement("ul");
        if (ctxMenu.length === 0) {
            container.style.display = "none";
        }
        ctxMenu.forEach(item => {
            const li = generateMenuItem(item);
            //all items shoud have a handler to close submenus on hover (except if its their own)
            onHoverDebounced(li, () => {
                const subMenu = li.parentElement?.querySelector("ul");
                if (subMenu && subMenu.parentElement !== li) {
                    this.hide(subMenu);
                }
            });

            if (itemIsInteractive(item) && !isDisabled(item)) {
                if (itemIsSubMenu(item)) {
                    onHoverDebounced(li, (ev) => {
                        const subMenu = li.querySelector("ul");
                        if (!subMenu) { //if it's already open, do nothing
                            this.openSubMenu(ev, getProp(item.subMenu), li);
                        }
                    });
                } else {
                    li.addEventListener("click", () => this.hide());
                }
            }
            container.appendChild(li);
        });
        container.className = "ctxmenu";
        setPosition(container, parentOrEvent);

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
            this.hide(subMenu);
        }
        listElement.appendChild(this.generateDOM(ctxMenu, listElement));
    }

    private static addStylesToDom() {
        let append = () => {
            if (document.readyState === "loading") {
                return document.addEventListener("readystatechange", append);
            }
            //insert default styles as first css -> low priority -> user can overwrite it easily
            const style = document.createElement("style");
            style.innerHTML = styles;
            document.head.insertBefore(style, document.head.childNodes[0]);

            append = () => { };
        };
        append();
    }
}

export const ctxmenu: CTXMenuSingleton = ContextMenu.getInstance();
export * from "./interfaces";
