---
component: skeleton
slug: skeleton
status: stable
source: components/ui/skeleton.tsx
---

# Skeleton

A loading placeholder shaped like the content it will replace. Use to preserve layout and avoid jarring shifts when async content arrives.

## When to use

- Pages or sections fetching content with a noticeable delay (>200ms).
- Inside cards, lists, or table rows during initial load.

## When NOT to use

- Very brief loads (<200ms) — just show the final content; skeletons add noise.
- Indeterminate inline operations — use `Spinner`.

## Accessibility

`aria-hidden="true"` is set automatically — screen readers ignore skeletons. Announce the loading state separately if needed (e.g., a parent `aria-busy="true"`).

## Examples

```tsx
<div className="space-y-3">
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-5/6" />
</div>
```

Size and shape via Tailwind utilities — `h-*`, `w-*`, `rounded-*`.

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Sized via Tailwind utilities on the className (e.g. `h-4 w-3/4`). Auto-applies `aria-hidden="true"`._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/skeleton.tsx`. Required deps: `clsx`, `tailwind-merge`.
