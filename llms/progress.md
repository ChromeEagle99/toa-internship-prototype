---
component: progress
slug: progress
status: stable
source: components/ui/progress.tsx
built-on: Base UI Progress
---

# Progress

A determinate progress bar. Use when the operation's duration or completion percentage is known.

## When to use

- File uploads, multi-step forms, batch operations with measurable progress.

## When NOT to use

- Unknown durations — use `Spinner`.

## Props

Accepts Base UI Progress.Root props, primarily `value` (0–100).

## Examples

```tsx
<Progress value={65} />
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | — | Current value (0–100). |
| `max` | `number` | `100` | Maximum value. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Built on Base UI Progress. Determinate only — use Spinner for unknown durations._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/progress.tsx`. Required deps: `@base-ui-components/react`, `clsx`, `tailwind-merge`.
