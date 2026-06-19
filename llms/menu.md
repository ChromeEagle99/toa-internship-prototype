---
component: menu
slug: menu
status: stable
source: components/ui/menu.tsx
builtOn: Base UI Menu
---

# Menu

Action menu triggered by a button. Supports plain items, checkbox items, radio groups, labels, separators, and submenus. Full keyboard navigation built-in.

## Parts

| export | purpose |
|--------|---------|
| `Menu` | Root |
| `MenuTrigger` | Trigger element |
| `MenuContent` | Floating popup panel |
| `MenuItem` | Standard clickable item |
| `MenuCheckboxItem` | Toggleable item with checkmark |
| `MenuRadioGroup` + `MenuRadioItem` | Single-select group |
| `MenuLabel` | Non-interactive section header |
| `MenuSeparator` | Horizontal divider |
| `MenuShortcut` | Right-aligned keyboard shortcut hint |
| `MenuSubmenu` + `MenuSubmenuTrigger` + `MenuSubmenuContent` | Nested submenu |

## Examples

```tsx
<Menu>
  <MenuTrigger><Button variant="outline">Actions</Button></MenuTrigger>
  <MenuContent>
    <MenuItem onSelect={() => edit()}>Edit</MenuItem>
    <MenuItem onSelect={() => duplicate()}>Duplicate</MenuItem>
    <MenuSeparator />
    <MenuItem onSelect={() => remove()}>
      Delete <MenuShortcut>⌘⌫</MenuShortcut>
    </MenuItem>
  </MenuContent>
</Menu>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Controlled open state. |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the open state changes. |

## Sub-components

### `MenuTrigger`

Element that opens the menu.

### `MenuContent`

The menu popup.

| Prop | Type | Default | Description |
|---|---|---|---|
| `sideOffset` | `number` | `4` | Pixel gap from trigger. |
| `variant` | `"solid" \| "glass"` | `"solid"` | Surface treatment. |

### `MenuItem`

Individual menu item.

### `MenuCheckboxItem`

Toggleable menu item with a check indicator.

### `MenuRadioGroup`

Wraps mutually-exclusive radio items.

### `MenuRadioItem`

An item inside a MenuRadioGroup.

### `MenuLabel`

Plain styled label.

### `MenuGroup`

Semantically-grouped items.

### `MenuGroupLabel`

Aria-associated label for a MenuGroup.

### `MenuSeparator`

Visual divider between items.

### `MenuShortcut`

Keyboard shortcut hint, right-aligned.

### `MenuSubmenu`

Wraps a nested submenu trigger + content.

### `MenuSubmenuTrigger`

Submenu trigger item.

### `MenuSubmenuContent`

Nested submenu popup.

### `MenuSubmenuIndicator`

Chevron showing a submenu exists.

_Built on Base UI Menu._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/menu.tsx`. Peer deps: `@base-ui-components/react`, `lucide-react`, `clsx`, `tailwind-merge`.
