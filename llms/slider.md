---
component: slider
slug: slider
status: stable
source: components/ui/slider.tsx
built-on: Base UI Slider
---

# Slider

Pick a numeric value within a range. Use when imprecise selection is acceptable and the range is meaningful.

## When to use

- Volume, opacity, density settings.
- Filter ranges where exact values are less important than the relative position.

## When NOT to use

- Precise numeric input — use `Input type="number"`.
- Categorical choices — use `Select` or `RadioGroup`.

## Props

Accepts Base UI Slider.Root props: `defaultValue`, `min`, `max`, `step`, `disabled`, etc.

## Accessibility

Base UI handles `role="slider"`, arrow-key adjustment, and Home/End for min/max.

## Examples

```tsx
<Slider defaultValue={40} min={0} max={100} step={1} />
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | — | Controlled value. |
| `defaultValue` | `number` | — | Uncontrolled initial value. |
| `onValueChange` | `(value: number) => void` | — | Called as the value changes. |
| `min` | `number` | `0` | Minimum value. |
| `max` | `number` | `100` | Maximum value. |
| `step` | `number` | `1` | Granularity. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Built on Base UI Slider. Keyboard: arrows adjust by step, Home/End jump to min/max, PageUp/PageDown adjust by ~10%._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/slider.tsx`. Required deps: `@base-ui-components/react`, `clsx`, `tailwind-merge`.
