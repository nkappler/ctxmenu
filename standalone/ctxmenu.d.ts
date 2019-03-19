declare module "ctxmenu" {
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
    export type CTXMItem = CTXMAnchor | CTXMAction | CTXMHeading | CTXMDivider | CTXMSubMenu;
    export type CTXMenu = CTXMItem[];
    export interface CTXMenuSingleton {
        attach(target: string, ctxMenu: CTXMenu, beforeRender?: (menu: CTXMenu, e: MouseEvent) => CTXMenu): void;
        update(target: string, ctxMenu: CTXMenu): void;
        delete(target: string): void;
    }
    export const ctxmenu: CTXMenuSingleton;
}
declare module "standalone" {
    import { CTXMenuSingleton } from "ctxmenu";
    global {
        interface Window {
            ctxmenu: CTXMenuSingleton;
        }
    }
}
