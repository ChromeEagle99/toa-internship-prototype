---
component: pagination
slug: pagination
status: stable
source: components/ui/pagination.tsx
---

# Pagination

Page navigation for long lists. Link-based — wire `href` to your router's page URLs. Optionally use `onClick` for client-side pagination.

## Parts

| export | purpose |
|--------|---------|
| `Pagination` | `<nav>` wrapper with `aria-label="Pagination"` |
| `PaginationContent` | `<ul>` flex row |
| `PaginationItem` | `<li>` wrapper |
| `PaginationLink` | Page number link; `isActive` marks the current page |
| `PaginationPrevious` | Back arrow link |
| `PaginationNext` | Forward arrow link |
| `PaginationEllipsis` | `…` separator for skipped page ranges |

## Examples

```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href={`?page=${page - 1}`} />
    </PaginationItem>
    {pages.map((p) => (
      <PaginationItem key={p}>
        <PaginationLink href={`?page=${p}`} isActive={p === page}>{p}</PaginationLink>
      </PaginationItem>
    ))}
    <PaginationItem>
      <PaginationNext href={`?page=${page + 1}`} />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `page` | `number` | — | Current page (1-indexed). |
| `totalPages` | `number` | — | Total number of pages. |
| `onPageChange` | `(page: number) => void` | — | Called when the user changes pages. |
| `siblingCount` | `number` | `1` | Pages shown adjacent to the current. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/pagination.tsx`. Requires `lucide-react`, `clsx`, `tailwind-merge`.
