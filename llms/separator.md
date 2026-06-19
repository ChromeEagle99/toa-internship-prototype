---
component: separator
slug: separator
status: stable
source: components/ui/separator.tsx
built-on: Base UI Separator
---

# Separator

A visual dividing line. Can be horizontal (default) or vertical.

## When to use

- Between distinct sections of content in a card or sidebar.
- Between groups of items in a toolbar (vertical).
- Between rows of metadata.

## When NOT to use

- For decorative whitespace — use margin/padding.
- Where the structure is conveyed by spacing or semantic grouping alone.

## Accessibility

Renders with `role="separator"`. Base UI adds the appropriate ARIA orientation.

## Examples

```tsx
{/* Horizontal */}
<Separator />

{/* Vertical inside a flex row */}
<div className="flex items-center gap-4">
  <span>Docs</span>
  <Separator orientation="vertical" className="h-4" />
  <span>Components</span>
</div>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Direction of the line. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Built on Base UI Separator. Adds `role="separator"` and correct `aria-orientation`._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/separator.tsx`. Required deps: `@base-ui-components/react`, `clsx`, `tailwind-merge`.
