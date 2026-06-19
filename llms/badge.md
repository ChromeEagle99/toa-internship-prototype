---
component: badge
slug: badge
status: stable
source: components/ui/badge.tsx
---

# Badge

A small status indicator or label. Non-interactive by default.

## Variants

| variant   | When to use |
|-----------|-------------|
| `solid`   | Strong emphasis — counts, primary tags |
| `outline` | Quiet labels — categories, filters |
| `subtle`  | Default — generic status without state meaning |
| `success` | Confirmed states — "active", "verified" |
| `warning` | Caution — "review", "pending" |
| `danger`  | Problems — "error", "blocked" |
| `info`    | Neutral informational state — "new", "draft" |

## When to use

- Inline status (next to a name, row, or title)
- Count indicators
- Tags and categories

## When NOT to use

- For actions — use `Button`
- For toggle states — use `Switch` or `Checkbox`

## Accessibility

Badges are non-interactive `<span>` elements. If the status conveys important state, ensure the surrounding context makes it clear to screen readers — color alone is not sufficient.

## Examples

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">3 pending</Badge>
<Badge variant="danger">Blocked</Badge>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"solid" \| "outline" \| "subtle" \| "success" \| "warning" \| "danger" \| "info"` | `"subtle"` | Semantic tone. Use `success`/`warning`/`danger`/`info` for status meaning. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Renders a non-interactive `<span>`. If status meaning is critical, ensure surrounding context conveys it — color alone is not sufficient._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/badge.tsx`. Required deps: `class-variance-authority`, `clsx`, `tailwind-merge`.
