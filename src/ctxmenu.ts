/*! ctxMenu v1.6.1 | (c) Nikolaj Kappler | https://github.com/nkappler/ctxmenu/blob/master/LICENSE !*/

import { generateMenu, onHoverDebounced } from "./elementFactory";
import type { BeforeRenderFN, CTXMenu, CTXMenuSingleton } from "./interfaces";
import { resetDirections, setPosition } from "./position";
//@ts-ignore file will only be present after first run of npm run build
import { styles } from "./styles";
import { getProp, isDisabled, itemIsSubMenu } from "./typeguards";

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
        window.addEventListener("click", () => void this.hide());
        window.addEventListener("resize", () => void this.hide());
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
            return console.error(`no context menu for target element ${target} found`);
        }
        delete this.cache[target];

        const t = document.querySelector<HTMLElement>(target);
        if (!t) {
            return console.error(`target element ${target} does not exist (anymore)`);;
        }
        t.removeEventListener("contextmenu", o.handler);
    }

    public show(ctxMenu: CTXMenu, eventOrElement: HTMLElement | MouseEvent) {
        if (eventOrElement instanceof MouseEvent) {
            eventOrElement.stopImmediatePropagation();
        }
        //close any open menu
        this.hide();

        this.menu = this.generateDOM([...ctxMenu], eventOrElement);
        document.body.appendChild(this.menu);
        this.menu.addEventListener("wheel", () => void (this.preventCloseOnScroll = true), { passive: true });

        if (eventOrElement instanceof MouseEvent) {
            eventOrElement.preventDefault();
        }
    }

    public hide(menu: Element | undefined = this.menu) {
        resetDirections();
        if (!menu) return;

        if (menu === this.menu) {
            delete this.menu;
        }
        menu.parentElement?.removeChild(menu);
    }

    /** creates the menu Elements, sets the menu position and attaches submenu lifecycle handlers */
    private generateDOM(ctxMenu: CTXMenu, parentOrEvent: HTMLElement | MouseEvent): HTMLUListElement {
        const container = generateMenu(ctxMenu);
        setPosition(container, parentOrEvent);
        ctxMenu.forEach((item, i) => {
            const li = container.children[i] as HTMLLIElement;
            //all items shoud close submenus on hover which are not their own
            onHoverDebounced(li, () => {
                const subMenu = li.parentElement?.querySelector("ul");
                if (subMenu && subMenu.parentElement !== li) {
                    this.hide(subMenu);
                }
            });

            if (isDisabled(item)) return;
            if (!itemIsSubMenu(item)) return;

            onHoverDebounced(li, (ev) => {
                const subMenu = li.querySelector("ul");
                if (!subMenu) { //if it's already open, do nothing
                    this.openSubMenu(ev, getProp(item.subMenu), li);
                }
            });
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
        if (document.readyState === "loading") {
            return document.addEventListener("readystatechange", this.addStylesToDom, { once: true });
        }
        //insert default styles as first css -> low priority -> user can overwrite it easily
        const style = document.createElement("style");
        style.innerHTML = styles;
        document.head.insertBefore(style, document.head.childNodes[0]);
    }
}

export const ctxmenu: CTXMenuSingleton = ContextMenu.getInstance();
export * from "./interfaces";
