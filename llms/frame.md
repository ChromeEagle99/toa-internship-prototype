---
component: frame
slug: frame
status: stable
source: components/ui/frame.tsx
---

# Frame

Constrained content frame. Applies consistent `max-width` and `padding` to page sections.

## When to use

- Page section wrappers that need centred, bounded layouts.
- Consistent horizontal rhythm across a multi-section page.

## Props

| prop | values | default |
|------|--------|---------|
| `padding` | `none`, `sm`, `md`, `lg`, `xl` | `md` |
| `maxWidth` | `sm`, `md`, `lg`, `xl`, `2xl`, `full` | `xl` |

## Examples

```tsx
// Page section
<Frame maxWidth="xl" padding="lg">
  <Heading>Section title</Heading>
  <p>Content here.</p>
</Frame>

// Full-bleed (no max-width constraint)
<Frame maxWidth="full" padding="md">
  <MapComponent />
</Frame>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Constrained content frame with consistent horizontal padding and a centered max-width. Use as a page-level container._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/frame.tsx`. Requires `class-variance-authority`, `clsx`, `tailwind-merge`.
