/*! ctxMenu v2.0.2 | (c) Nikolaj Kappler | https://github.com/nkappler/ctxmenu/blob/master/LICENSE !*/

import { generateMenu, onHoverDebounced } from "./elementFactory";
import type { CTXConfig, CTXMenu, CTXMenuSingleton } from "./interfaces";
import { resetDirections, setPosition } from "./position";
//@ts-ignore file will only be present after first run of npm run build
import { styles } from "./styles";
import { getProp, isDisabled, itemIsSubMenu } from "./typeguards";

type CTXHandler = Exclude<HTMLElement["oncontextmenu"], null>;

interface CTXCache {
    [key: string]: {
        ctxMenu: CTXMenu,
        handler: CTXHandler,
        config: CTXConfig
    } | undefined;
}

class ContextMenu implements CTXMenuSingleton {
    private static instance: ContextMenu;
    private menu: HTMLUListElement | undefined;
    private cache: CTXCache = {};
    private onHide: Function | undefined;
    private onBeforeHide: Function | undefined;
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
            "attach": instance.attach.bind(instance),
            "delete": instance.delete.bind(instance),
            "hide": instance.hide.bind(instance),
            "show": instance.show.bind(instance),
            "update": instance.update.bind(instance)
        };
    }

    public attach(target: string, ctxMenu: CTXMenu, config: CTXConfig = {}): void {
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
            this.show(ctxMenu, e, config);
        };

        this.cache[target] = {
            ctxMenu,
            handler,
            config
        };
        t.addEventListener("contextmenu", handler);
    }

    public update(target: string, ctxMenu?: CTXMenu, _config: CTXConfig = {}) {
        const o = this.cache[target];
        const config = Object.assign({}, o?.config, _config);
        const t = document.querySelector<HTMLElement>(target);
        o && t?.removeEventListener("contextmenu", o.handler);
        delete this.cache[target];
        this.attach(target, ctxMenu || o?.ctxMenu || [], config);
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

    public show(ctxMenu: CTXMenu, eventOrElement: HTMLElement | MouseEvent, config: CTXConfig = {}) {
        if (eventOrElement instanceof MouseEvent) {
            eventOrElement.stopImmediatePropagation();
            eventOrElement.preventDefault();
        }
        //close any open menu
        this.hide();

        this.onHide = config.onHide;
        this.onBeforeHide = config.onBeforeHide;

        const newMenu = config.onBeforeShow?.(ctxMenu.slice(), eventOrElement instanceof MouseEvent ? eventOrElement : undefined) ?? ctxMenu;
        this.menu = this.generateDOM(newMenu, eventOrElement, config.attributes);

        document.body.appendChild(this.menu);
        config.onShow?.(this.menu);

        this.menu.addEventListener("wheel", () => { this.preventCloseOnScroll = true }, { passive: true });
    }


    public hide() {
        this._hide(this.menu);
    }

    private _hide(menuOrSubMenu: Element | undefined) {
        this.onBeforeHide?.(menuOrSubMenu);
        resetDirections();
        if (!menuOrSubMenu) return;

        menuOrSubMenu.remove();
        this.onHide?.(menuOrSubMenu);

        if (menuOrSubMenu === this.menu) {
            delete this.menu;
            this.onBeforeHide = undefined;
            this.onHide = undefined;
        }
    }

    /** creates the menu Elements, sets the menu position and attaches submenu lifecycle handlers */
    private generateDOM(ctxMenu: CTXMenu, parentOrEvent: HTMLElement | MouseEvent, attributes: Record<string, string> = {}): HTMLUListElement {
        const container = generateMenu(ctxMenu);
        setPosition(container, parentOrEvent);
        ctxMenu.forEach((item, i) => {
            const li = container.children[i] as HTMLLIElement;
            //all items shoud close submenus on hover which are not their own
            onHoverDebounced(li, () => {
                const subMenu = li.parentElement?.querySelector("ul");
                if (subMenu && subMenu.parentElement !== li) {
                    this._hide(subMenu);
                }
            });

            if (isDisabled(item)) return;
            if (!itemIsSubMenu(item)) return;

            onHoverDebounced(li, () => {
                if (li.querySelector("ul")) return;
                li.appendChild(this.generateDOM(getProp(item.subMenu), li, getProp(item.subMenuAttributes)));
            });
        });

        Object.entries(attributes).forEach(([attr, val]) => container.setAttribute(attr, val));

        return container;
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

