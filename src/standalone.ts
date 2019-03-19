import { ctxmenu, CTXMenuSingleton } from "./ctxmenu";

declare global {
    interface Window {
        ctxmenu: CTXMenuSingleton;
    }
}

window.ctxmenu = ctxmenu;
