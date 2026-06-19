---
component: select
slug: select
status: stable
source: components/ui/select.tsx
built-on: Base UI Select
---

# Select

Pick one option from a finite list. Use a real `Select` (not a native `<select>`) when the list is long, needs styling, or has icons / structured options.

## Sub-components

- `Select` — root
- `SelectTrigger` — the visible control
- `SelectValue` — placeholder/value renderer inside the trigger
- `SelectContent` — the popup list
- `SelectItem` — individual option

## When to use

- 3+ options, single selection.
- When option text needs formatting or grouping.

## When NOT to use

- 2 options — use `Switch` or `Radio Group`.
- Searchable lists — use `Combobox` (planned).
- Many independent options — use `Checkbox` group.

## Accessibility

- Keyboard: Arrow keys navigate, Enter selects, type to search, Escape closes.
- Always include a `SelectValue` with a placeholder when no default is set.
- Wrap in `Field` + `FieldLabel` for full accessibility.

## Examples

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select severity" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="critical">Critical</SelectItem>
    <SelectItem value="high">High</SelectItem>
    <SelectItem value="medium">Medium</SelectItem>
    <SelectItem value="low">Low</SelectItem>
  </SelectContent>
</Select>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Controlled selected value. |
| `defaultValue` | `string` | — | Uncontrolled initial value. |
| `onValueChange` | `(value: string) => void` | — | Called when the selection changes. |
| `disabled` | `boolean` | `false` | Disables the trigger. |

## Sub-components

### `SelectTrigger`

The visible button that opens the popup.

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

### `SelectValue`

Renders the currently selected value inside the trigger.

| Prop | Type | Default | Description |
|---|---|---|---|
| `placeholder` | `ReactNode` | — | Shown when no value is selected. |

### `SelectContent`

The popup list of items. Portals to document body.

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

### `SelectItem`

An individual option.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | The value this item represents. |
| `disabled` | `boolean` | `false` | Disables this item. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Built on Base UI Select. Keyboard: arrows navigate, Enter selects, type to search, Escape closes._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/select.tsx`. Required deps: `@base-ui-components/react`, `lucide-react`, `clsx`, `tailwind-merge`.
