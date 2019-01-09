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

class ContextMenu {
    public constructor() {/***/ }

    public static attach(target: Element | string, menu: CTXMenu) {
        const t = typeof target === "string" ? document.querySelector(target) : target;
        if (t) {
            window.addEventListener("contextmenu", e => {
                if (e.target !== t) {
                    return;
                }
                const container = document.createElement("ul");
                menu.forEach(item => {
                    const li = document.createElement("li");
                    li.innerHTML = item.text;
                    li.title = item.title || "";
                    container.appendChild(li);
                });
                Object.assign<CSSStyleDeclaration, Partial<CSSStyleDeclaration>>(container.style, {
                    position: "fixed",
                    left: e.offsetX + "px",
                    top: e.offsetY + "px"
                });
                document.body.appendChild(container);
                e.preventDefault();
                setTimeout(() => container.remove(), 2000);
            });
        } else {
            console.error(`target element ${target} not found`);
        }
    }
}
