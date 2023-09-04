import { CTXMHeading, CTXMInteractive, CTXMItem } from "./interfaces";
import { getProp, itemIsAction, itemIsAnchor, itemIsDivider, itemIsInteractive, itemIsSubMenu } from "./typeguards";

/**
 * assigns an eventhandler to a list item, that gets triggered after a short timeout,
 * but only if the cursor is still targeting that list item after the timeout. when
 * hovering fast over different list items, the actions do not get triggered.
 * @param target the target list item
 * @param action the event that should trigger after the timeout
 */
export function onHoverDebounced(target: HTMLLIElement, action: (e: MouseEvent) => void) {
    let timeout: number;
    target.addEventListener("mouseenter", (e) => {
        timeout = setTimeout(() => action(e), 150);
    });
    target.addEventListener("mouseleave", () => clearTimeout(timeout));
}

/** checks if an item is disabled
 *
 *  will be true if disabled flag is set or it has an empty submenu
 */
export function isDisabled(item: CTXMInteractive) {
    return getProp(item.disabled) || (itemIsSubMenu(item) && typeof item.subMenu !== "function" && item.subMenu.length === 0);
}

export function generateMenuItem(item: CTXMItem) {
    const li = document.createElement("li");

    if (itemIsDivider(item)) {
        li.className = "divider";
        return li;
    }

    generateBaseItemContent(item, li);

    if (!itemIsInteractive(item)) {
        li.classList.add("heading");
        return li;
    }

    if (isDisabled(item)) {
        li.classList.add("disabled");
        if (itemIsSubMenu(item)) {
            li.classList.add("submenu");
        }
        return li;
    }

    li.classList.add("interactive");

    if (itemIsAnchor(item)) {
        // wrap anchor element around li children
        const a = document.createElement("a");
        a.append(...Array.from(li.childNodes));

        a.href = getProp(item.href);
        if (item.hasOwnProperty("download")) { a.download = getProp(item.download!) }
        if (item.hasOwnProperty("target")) { a.target = getProp(item.target!) }
        li.append(a);
        return li;
    }

    if (itemIsAction(item)) {
        li.addEventListener("click", item.action);
        return li;
    }

    li.classList.add("submenu");
    return li;
}

/**
 * generates the content html of a base item, attaches it to the list element,
 * applies the style attribute if provided and appends the icon if provided.
 */
function generateBaseItemContent(item: CTXMHeading, li: HTMLLIElement) {
    const html = getProp(item.html);
    const text = `<span>${getProp(item.text)}</span>`;
    const elem = getProp(item.element);
    elem
        ? li.append(elem)
        : li.innerHTML = html ? html : text;
    li.title = getProp(item.tooltip) || "";
    if (item.style) { li.setAttribute("style", getProp(item.style)) }
    if (item.icon) {
        li.classList.add("icon");
        li.innerHTML += `<img class="icon" src="${getProp(item.icon)}" />`;
    }
}
