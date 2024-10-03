
export type ValueOrFunction<T> = T | (() => T);

/** This is a Divider Menu Item */
export interface CTXMDivider {
    isDivider: true;
}

export type CTXMItemEventListener<K extends keyof HTMLElementEventMap> = (this: HTMLLIElement, ev: HTMLElementEventMap[K]) => any;

export type CTXMItemEventRegistry = {
    [K in keyof HTMLElementEventMap]?: CTXMItemEventListener<K> | {
        listener: CTXMItemEventListener<K>,
        options?: AddEventListenerOptions
    };
}

/**
 * This is a heading item which displays a text and optionally shows a tooltip when hovering over it.
 *
 * NOTE: _All other menu items (except the divider item) derive from this and have at least these properties_
 */
export interface CTXMHeading {
    /** The text of the Context Menu Item */
    text?: ValueOrFunction<string>;
    /** The tooltip of the Context Menu Item */
    tooltip?: ValueOrFunction<string>;
    /** Define custom html content instead of text for the Context Menu Item */
    html?: ValueOrFunction<string>;
    /** Define a custom HTMLElement as content of the Context Menu Item  */
    element?: ValueOrFunction<HTMLElement>;
    /** URL or :data URL to an image, used as icon */
    icon?: ValueOrFunction<string>;
    /** inline attribute appended to the `<li>` Element */
    style?: ValueOrFunction<string>;
    /** A record of event listeners */
    events?: ValueOrFunction<CTXMItemEventRegistry>;
    /** A record of attributes to assign to the menu item, possibly overwriting existing ones */
    attributes?: ValueOrFunction<Record<string, string>>;
}

export interface CTXMInteractive extends CTXMHeading {
    /** Whether the Context Menu Item is disabled or not. Defaults to `false` */
    disabled?: ValueOrFunction<boolean>;
}

/** This is an interactive item which will execute a given javascript function when clicked. */
export interface CTXMAction extends CTXMInteractive {
    /** A function that is called when the Action Item is clicked. Takes a `MouseEvent` as parameter. */
    action: (ev: MouseEvent) => void;
}

/** This is an interactive item which implements an anchor tag (`<a>`) and will redirect to a given URL (`href`). */
export interface CTXMAnchor extends CTXMInteractive {
    /** Contains a URL or a URL fragment that the hyperlink points to. */
    href: ValueOrFunction<string>;
    /** Specifies where to display the linked URL. (e.g. `"_blank"` to open it in a new tab) */
    target?: ValueOrFunction<string>;
    /** Prompts the user to save the linked URL instead of navigating to it. The specified value will be the filename, use empty string to inherit filename from target url. 
     * 
     * __Note:__ works only with same-origin URLs */
    download?: ValueOrFunction<string>;
}

/** This is an interactive item which holds a menu definition. You can create infinitely deep nested submenus. */
export interface CTXMSubMenu extends CTXMInteractive {
    /** The menu definition for the nested menu */
    subMenu: ValueOrFunction<CTXMenu>;
    /** The attributes for the nested menus container */
    subMenuAttributes: ValueOrFunction<Record<string, string>>;
}

export type CTXMItem = CTXMAnchor | CTXMAction | CTXMHeading | CTXMDivider | CTXMSubMenu;

/**
 * This is a Menu Definition. In fact, it's just an array of Context Menu Items
 */
export type CTXMenu = CTXMItem[];

export interface CTXConfig {
    /**
     * Callback that is called before the context menu is opened.
     * Can be used to manipulate the menu based on the Event. (e.g. to appear at the Cursor Position)
     * @param menu - the original menu definition
     * @param event - mouse event, when openend from context menu event
     * @returns Needs to return a menu definition.
     */
    onBeforeShow?: (menu: CTXMenu, event?: MouseEvent) => CTXMenu;
    onShow?: Function;
    onBeforeHide?: Function;
    onHide?: Function;
    attributes?: Record<string, string>
}

export interface CTXMenuSingleton {
    /**
     * The attach method is used to bind a context menu to any DOM Node and takes the following arguments:
     * @param target A selector string to define the target node (eg `'body'`, or `'#someID'`)
     * @param ctxMenu An array of objects defining the menu layout.
     * @param config A config object, See `CTXConfig`.
     */
    attach(target: string, ctxMenu: CTXMenu, config?: CTXConfig): void;
    /**
     * The update method is used to update an existing context menu.
     * You can update each the menu definition or beforeRender function only by passing undefined for the other argument.
     * If you try to update a menu which does not exist, it will silently be attached instead.
     * @param target A selector string to define the target node (eg `'body'`, or `'#someID'`)
     * @param ctxMenu An array of objects defining the updated menu layout. _(can be undefined when only updating config)_
     * @param config A config object, See `CTXConfig`. Only defined members will be updated.
     */
    update(target: string, ctxMenu?: CTXMenu, config?: CTXConfig): void;
    /**
     * The delete method is used to delete a context menu
     * @param target A selector string to define the target node (eg `'body'`, or `'#someID'`)
     */
    delete(target: string): void;
    /**
     * Create & show a context menu without attaching it to a specific element, based on the passed mouse event.
     * @param ctxMenu An array of objects defining the menu layout.
     * @param e Either a MouseEvent or an HTMLElement, defining where the context menu should be opened.
     */
    show(ctxMenu: CTXMenu, e: MouseEvent | HTMLElement, config?: CTXConfig): void;
    /**
     * Close any contextmenu that might be open at the moment
     */
    hide(): void;
}