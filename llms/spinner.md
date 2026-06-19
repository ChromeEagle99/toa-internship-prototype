---
component: spinner
slug: spinner
status: stable
source: components/ui/spinner.tsx
---

# Spinner

An indeterminate loading indicator. Use when the operation duration is unknown.

## Props

- `size` — `sm`, `md` (default), `lg`, `xl`
- `label` — accessible label, defaults to "Loading"

## When to use

- Loading states with no measurable progress.
- Inside buttons during async actions (use `sm`).

## When NOT to use

- Known-duration progress — use `Progress` (planned).
- Long content placeholders — use `Skeleton`.

## Accessibility

Renders with `role="status"` and a hidden `<title>` matching `label`. Screen readers announce the loading state.

## Examples

```tsx
{/* In a button */}
<Button disabled>
  <Spinner size="sm" /> Saving...
</Button>

{/* In a centered loading region */}
<div className="flex items-center justify-center p-12">
  <Spinner size="xl" label="Loading dashboard" />
</div>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | Spinner size: 12px / 16px / 24px / 40px. |
| `label` | `string` | `"Loading"` | Accessible label exposed via `role="status"` + hidden `<title>`. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Animated SVG spinner. Use for indeterminate loading._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/spinner.tsx`. Required deps: `class-variance-authority`, `clsx`, `tailwind-merge`.
