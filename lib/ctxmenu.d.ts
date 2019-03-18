/*! ctxMenu v1.0.1 | (c) Nikolaj Kappler | https://github.com/nkappler/ctxmenu/blob/master/LICENSE !*/
export interface CTXMDivider {
    isDivider: true;
}
export interface CTXMHeading {
    text: string;
    tooltip?: string;
}
export interface CTXMInteractive extends CTXMHeading {
    disabled?: boolean;
}
export interface CTXMAction extends CTXMInteractive {
    action: (ev: MouseEvent) => void;
}
export interface CTXMAnchor extends CTXMInteractive {
    href: string;
    target?: string;
}
export interface CTXMSubMenu extends CTXMInteractive {
    subMenu: CTXMenu;
}
export declare type CTXMItem = CTXMAnchor | CTXMAction | CTXMHeading | CTXMDivider | CTXMSubMenu;
export declare type CTXMenu = CTXMItem[];
export interface CTXMenuSingleton {
    attach(target: string, ctxMenu: CTXMenu, beforeRender: (menu: CTXMenu, e: MouseEvent) => CTXMenu): void;
    update(target: string, ctxMenu: CTXMenu): void;
    delete(target: string): void;
}
export declare const ctxmenu: CTXMenuSingleton;
