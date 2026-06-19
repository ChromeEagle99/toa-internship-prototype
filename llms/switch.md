---
component: switch
slug: switch
status: stable
source: components/ui/switch.tsx
built-on: Base UI Switch
---

# Switch

A toggle for on/off settings that take effect immediately. Visually distinct from `Checkbox` because the semantic meaning differs.

## When to use

- Settings that take effect immediately ("Auto-refresh feeds", "Dark mode").
- When the change is reversible and instant.

## When NOT to use

- Inside a form that must be submitted — prefer `Checkbox`.
- For multi-select — use `Checkbox`.

## Accessibility

- Always provide a `Label`.
- Base UI handles ARIA (`role="switch"`, `aria-checked`) and keyboard (Space, Enter to toggle).

## Examples

```tsx
<div className="flex items-center gap-3">
  <Switch id="autorefresh" defaultChecked />
  <Label htmlFor="autorefresh">Auto-refresh feeds</Label>
</div>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `checked` | `boolean` | — | Controlled checked state. |
| `defaultChecked` | `boolean` | — | Uncontrolled initial state. |
| `onCheckedChange` | `(checked: boolean) => void` | — | Called when toggled. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Built on Base UI Switch (`role="switch"`). Use for settings that take effect immediately. For form-submit values, prefer Checkbox._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/switch.tsx`. Required deps: `@base-ui-components/react`, `clsx`, `tailwind-merge`.
