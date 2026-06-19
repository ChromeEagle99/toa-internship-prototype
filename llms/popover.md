---
component: popover
slug: popover
status: stable
source: components/ui/popover.tsx
builtOn: Base UI Popover
---

# Popover

Floating contextual panel anchored to a trigger. Used for compact forms, filter panels, detail cards, or any non-modal secondary content.

## When to use

- Settings, filters, or quick-edit forms attached to a button.
- Rich content that would be too verbose for a Tooltip.

## When NOT to use

- Simple text labels — use `Tooltip`.
- Destructive confirmations — use `Dialog`.

## Parts

| export | purpose |
|--------|---------|
| `Popover` | Root (manages open state) |
| `PopoverTrigger` | Trigger element |
| `PopoverContent` | Floating panel with portal + positioner |
| `PopoverHeader` | Flex-col wrapper for title + description |
| `PopoverTitle` | Accessible title (rendered as `aria-labelledby`) |
| `PopoverDescription` | Accessible description |
| `PopoverClose` | Close button (pass as child or use `showCloseButton` prop) |

## Examples

```tsx
<Popover>
  <PopoverTrigger>
    <Button variant="outline">Filter</Button>
  </PopoverTrigger>
  <PopoverContent showCloseButton>
    <PopoverHeader>
      <PopoverTitle>Filter results</PopoverTitle>
    </PopoverHeader>
    {/* filter controls */}
  </PopoverContent>
</Popover>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Controlled open state. |
| `defaultOpen` | `boolean` | — | Uncontrolled initial open state. |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the open state changes. |

## Sub-components

### `PopoverTrigger`

Element that opens the popover. Supports `render` for asChild.

### `PopoverContent`

The floating popup. Portals to body.

| Prop | Type | Default | Description |
|---|---|---|---|
| `sideOffset` | `number` | `8` | Pixel gap between trigger and popover. |
| `variant` | `"solid" \| "glass"` | `"solid"` | Surface treatment. `glass` (C3 only) for floating over canvas content. |
| `showCloseButton` | `boolean` | `false` | Render an X close button. |

### `PopoverHeader`

Top section with title + description.

### `PopoverTitle`

Wired to `aria-labelledby`.

### `PopoverDescription`

Wired to `aria-describedby`.

_Built on Base UI Popover._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/popover.tsx`. Peer deps: `@base-ui-components/react`, `lucide-react`, `clsx`, `tailwind-merge`.
