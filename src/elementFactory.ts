import { CTXMHeading } from "../index";
import { ctxmenu } from "./ctxmenu";
import { CTXMenu, CTXMItem } from "./interfaces";
import { getProp, isDisabled, itemIsAction, itemIsAnchor, itemIsDivider, itemIsHeading, itemIsInteractive, itemIsSubMenu } from "./typeguards";

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

export function generateMenu(ctxMenu: CTXMenu) {
    const menu = document.createElement("ul");
    menu.className = "ctxmenu";
    menu.append(...ctxMenu.map(generateMenuItem));
    if (!ctxMenu.length) {
        menu.style.display = "none";
    }
    const noop = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
    }
    // avoid re-opening on itself
    menu.addEventListener("contextmenu", noop);
    // avoid close on click
    menu.addEventListener("click", noop);
    return menu;
}

function generateMenuItem(item: CTXMItem) {
    const li = document.createElement("li");

    populateClassList([
        [itemIsDivider, "divider", false],
        [item => item.icon, "icon", true],
        [itemIsHeading, "heading", false],
        [itemIsSubMenu, "submenu", true],
        [isDisabled, "disabled", false],
        [itemIsInteractive, "interactive", true],
    ], item, li);

    if (itemIsDivider(item)) { return li; }

    [
        makeInnerHTML,
        makeAttributes,
        makeIcon,
        addEventHandlers,
        makeAnchor,
    ].forEach(step => step.call(null, item, li));

    return li;
}

/** takes an array of rules, each consisting of a matching function,
 * a classname and a boolean flag that indicates wether to keep going.
 * the function first filters the rules based on the matchers and then
 * adds the classnames to the list element until the current rule
 * doesn't support additional classnames
  */
function populateClassList(rules: [Function, string, boolean][], item: CTXMItem, li: HTMLLIElement) {
    rules
        .filter(([matcher]) => matcher(item))
        .every(([_, className, supportsSubSequent]) =>
            // @ts-ignore
            !void li.classList.add(className) && supportsSubSequent);
}

function makeInnerHTML({ html, text, element }: CTXMHeading, li: HTMLLIElement) {
    const elem = getProp(element);
    elem
        ? li.append(elem)
        : li.innerHTML = getProp(html) ?? `<span>${getProp(text)}</span>`;
}

function makeAttributes({ tooltip, style, attributes }: CTXMHeading, li: HTMLLIElement) {
    li.title = getProp(tooltip) || "";
    style && li.setAttribute("style", getProp(style));
    attributes && Object.entries(getProp(attributes)).forEach(([attr, val]) => { li.setAttribute(attr, val) });
}

function makeIcon({ icon }: CTXMHeading, li: HTMLLIElement) {
    icon && (li.innerHTML += `<img class="icon" src="${getProp(icon)}" />`);
}

function addEventHandlers(item: CTXMHeading, li: HTMLLIElement) {
    for (const [event, handler] of Object.entries(getProp(item.events) || {})) {
        const { listener, options } = typeof handler === "function" ? { listener: handler, options: {} as EventListenerOptions } : handler;
        li.addEventListener<any>(event, listener, options);
    }

    li.addEventListener("click", e => {
        if (isDisabled(item) || itemIsSubMenu(item)) return;
        itemIsAction(item) && item.action(e);
        itemIsInteractive(item) && ctxmenu.hide();
    });
}

function makeAnchor(item: CTXMHeading, li: HTMLLIElement) {
    if (!itemIsAnchor(item) || isDisabled(item)) { return; }

    const { href, download, target } = item;
    // wrap anchor element around li children
    const a = document.createElement("a");
    a.innerHTML = li.innerHTML;

    a.href = getProp(href);
    download !== undefined && (a.download = getProp(download));
    target && (a.target = getProp(target));
    li.replaceChildren(a);
}
