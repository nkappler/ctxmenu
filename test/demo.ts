/// <reference types="../standalone/ctxmenu" />

import type { CTXConfig, CTXMenu } from "../standalone/ctxmenu";

(() => {
    let ctxmenu: typeof window.ctxmenu;

    const script = document.createElement("script");
    if (["localhost", "file:///"].findIndex(s => document.location.href.includes(s)) > -1) {
        script.src = "../standalone/ctxmenu.js";
        script.onload = () => {
            ctxmenu = window.ctxmenu;
            setup();
        };
    } else {
        script.src = "https://unpkg.com/ctxmenu/index.min.js";
        script.type = "module";
        exports = {};
        script.onload = () => {
            ctxmenu = exports.ctxmenu;
            setup();
        };
    }
    document.head.append(script);

    const setup = () => {

        ctxmenu.attach("html", [
            {
                text: "Actions",
                tooltip: "JS Functions"
            },
            {
                action: function () { alert("Clicked action item") },
                text: "click me"
            },
            { isDivider: true },
            {
                text: "Anchors",
                tooltip: "links (<a>)"
            },
            {
                href: "http://www.google.de",
                target: "_blank",
                text: "Google (new tab)",
                tooltip: "opens in new tab"
            },
            { isDivider: true },
            {
                text: "Tooltips",
                tooltip: "Tooltips are awesome"
            },
            {
                href: "",
                text: "Hover me!",
                tooltip: "Disabled items can also have a tooltip",
                disabled: true
            },
            { isDivider: true },
            {
                text: () => "Callbacks",
                tooltip: () => "Properties can also be defined by a tooltip"
            },
            {
                href: () => "",
                text: () => "Every property can be defined in a callback",
                tooltip: () => "Disabled items can also have a tooltip",
                disabled: () => true
            },
            {
                text: () => "Submenus can also be defined in a callback.",
                subMenu: () => [{
                    href: () => "",
                    text: () => "empty",
                    disabled: () => true
                }]
            },
            { isDivider: true },
            { text: "Custom Elements" },
            {
                html: '<select style="margin: 2px 20px"><option>Option1</option><option>Option2</option></select>',
                subMenu: []
            },
            {
                element: () => {
                    const image = document.createElement("img");
                    image.src = "favicon.png";
                    image.style.margin = "2px 20px";
                    image.style.height = "32px";
                    return image;
                },
                subMenu: []
            },
            { isDivider: true },
            { text: "Styling" },
            {
                text: "Items can be individually styled", style: "font-style: italic; font-weight: normal; text-decoration: underline; transform: skewY(1.5deg); transform-origin: left; color: #ee9900; letter-spacing: 2px; margin-bottom: 10px;",
                tooltip: "No need to provide a completely custom element"
            },
            { isDivider: true },
            {
                text: "Menuception"
            },
            {
                text: "more ...",
                subMenu: [
                    {
                        text: "even more...",
                        subMenu: [
                            {
                                text: "there's nothing here...",
                                action: undefined,
                                disabled: true
                            }
                        ]
                    }
                ]
            },
            {
                text: "even more actions",
                subMenu: [
                    // only for testing
                    // { text: "Spacer", icon: "favicon_nc.png" },
                    // { text: "Spacer", href: "", disabled: true, icon: "favicon_nc.png" },
                    // { text: "Spacer", href: "", disabled: true },
                    // { text: "Spacer", href: "", disabled: true, icon: "favicon_nc.png" },
                    // { text: "Spacer", href: "", disabled: true },
                    // { text: "Spacer", href: "", disabled: true },
                    // { text: "Spacer", href: "", disabled: true },
                    {
                        text: "more",
                        subMenu: menuception("what's\u2800this? deeper and deeper into the rabbit hole ... will it ever end? nobody knows ....... it is still going .... man, this is a deeply nested menu .... almost there .... I\u2800promise ... You did it ... Congrats!".split(" "))
                    }
                ]
            },
            { isDivider: true },
            { text: "Event specific stuff" },
            {
                text: "Hover me!",
                action: () => {/** */ },
                events: {
                    mouseenter: (_e) => document.querySelector("h1")!.style.animation = "blinker 1s linear infinite",
                    mouseleave: {
                        listener: (_e) => document.querySelector("h1")!.style.animation = "",
                    }
                }
            }
        ], {
            onBeforeShow: function (m, e) {
                m.push({
                    text: "e.g. Cursor Position: X:" + e!.clientX + " / Y:" + e!.clientY,
                    href: "",
                    disabled: true
                });
                return m;
            },
            onBeforeHide: (m) => console.log("will be hidden", m),
            onHide: (m) => console.log("menu hidden:", m)
        });

        ctxmenu.attach("#header", []);
        ctxmenu.attach("header", []);
        ctxmenu.attach("[sidebarjs]", []);

        ctxmenu.attach(".download", [
            {
                text: "Downloads",
                subMenu: [
                    {
                        text: "ctxmenu.js",
                        href: "https://unpkg.com/ctxmenu/standalone/ctxmenu.js",
                        download: ""
                    },
                    {
                        text: "ctxmenu.min.js",
                        href: "https://unpkg.com/ctxmenu/standalone/ctxmenu.min.js",
                        download: ""
                    }
                ]
            },
            {
                text: "Documentation (github)",
                href: "https://www.github.com/nkappler/ctxmenu"
            }
        ]);
    }

    const menuception = (array) => {
        if (array.length === 0) { return []; }

        return [{
            text: array.shift(),
            subMenu: menuception(array)
        }];
    }

    const menuExample: CTXMenu = [
        {
            text: "Downloads",
            subMenu: [
                {
                    text: "ctxmenu.js",
                    href: "ctxmenu.js",
                    download: "",
                    attributes: {
                        "style": "display: flex"
                    }
                },
                {
                    text: "ctxmenu.min.js",
                    href: "ctxmenu.min.js",
                    download: "",
                    attributes: {
                        name: "minified",
                    }
                }
            ],
            attributes() {
                return {
                    id: "downloads",
                    name: "downloads"
                }
            },
            subMenuAttributes: {
                class: "downloadsContainer"
            }
        },
        {
            text: "Documentation (github)",
            href: "https://www.github.com/nkappler/ctxmenu"
        }
    ];

    const config: CTXConfig = {
        onBeforeHide: (m) => console.log(m, "onBeforeHide"),
        onHide: (m) => console.log(m, "onHide"),
        onBeforeShow: (m, e) => void console.log(m, e, "onBeforeShow") ?? m,
        onShow: (m) => console.log(m, "onShow"),
        attributes: {
            class: "shouldRetainCtxMenu",
            id: "myID"
        }
    };

    Object.assign(window, {
        // functions used in html file
        showContextMenuForEvent: (e: MouseEvent) => {
            ctxmenu.show(menuExample, e, config);
        },
        showContextMenuForElement: (element: HTMLElement, e: MouseEvent) => {
            e.stopPropagation();
            ctxmenu.show(menuExample, element, config);
        },
        toggleDarkMode: () => {
            const darkCss = document.querySelector("#darkTheme")!;
            const toggle = document.querySelector("#switch")!;
            if (darkCss) {
                document.head.removeChild(darkCss);
                toggle.innerHTML = "Fancy dark mode?";
            }
            else {
                const link = document.createElement("link");
                link.id = "darkTheme";
                link.rel = "stylesheet";
                link.type = "text/css";
                link.href = "./darkTheme.css";
                document.head.appendChild(link);
                toggle.innerHTML = "Back to normal!";
            }
        }
    });

})();