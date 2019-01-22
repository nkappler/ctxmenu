# ctxMenu.js

Tiny _(~2.2kB minified and gzipped)_ and customizable context menu generator.

#### Table of contents
[Features](#Features)\
[Installation](#Installation)\
[Menu Definition](#Menu-Definition)\
[Item Types](#item-types) \
[API](#API)

## Features

- Create custom context menus for every browser.
- Style the context menu with css.
- No dependencies.
- Callback to customize based on event properties _(Cursor position, etc.)_
- Different menu items: headings, anchors, action items, dividers and submenus
- Interactive menu items can be disabled


## Installation

Just download and link ctxMenu.js or ctxMenu.min.js in your websites header.

```html
<head>
    <!-- ... -->

    <script src="../ctxMenu.js"></script>

</head>
```

## Menu Definition

Menu definitions are used to describe the content of a context menu. A menu definition is an array of objects, where each object defines a single item in the menu.


Example:

![Screenshot](https://raw.githubusercontent.com/nkappler/ctxmenu/master/docs/simpleMenu.png)

```javascript
var menuDefinition = [
    { text: "Heading" },
    {
        text: "Action Item",
        action: () => alert("Hello World!")
    },
    { isDivider: true },
    {
        text: "Anchor Item",
        href: "",
        disabled: true
    }
]
```

## Item Types

[Heading](#heading-item) \
[Anchor](#anchor-item) \
[Action Item](#action-item) \
[Submenu](#submenu-item)\
[Divider](#divider-item)

### Heading Item

This is a heading item which displays a text and optionally shows a tooltip when hovering over it.

```typescript
{
    text: string,
    tooltip?: string
}
```

NOTE: _All other menu items (except the divider item) derive from this and have at least these two properties_

### Anchor Item

This is an interactive item which implements an anchor tag (`<a>`) and will redirect to a given URL (`href`).

```typescript
{
    text: string,
    href: string,       // URL
    target: string,     // eg. "_blank" to open link in new tab
    tooltip?: string,
    disabled?: boolean  // default false
}
```

### Action Item

This is an interactive item which will execute a given javascript function when clicked.

```typescript
{
    text: string,
    action: Function,
    tooltip?: string,
    disabled?: boolean  // default false
}
```

### Submenu Item

This is an interactive item which holds another [menu definition](#Menu-Definition). You can create infinitely deep nested submenus.

```typescript
{
    text: string,
    subMenu: Array,     // A menu definition
    tooltip?: string,
    disabled?: boolean  // default false
}
```

### Divider Item

This is a divider item which draws a horizontal line.

```typescript
{ isDivider: true }
```

## API

This library defines a global object `ContextMenu` with three APIs:

[attach](#contextmenu.attach)\
[update](#contextmenu.update)\
[delete](#contextmenu.delete)

### `ContextMenu.attach`
```typescript
ContextMenu.attach(target: string, ctxmenu: Array, beforeRender?: (menu: Array, event: MouseEvent) => Array)
```

The attach method is used to bind a context menu to any DOM Node and takes the following arguments:
- `target`: A selector string to define the target node (eg `'body'`, or `'#someID'`)
- `ctxmenu`: An Array of objects defining the menu layout. See [Menu Definition](#Menu-Definition).
- `beforeRender?`: An optional callback function that is called before the context menu is opened. It is passed two arguments: `menu` - the menu definition, `event` - the MouseEvent and needs to return a new menu definition which will be used.

### `ContextMenu.update`
```typescript
ContextMenu.update(target: string, ctxmenu: Array)
```

The update method is used to update an existing context menu. If you try to update a menu which does not exist, it will silently be [attached](#attach) instead.

`update` takes two arguments: `target` - the selector string to define the target element and `ctxmenu` - the updated menu definition.

### `ContextMenu.delete`
```typescript
ContextMenu.delete(target: string)
```
The delete method is used to delete a context menu and only takes the `target` selector string.
