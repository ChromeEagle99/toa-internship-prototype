---
component: card
slug: card
status: stable
source: components/ui/card.tsx
---

# Card

A container that groups related information into a single visual unit. Five sub-components let you structure the contents predictably.

## Sub-components

- `Card` — outer container
- `CardHeader` — title + description region
- `CardTitle` — heading element (h3 by default)
- `CardDescription` — secondary text under the title
- `CardContent` — main body
- `CardFooter` — actions row at the bottom

## When to use

- Grouping a related set of fields, stats, or details on a page.
- Building dashboard widgets, settings sections, or feature blocks.

## When NOT to use

- For pages that are primarily long-form content (use a `Frame` + headings).
- For floating overlays (use `Dialog`, `Popover`, or `Sheet`).

## Examples

```tsx
<Card>
  <CardHeader>
    <CardTitle>Recent activity</CardTitle>
    <CardDescription>The last 7 days of operator actions.</CardDescription>
  </CardHeader>
  <CardContent>
    {/* ... */}
  </CardContent>
  <CardFooter>
    <Button size="sm">View all</Button>
  </CardFooter>
</Card>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

## Sub-components

### `CardHeader`

Title + description region.

### `CardTitle`

Heading element (h3 by default).

### `CardDescription`

Secondary text under the title.

### `CardContent`

Main body.

### `CardFooter`

Actions row at the bottom.

_All sub-components forward `ref` and spread their HTML attributes._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/card.tsx`. Required deps: `clsx`, `tailwind-merge`.
