---
component: checkbox
slug: checkbox
status: stable
source: components/ui/checkbox.tsx
built-on: Base UI Checkbox
---

# Checkbox

A binary on/off control. Use for toggling individual options, especially when multiple from a list can be selected simultaneously.

## When to use

- Single binary settings ("Notify on critical alerts").
- Multi-select within a list ("Select which operators to notify").

## When NOT to use

- Single toggle that immediately changes state — use `Switch` (semantically reads as "switch", not "check this and submit").
- Mutually exclusive choices — use `Radio Group`.

## Accessibility

- Always provide an associated `Label`.
- Base UI handles keyboard support (Space toggles) and `aria-checked`.

## Examples

```tsx
<div className="flex items-center gap-3">
  <Checkbox id="notify" defaultChecked />
  <Label htmlFor="notify">Notify on critical alerts</Label>
</div>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `checked` | `boolean` | — | Controlled checked state. |
| `defaultChecked` | `boolean` | — | Uncontrolled initial checked state. |
| `onCheckedChange` | `(checked: boolean) => void` | — | Called when the checked state changes. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Built on Base UI Checkbox. Always pair with a `Label` for accessibility. Base UI handles keyboard support (Space) and `aria-checked`._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/checkbox.tsx`. Required deps: `@base-ui-components/react`, `lucide-react`, `clsx`, `tailwind-merge`.
