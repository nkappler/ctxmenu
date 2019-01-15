interface CTXMInteractive {
    text: string;
    title?: string;
}

interface CTXMAction extends CTXMInteractive {
    action: Function;
}

interface CTXMAnchor extends CTXMInteractive {
    href: string;
    target?: string;
}

type CTXMItem = CTXMAnchor | CTXMAction;

type CTXMenu = CTXMItem[];

function itemIsAction(item: CTXMItem): item is CTXMAction {
    return item.hasOwnProperty("action");
}

function itemIsAnchor(item: CTXMItem): item is CTXMAnchor {
    return item.hasOwnProperty("href");
}

class ContextMenu {
    private menu: HTMLUListElement | undefined;
    public constructor() {
        window.addEventListener("click", () => this.closeMenu());
        window.addEventListener("resize", () => this.closeMenu());
        window.addEventListener("scroll", () => this.closeMenu());
    }

    public attach(target: Element | string, ctxmenu: CTXMenu) {
        const t = typeof target === "string" ? document.querySelector(target) : target;
        if (t) {
            window.addEventListener("contextmenu", e => {
                if (e.target === t) {
                    e.stopImmediatePropagation();
                    //close any open menu
                    this.closeMenu();

                    const container = document.createElement("ul");
                    ctxmenu.forEach(item => {
                        const li = document.createElement("li");
                        li.innerHTML = item.text;
                        li.title = item.title || "";
                        if (itemIsAction(item)) {
                            li.addEventListener("click", () => item.action());
                            li.className = "interactive";
                        }
                        else if (itemIsAnchor(item)) {
                            li.innerHTML = `<a href="${item.href}" target="${item.target || ""}">${item.text}</a>`;
                            li.className = "interactive";
                        }
                        container.appendChild(li);
                    });
                    Object.assign<CSSStyleDeclaration, Partial<CSSStyleDeclaration>>(container.style, {
                        position: "fixed",
                        left: e.offsetX + "px",
                        top: e.offsetY + "px"
                    });
                    container.className = "ctxmenu";
                    this.menu = container;
                    document.body.appendChild(container);

                    e.preventDefault();
                }
            });
        } else {
            console.error(`target element ${target} not found`);
        }
    }

    public closeMenu() {
        this.menu && this.menu.remove();
    }
}

Object.assign(window, {
    ContextMenu: new ContextMenu()
});

document.addEventListener("readystatechange", e => {
    if (document.readyState === "interactive") {
        //insert default styles as css -> low priority
        const styles = document.createElement("style");
        styles.innerHTML = `
            ul.ctxmenu {
                border: 1px solid #999;
                padding: 2px 0;
                box-shadow: 3px 3px 3px #aaa;
                background: #fff;
            }
            ul.ctxmenu li {
                margin: 1px 0;
                padding: 2px 15px;
                display: block;
            }
            ul.ctxmenu li a {
                color: inherit;
                text-decoration: none;
            }
            ul.ctxmenu li.interactive {
                cursor: pointer;
            }
            ul.ctxmenu li.interactive:hover {
                background: rgba(0,0,0,0.1);
            }
        `;
        document.head.insertBefore(styles, document.head.childNodes[0]);
    }
});
