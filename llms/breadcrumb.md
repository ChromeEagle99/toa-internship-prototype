---
component: breadcrumb
slug: breadcrumb
status: stable
source: components/ui/breadcrumb.tsx
---

# Breadcrumb

A hierarchical navigation trail showing the user's location in the site structure.

## Sub-components

- `Breadcrumb` — root `<nav aria-label="Breadcrumb">`
- `BreadcrumbList` — `<ol>` for the items
- `BreadcrumbItem` — each step
- `BreadcrumbLink` — clickable previous-step
- `BreadcrumbPage` — current page (non-clickable, marked `aria-current="page"`)
- `BreadcrumbSeparator` — visual divider, includes a chevron

## Examples

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbLink href="/projects">Projects</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbPage>PRIZM</BreadcrumbPage></BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

## Sub-components

### `BreadcrumbList`

`<ol>` for the items.

### `BreadcrumbItem`

Each step.

### `BreadcrumbLink`

Clickable previous step.

### `BreadcrumbPage`

Current page — marked `aria-current="page"`, non-clickable.

### `BreadcrumbSeparator`

Chevron divider between items.

_Root renders `<nav aria-label="Breadcrumb">`._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/breadcrumb.tsx`. Required deps: `lucide-react`, `clsx`, `tailwind-merge`.
