---
component: combobox
slug: combobox
status: stable
source: components/ui/combobox.tsx
builtOn: Base UI Combobox
---

# Combobox

Searchable select with typeahead filtering. Use when the option list is long enough that a plain `Select` would be unwieldy.

## When to use

- Lists with 10+ items where search is helpful.
- When the user knows the value they want but needs to find it fast.

## When NOT to use

- Short lists (≤ 8 items) — use `Select`.
- Free-text input — use `Input`.

## Modes

- **Single select** (default): one value, renders `ComboboxTrigger` as the anchor.
- **Multi-select**: pass `multiple` prop to `Combobox`.
- **Inline input**: replace `ComboboxTrigger` with `ComboboxInput` for always-visible search.

## Parts

`Combobox`, `ComboboxTrigger`, `ComboboxInput`, `ComboboxContent`, `ComboboxList`, `ComboboxItem`, `ComboboxEmpty`, `ComboboxGroup`, `ComboboxGroupLabel`

## Examples

```tsx
// Dropdown combobox
<Combobox>
  <ComboboxTrigger className="w-48" />
  <ComboboxContent>
    <ComboboxList>
      <ComboboxItem value="red">Red</ComboboxItem>
      <ComboboxItem value="green">Green</ComboboxItem>
      <ComboboxItem value="blue">Blue</ComboboxItem>
      <ComboboxEmpty>No colours found.</ComboboxEmpty>
    </ComboboxList>
  </ComboboxContent>
</Combobox>

// Multi-select
<Combobox multiple>
  <ComboboxInput placeholder="Select tags…" />
  <ComboboxContent>
    <ComboboxList>
      <ComboboxItem value="react">React</ComboboxItem>
      <ComboboxItem value="typescript">TypeScript</ComboboxItem>
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Controlled selected value. |
| `defaultValue` | `string` | — | Uncontrolled initial value. |
| `onValueChange` | `(value: string) => void` | — | Called when the selection changes. |

## Sub-components

### `ComboboxTrigger`

The text input + trigger that opens the popup.

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

### `ComboboxContent`

The popup with the filterable list. Portals to document body.

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

### `ComboboxItem`

An individual option.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | The value this item represents. |

_Built on Base UI Combobox. Searchable Select — type to filter._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/combobox.tsx`. Peer deps: `@base-ui-components/react`, `lucide-react`, `clsx`, `tailwind-merge`.
