/*! ctxMenu v0.1 | (c) Nikolaj Kappler | https://github.com/nkappler/ctxmenu/blob/master/LICENSE !*/

declare const css: any;

interface CTXMHeading {
    text: string;
    tooltip?: string;
}

interface CTXMInteractive extends CTXMHeading {
    disabled?: boolean;
}

interface CTXMAction extends CTXMInteractive {
    action: Function;
}

interface CTXMAnchor extends CTXMInteractive {
    href: string;
    target?: string;
}

type CTXMItem = CTXMAnchor | CTXMAction | CTXMHeading;

type CTXMenu = CTXMItem[];

interface CTXCache {
    [key: string]: {
        ctxmenu: CTXMenu,
        handler: Function,
    } | undefined;
}

interface Window {
    ContextMenu: ContextMenu;
}


class ContextMenu {
    private menu: HTMLUListElement | undefined;
    private cache: CTXCache = {};
    public constructor() {
        window.addEventListener("click", () => this.closeMenu());
        window.addEventListener("resize", () => this.closeMenu());
        window.addEventListener("scroll", () => this.closeMenu());
    }

    public attach(target: string, ctxmenu: CTXMenu, beforeRender: (menu: CTXMenu, e: MouseEvent) => CTXMenu = m => m) {
        const t = document.querySelector(target);
        if (this.cache[target] !== undefined) {
            console.error(`target element ${target} already has a context menu assigned. Use ContextMenu.update() intstead.`);
            return;
        }
        if (!t) {
            console.error(`target element ${target} not found`);
            return;
        }
        const handler = (e: MouseEvent) => {
            e.stopImmediatePropagation();
            //close any open menu
            this.closeMenu();

            const newMenu = beforeRender([...ctxmenu], e);
            this.menu = ContextMenu.generateDOM(e, newMenu);
            document.body.appendChild(this.menu);

            e.preventDefault();
        };

        this.cache[target] = {
            ctxmenu,
            handler
        };
        t.addEventListener("contextmenu", handler as EventListener);
    }

    public update(target: string, ctxmenu: CTXMenu) {
        const o = this.cache[target];
        const t = document.querySelector(target);
        t && t.removeEventListener("contextmenu", (o && o.handler) as EventListener);
        delete this.cache[target];
        this.attach(target, ctxmenu);
    }

    public delete(target: string) {
        const o = this.cache[target];
        if (!o) {
            console.error(`no context menu for target element ${target} found`);
            return;
        }
        const t = document.querySelector(target);
        if (!t) {
            console.error(`target element ${target} does not exist (anymore)`);
            return;
        }
        t.removeEventListener("contextmenu", o.handler as EventListener);
        delete this.cache[target];
    }

    private closeMenu() {
        if (this.menu) {
            const p = this.menu.parentElement;
            p && p.removeChild(this.menu);
            delete this.menu;
        }
    }

    private static generateDOM(e: MouseEvent, ctxmenu: CTXMenu) {
        const container = document.createElement("ul");
        if (ctxmenu.length === 0) {
            container.style.display = "none";
        }
        ctxmenu.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `<span>${item.text}</span>`;
            li.title = item.tooltip || "";
            if (!(item as CTXMInteractive).disabled) {
                if (ContextMenu.itemIsAction(item)) {
                    li.addEventListener("click", () => item.action());
                    li.className = "interactive";
                }
                else if (ContextMenu.itemIsAnchor(item)) {
                    li.innerHTML = `<a href="${item.href}" target="${item.target || ""}">${item.text}</a>`;
                    li.className = "interactive";
                } else {
                    //Heading
                    li.style.fontWeight = "bold";
                    li.style.marginLeft = "-5px";
                }
            } else {
                li.className = "disabled";
            }
            container.appendChild(li);
        });
        container.style.position = "fixed";
        container.style.left = e.offsetX + "px";
        container.style.top = e.offsetY + "px";
        container.className = "ctxmenu";
        return container;
    }

    private static itemIsAction(item: CTXMItem): item is CTXMAction {
        return item.hasOwnProperty("action");
    }

    private static itemIsAnchor(item: CTXMItem): item is CTXMAnchor {
        return item.hasOwnProperty("href");
    }
}

window.ContextMenu = new ContextMenu();

document.addEventListener("readystatechange", e => {
    if (document.readyState === "interactive") {
        //insert default styles as css -> low priority
        const styles = document.createElement("style");
        styles.innerHTML =
            css`ul.ctxmenu {
                border: 1px solid #999;
                padding: 2px 0;
                box-shadow: 3px 3px 3px #aaa;
                background: #fff;
            }
            ul.ctxmenu li {
                margin: 1px 0;
                display: block;
            }
            ul.ctxmenu li * {
                display: block;
                padding: 2px 20px;
                cursor: default;
            }
            ul.ctxmenu li a {
                color: inherit;
                text-decoration: none;
            }
            ul.ctxmenu li.disabled {
                color: #aaa;
            }
            ul.ctxmenu li.interactive:hover {
                background: rgba(0,0,0,0.1);
            }
        `;
        document.head.insertBefore(styles, document.head.childNodes[0]);
    }
});
