---
component: context-menu
slug: context-menu
status: stable
source: components/ui/context-menu.tsx
builtOn: Base UI Context Menu
---

# Context Menu

Right-click (or long-press) triggered menu. Identical feature set to `Menu` but activates on contextmenu event rather than a button click.

## Parts

Same structure as `Menu`: `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuCheckboxItem`, `ContextMenuRadioGroup`, `ContextMenuRadioItem`, `ContextMenuLabel`, `ContextMenuSeparator`, `ContextMenuShortcut`.

## Examples

```tsx
<ContextMenu>
  <ContextMenuTrigger>
    <div className="h-32 w-full rounded border border-dashed border-border">
      Right-click here
    </div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Open</ContextMenuItem>
    <ContextMenuItem>Rename</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>Delete</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

<!-- prizm:api-start -->
## Props

_No props on the root — see sub-components below._

## Sub-components

### `ContextMenuTrigger`

Wraps the area where right-click should open the menu. Renders a `<div>`.

### `ContextMenuContent`

The menu popup.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"solid" \| "glass"` | `"solid"` | Surface treatment. |

### `ContextMenuItem`

Individual menu item.

### `ContextMenuCheckboxItem`

Toggleable item with check indicator.

### `ContextMenuRadioGroup`

Mutually-exclusive radio items.

### `ContextMenuRadioItem`

An item inside a radio group.

### `ContextMenuLabel`

Plain styled label.

### `ContextMenuGroup`

Semantically-grouped items.

### `ContextMenuGroupLabel`

Aria label for a group.

### `ContextMenuSeparator`

Visual divider.

### `ContextMenuShortcut`

Keyboard shortcut hint.

_Built on Base UI Context Menu. Opens on right-click within the trigger area._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/context-menu.tsx`. Peer deps: `@base-ui-components/react`, `lucide-react`, `clsx`, `tailwind-merge`.
