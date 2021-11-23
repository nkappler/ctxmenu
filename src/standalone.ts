import { ctxmenu } from "./ctxmenu";
import type { CTXMenuSingleton } from "./types";

declare global {
    interface Window {
        ctxmenu: CTXMenuSingleton;
    }
}

window.ctxmenu = ctxmenu;

export * from "./types";
