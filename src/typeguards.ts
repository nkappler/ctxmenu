import { CTXMAction, CTXMAnchor, CTXMDivider, CTXMHeading, CTXMItem, CTXMSubMenu, ValueOrFunction } from "./interfaces";


export function getProp<T>(prop: ValueOrFunction<T>): T {
    return typeof prop === "function" ? (prop as () => T)() : prop;
}

export function itemIsInteractive(item: CTXMItem): item is (CTXMAction | CTXMAnchor | CTXMSubMenu) {
    return itemIsAction(item) || itemIsAnchor(item) || itemIsSubMenu(item)
        || itemIsCustom(item); /* <-- not really an interactive item,
      since it might miss the 'disabled' prop but doesn't matter since it is optionial anyway.
      using this check for styling reasons mainly, so that custom elements don't get header styling */
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