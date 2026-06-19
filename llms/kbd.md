---
component: kbd
slug: kbd
status: stable
source: components/ui/kbd.tsx
---

# Kbd

Keyboard shortcut display. Renders a `<kbd>` element with monospace styling and a subtle border.

## When to use

- Documenting keyboard shortcuts in help text, tooltips, or UI labels.
- Showing modifier keys (⌘, ⌃, ⇧) alongside letter keys.

## Examples

```tsx
// Single key
<Kbd>⌘</Kbd>

// Chord
<span className="flex items-center gap-1 text-sm text-fg-muted">
  Save <Kbd>⌘</Kbd><Kbd>S</Kbd>
</span>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Renders a `<kbd>` element styled as a keyboard key. Plain children._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/kbd.tsx`. Requires `clsx`, `tailwind-merge`.
