---
component: stack
slug: stack
status: stable
source: components/ui/stack.tsx
---

# Stack

A vertical layout primitive. Equal-gap vertical column. Use to compose forms, lists, or any vertical sequence with consistent spacing.

## Props

- `gap` — spacing scale: `0`, `1`, `2`, `3`, `4` (default), `6`, `8`, `12`
- `align` — cross-axis alignment: `start`, `center`, `end`, `stretch` (default)

## When to use

- Any vertical sequence with consistent spacing.
- As the default layout primitive inside cards, forms, and sections.

## When NOT to use

- For horizontal layouts — use `Group`.
- For 2D grids — use Tailwind grid utilities directly.

## Examples

```tsx
<Stack gap="3">
  <Input placeholder="First name" />
  <Input placeholder="Last name" />
  <Input placeholder="Email" type="email" />
  <Button>Continue</Button>
</Stack>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `gap` | `"0" \| "1" \| "2" \| "3" \| "4" \| "6" \| "8" \| "12"` | `"4"` | Vertical spacing between children (Tailwind scale). |
| `align` | `"start" \| "center" \| "end" \| "stretch"` | `"stretch"` | Cross-axis alignment. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Layout primitive: equal-gap vertical column. Forwards `ref`._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/stack.tsx`. Required deps: `class-variance-authority`, `clsx`, `tailwind-merge`.
