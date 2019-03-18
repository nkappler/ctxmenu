/*! ctxMenu v1.0.1 | (c) Nikolaj Kappler | https://github.com/nkappler/ctxmenu/blob/master/LICENSE !*/
interface CTXMDivider {
    isDivider: true;
}
interface CTXMHeading {
    text: string;
    tooltip?: string;
}
interface CTXMInteractive extends CTXMHeading {
    disabled?: boolean;
}
interface CTXMAction extends CTXMInteractive {
    action: (ev: MouseEvent) => void;
}
interface CTXMAnchor extends CTXMInteractive {
    href: string;
    target?: string;
}
interface CTXMSubMenu extends CTXMInteractive {
    subMenu: CTXMenu;
}
declare type CTXMItem = CTXMAnchor | CTXMAction | CTXMHeading | CTXMDivider | CTXMSubMenu;
declare type CTXMenu = CTXMItem[];
declare class ContextMenu {
    private menu;
    private cache;
    private dir;
    constructor();
    attach(target: string, ctxMenu: CTXMenu, beforeRender?: (menu: CTXMenu, e: MouseEvent) => CTXMenu): void;
    update(target: string, ctxMenu: CTXMenu): void;
    delete(target: string): void;
    private closeMenu;
    private debounce;
    private generateDOM;
    private openSubMenu;
    private static getBounding;
    private getPosition;
    private static itemIsInteractive;
    private static itemIsAction;
    private static itemIsAnchor;
    private static itemIsDivider;
    private static itemIsSubMenu;
    private static addStylesToDom;
}
export declare const ctxmenu: ContextMenu;
export {};
