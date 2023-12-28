import { CTXMAction, CTXMAnchor, CTXMDivider, CTXMHeading, CTXMItem, CTXMSubMenu, ValueOrFunction } from "./interfaces";


export function getProp<T>(prop: ValueOrFunction<T>): T {
    return typeof prop === "function" ? (prop as () => T)() : prop;
}

export function itemIsInteractive(item: CTXMItem): item is (CTXMAction | CTXMAnchor | CTXMSubMenu) {
    return !itemIsCustom(item) && (itemIsAction(item) || itemIsAnchor(item) || itemIsSubMenu(item));
}

export function itemIsAction(item: CTXMItem): item is CTXMAction {
    return item.hasOwnProperty("action");
}

export function itemIsAnchor(item: CTXMItem): item is CTXMAnchor {
    return item.hasOwnProperty("href");
}

export function itemIsDivider(item: CTXMItem): item is CTXMDivider {
    return item.hasOwnProperty("isDivider");
}

export function itemIsSubMenu(item: CTXMItem): item is CTXMSubMenu {
    return item.hasOwnProperty("subMenu");
}

export function itemIsCustom(item: CTXMItem): item is CTXMHeading {
    return item.hasOwnProperty("html") || item.hasOwnProperty("element");
}

export function itemIsHeading(item: CTXMItem) {
    return !itemIsInteractive(item) && !itemIsDivider(item) && !itemIsCustom(item);
}

/** checks if an item is disabled
 *
 *  will be true if disabled flag is set or it has an empty submenu
 */
export function isDisabled(item: CTXMItem) {
    return (itemIsInteractive(item) && getProp(item.disabled))
        || (itemIsSubMenu(item) && getProp(item.subMenu).length === 0);
}