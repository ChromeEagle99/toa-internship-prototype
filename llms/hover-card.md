---
component: hover-card
slug: hover-card
status: stable
source: components/ui/hover-card.tsx
builtOn: Base UI Preview Card
---

# Hover Card

A floating card that appears on hover, for rich previews of linked entities (users, resources, documents).

## When to use

- Previewing a user profile when hovering over a mention.
- Showing metadata for a linked document or resource.

## When NOT to use

- Short text labels — use `Tooltip`.
- Interactive content requiring click — use `Popover`.

## Parts

| export | purpose |
|--------|---------|
| `HoverCard` | Root |
| `HoverCardTrigger` | Hover trigger element |
| `HoverCardContent` | Floating preview panel |

## Examples

```tsx
<HoverCard>
  <HoverCardTrigger>
    <Link href="/users/alvin">@alvin</Link>
  </HoverCardTrigger>
  <HoverCardContent>
    <div className="flex gap-3">
      <Avatar><AvatarFallback>AL</AvatarFallback></Avatar>
      <div>
        <p className="text-sm font-semibold">Alvin Loh</p>
        <p className="text-xs text-fg-muted">Product designer</p>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `openDelay` | `number` | `600` | ms before opening on hover. |
| `closeDelay` | `number` | `300` | ms before closing after hover ends. |

## Sub-components

### `HoverCardTrigger`

Element to hover.

### `HoverCardContent`

The floating card.

| Prop | Type | Default | Description |
|---|---|---|---|
| `sideOffset` | `number` | `8` | Pixel gap. |
| `variant` | `"solid" \| "glass"` | `"solid"` | Surface treatment. |

_Built on Base UI Preview Card. Rich hover preview — not for touch interfaces._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/hover-card.tsx`. Peer deps: `@base-ui-components/react`, `clsx`, `tailwind-merge`.
