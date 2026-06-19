---
component: text
slug: text
status: stable
source: components/ui/text.tsx
---

# Text

Body text primitive with size, color variant, and weight control.

## When to use

- Paragraphs, captions, descriptions, any running body copy.
- When you need muted or subtle color for secondary information.

## Props

| prop | values | default |
|------|--------|---------|
| `as` | `p`, `span`, `div` | `p` |
| `size` | `xs`, `sm`, `md`, `lg` | `md` |
| `variant` | `default`, `muted`, `subtle` | `default` |
| `weight` | `normal`, `medium`, `semibold` | `normal` |

## Examples

```tsx
<Text>Default body copy.</Text>
<Text variant="muted" size="sm">Secondary caption text.</Text>
<Text weight="semibold" as="span">Inline emphasis.</Text>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `"xs" \| "sm" \| "base" \| "lg"` | `"base"` | Text size. |
| `tone` | `"fg" \| "muted" \| "subtle" \| "accent" \| "danger"` | `"fg"` | Color tone. |
| `as` | `"p" \| "span" \| "div"` | `"p"` | Underlying element. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Body text primitive. Use `as="span"` for inline._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/text.tsx`. Requires `class-variance-authority`, `clsx`, `tailwind-merge`.
