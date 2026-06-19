---
component: textarea
slug: textarea
status: stable
source: components/ui/textarea.tsx
---

# Textarea

Multi-line text input. Use when the user may write more than one line — descriptions, comments, notes.

## When to use

- Free-form multi-line input.
- Anywhere the content is expected to wrap.

## When NOT to use

- Single-line input — use `Input`.
- Rich text or markdown editing — not yet covered by PRIZM primitives.

## Accessibility

- Pair with `Label` or wrap in `Field`.
- Set `rows` to suggest visible height; users can still resize.

## Examples

```tsx
<Textarea placeholder="Describe the incident..." rows={4} />
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `rows` | `number` | `—` | Suggested visible height in rows. Users can still resize. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Spreads all `<textarea>` props. Minimum height is 80px. Forwards `ref` to the textarea._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/textarea.tsx`. Required deps: `clsx`, `tailwind-merge`.
