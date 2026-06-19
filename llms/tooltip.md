---
component: tooltip
slug: tooltip
status: stable
source: components/ui/tooltip.tsx
built-on: Base UI Tooltip
---

# Tooltip

A small floating label that appears on hover or focus. Use for compact UI elements (icon buttons) where the meaning isn't clear from the visual alone.

## Sub-components

- `TooltipProvider` — wraps a portion of the app to manage tooltip timing (place high in the tree)
- `Tooltip` — root for a single tooltip
- `TooltipTrigger` — the element that activates the tooltip on hover/focus
- `TooltipContent` — the floating label

## When to use

- Icon-only buttons (settings, close, more).
- Compact controls whose label isn't visible.

## When NOT to use

- Long or critical information — use inline text or `Popover`.
- Mobile-primary interfaces — tooltips don't trigger on touch.

## Accessibility

Base UI handles `aria-describedby`, focus visibility, and ESC to dismiss.

## TooltipContent props

- `side` — `"top"` (default) | `"right"` | `"bottom"` | `"left"`. Use `right` for left-anchored nav rails so the tooltip doesn't clip into the chrome above.
- `sideOffset` — px gap between the trigger and the tooltip. Default `6`.
- `align` — `"start" | "center" | "end"`. Alignment along the chosen side.

## TooltipProvider props

- `delay` — ms before opening on hover. Default ~600ms; lower (`100`–`200`) feels more responsive for dense operator UIs.

## Examples

```tsx
// Wrap a styled icon button — render prop pattern
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="ghost" size="icon"><Settings /></Button>} />
    <TooltipContent>Settings</TooltipContent>
  </Tooltip>
</TooltipProvider>

// Use TooltipTrigger directly as the button — simplest pattern for plain icons
<Tooltip>
  <TooltipTrigger className="rounded-md px-2 py-1 hover:bg-bg-muted" aria-label="App store">
    <LayoutGrid className="h-4 w-4" />
  </TooltipTrigger>
  <TooltipContent side="right" sideOffset={8}>App store</TooltipContent>
</Tooltip>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Controlled open state. |
| `defaultOpen` | `boolean` | — | Uncontrolled initial open state. |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the open state changes. |
| `delay` | `number` | — | Override the provider's delay for this instance. |

## Sub-components

### `TooltipProvider`

Wraps the app. Required.

| Prop | Type | Default | Description |
|---|---|---|---|
| `delay` | `number` | `~600` | ms before tooltips open on hover. Lower for dense ops UIs. |

### `TooltipTrigger`

Element to hover/focus. Supports `render` for asChild.

### `TooltipContent`

The floating label.

| Prop | Type | Default | Description |
|---|---|---|---|
| `side` | `"top" \| "right" \| "bottom" \| "left"` | — | Anchor side relative to the trigger. |
| `sideOffset` | `number` | `6` | Pixel gap. |
| `align` | `"start" \| "center" \| "end"` | — | Alignment along the chosen side. |
| `variant` | `"solid" \| "glass"` | `"solid"` | Surface treatment. `glass` for C3 templates over canvas. |

_Built on Base UI Tooltip. Provider must wrap the app or section._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/tooltip.tsx`. Required deps: `@base-ui-components/react`, `clsx`, `tailwind-merge`.
