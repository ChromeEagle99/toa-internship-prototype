---
component: heading
slug: heading
status: stable
source: components/ui/heading.tsx
---

# Heading

Semantic heading element with size variants decoupled from the HTML tag.

## When to use

- Page titles, section headers, card titles, dialog headings.
- When you need the visual size to differ from the semantic level (e.g. `as="h3"` with `size="4xl"`).

## When NOT to use

- For body text — use `Text`.
- For labels on form controls — use `Label`.

## Props

| prop  | values | default |
|-------|--------|---------|
| `as`  | `h1`–`h6` | `h2` |
| `size` | `4xl`, `3xl`, `2xl`, `xl`, `lg`, `md` | `2xl` |

## Examples

```tsx
<Heading size="4xl" as="h1">Page title</Heading>
<Heading size="2xl">Section heading</Heading>
<Heading size="lg" as="h3">Subsection</Heading>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2` | Renders as `<h1>` through `<h6>`. Affects size and weight. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Use `level` to set both semantic level and visual size at once._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/heading.tsx`. Requires `class-variance-authority`, `clsx`, `tailwind-merge`.
