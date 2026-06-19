---
component: empty-state
slug: empty-state
status: stable
source: components/ui/empty-state.tsx
---

# Empty State

Placeholder shown when a content region has no items. Accepts an icon, title, description, and optional action.

## When to use

- Empty search results, empty lists, empty data tables.
- First-run states where a user hasn't yet created content.

## Props

| prop | type | required |
|------|------|----------|
| `title` | `string` | yes |
| `description` | `string` | no |
| `icon` | `ReactNode` | no |
| `action` | `ReactNode` | no |

## Examples

```tsx
<EmptyState
  icon={<Search className="h-6 w-6" />}
  title="No results"
  description="Try adjusting your search filters."
  action={<Button variant="outline" size="sm">Clear filters</Button>}
/>

// Without icon or action (minimal)
<EmptyState title="Nothing here yet" description="Create your first item to get started." />
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

## Sub-components

### `EmptyStateIcon`

Large icon at the top.

### `EmptyStateTitle`

Headline.

### `EmptyStateDescription`

Supporting text.

### `EmptyStateActions`

Row of CTAs below the text.

_Placeholder for empty data regions. Compose with a primary CTA when actionable._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/empty-state.tsx`. Requires `clsx`, `tailwind-merge`.
