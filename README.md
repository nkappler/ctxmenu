# ctxMenu.js

Tiny _(~3kB minified)_ and configurable context menu generator.

NOTE: _ctxMenu.js is currently still in alpha stage. Expect more features to come soon._

## Features

- Create custom context menus for every browser.
- Style the context menu with css.
- no dependencies.
- Create anchors, javascript functions or plain text.
- Callback to customize based on event properties _(Cursor position, etc.)_

## Planned Features

- Submenus
- Headings
- Splitters / Groups
- Disable entries

## Installation

Just download and link ctxMenu.js or ctxMenu.min.js in your websites header.

```html
<head>
    <!-- ... -->

    <script src="../ctxMenu.js"></script>

</head>
```

## [](#Menu-Definition)Menu Definition

Menu definitions are used to describe the content of a context menu. A menu definition is an array of objects, where each object defines a single item in the menu.


Example:

<div style="dislpay: inline-block; float:right; margin: 3px 20px">

![Screenshot](https://raw.githubusercontent.com/nkappler/ctxmenu/master/doc/simpleMenu.png)

</div>
<div style="float: left">

```javascript
var menuDefinition = [
    { text: "Item 1" },
    { text: "Item 2" }
]
```

</div>

These items don't have any functionality however, they are only displaying text.
There are multiple types of menu items, which have different properties and behave differently.

#

### Text Item

This is a basic menu item which displays a text and optionally shows a tooltip when hovering over it.

```typescript
{
    text: string,
    tooltip?: string
}
```

NOTE: _All other menu items derive from this and have at least these two properties_

#

### Anchor Item

This is an interactive item which implements an anchor tag (`<a>`) and will redirect to a given URL (`href`).

```typescript
{
    text: string,
    href: string, // URL
    target: string, // eg. "_blank" to open link in new tab
    tooltip?: string
}
```

#

### Action Item

This is an interactive item which will execute a given javascript function when clicked.

```typescript
{
    text: string,
    action: Function,
    tooltip?: string
}
```


## API

This library defines a global object `ContextMenu` with three APIs:

- attach
- update
- delete

```typescript
attach(target: string, ctxmenu: Array, beforeRender?: (menu: Array, event: MouseEvent) => Array)
```
#

This method is used to bind a context menu to any DOM Node and takes the following arguments:
- `target`: A selector string to define the target node (eg `'body'`, or `'#someID'`)
- `ctxmenu`: An Array of objects defining the menu layout. See [Menu Definition](#Menu-Definition).
- `beforeRender?`: An optional callback function that is called before the context menu is opened. It is passed two arguments: `menu` - the menu definition, `event` - the MouseEvent and needs to return a new menu definition which will be used.

#

```typescript
update(target: string, ctxmenu: Array)
```

This method is used to update an existing context menu. If you try to update a menu which does not exist, it will silently be added instead.

`update` takes two arguments: `target` - the selector string to define the target element and `ctxmenu` - the updated menu definition.

#

```typescript
public delete(target: string)
```
This method is used to delete a context menu and only takes the `target` selector string.
