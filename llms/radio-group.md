---
component: radio-group
slug: radio-group
status: stable
source: components/ui/radio-group.tsx
built-on: Base UI Radio + RadioGroup
---

# Radio Group

Pick one option from a small list of mutually exclusive choices.

## Sub-components

- `RadioGroup` — the group wrapper (handles state, ARIA)
- `RadioGroupItem` — an individual option (pass `value`)
- Pair each item with a `Label` for accessibility

## When to use

- 2–5 mutually exclusive options visible at once (severity level, plan tier).

## When NOT to use

- Many options — use `Select` or `Combobox`.
- Two options that take effect immediately — use `Switch`.
- Multiple selectable options — use `Checkbox`.

## Accessibility

Base UI handles `role="radiogroup"`, arrow-key navigation, and `aria-checked`.

## Examples

```tsx
<RadioGroup defaultValue="medium">
  <div className="flex items-center gap-3">
    <RadioGroupItem id="critical" value="critical" />
    <Label htmlFor="critical">Critical</Label>
  </div>
  <div className="flex items-center gap-3">
    <RadioGroupItem id="medium" value="medium" />
    <Label htmlFor="medium">Medium</Label>
  </div>
</RadioGroup>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Controlled selected value. |
| `defaultValue` | `string` | — | Uncontrolled initial value. |
| `onValueChange` | `(value: string) => void` | — | Called when the selection changes. |
| `disabled` | `boolean` | `false` | Disables the whole group. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

## Sub-components

### `RadioGroupItem`

An individual radio option.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | This item's value. |
| `id` | `string` | — | Used for `Label htmlFor` pairing. |
| `disabled` | `boolean` | `false` | Disables just this option. |

_Built on Base UI Radio + RadioGroup. Keyboard: arrows navigate, Space selects. Always pair each item with a `Label`._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/radio-group.tsx`. Required deps: `@base-ui-components/react`, `clsx`, `tailwind-merge`.
