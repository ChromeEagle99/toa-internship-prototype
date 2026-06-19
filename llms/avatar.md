---
component: avatar
slug: avatar
status: stable
source: components/ui/avatar.tsx
built-on: Base UI Avatar
---

# Avatar

A circular image representing a user or entity, with a text fallback when the image fails to load.

## Sub-components

- `Avatar` — root container (sized via `size` prop)
- `AvatarImage` — the image source
- `AvatarFallback` — text shown if the image is unavailable

## Props

- `size` — `sm`, `md` (default), `lg`, `xl`

## Examples

```tsx
<Avatar>
  <AvatarImage src="/users/jane.png" alt="" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | Avatar size: 24px / 32px / 40px / 56px. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

## Sub-components

### `AvatarImage`

The image source.

| Prop | Type | Default | Description |
|---|---|---|---|
| `src` | `string` | — | Image URL. |
| `alt` | `string` | — | Alternative text. |

### `AvatarFallback`

Text shown if the image fails or is loading. Usually initials.

_Built on Base UI Avatar. Fallback renders immediately while the image loads._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/avatar.tsx`. Required deps: `@base-ui-components/react`, `class-variance-authority`, `clsx`, `tailwind-merge`.
