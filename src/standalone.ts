import { ctxmenu } from "./ctxmenu";
import type { CTXMenuSingleton } from "./interfaces";

declare global {
    interface Window {
        ctxmenu: CTXMenuSingleton;
    }
}

window.ctxmenu = ctxmenu;

export * from "./interfaces";

