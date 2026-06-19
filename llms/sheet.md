---
component: sheet
slug: sheet
status: stable
source: components/ui/sheet.tsx
builtOn: Base UI Dialog
---

# Sheet

Edge-anchored sliding panel. One component covers every panel-style overlay: left/right navigation drawers, bottom action sheets, top notification trays, side detail panels.

## When to use

- Mobile navigation (slide from left or bottom).
- Forms, settings, or filter panels triggered from a button.
- Detail / inspector views beside the main content.
- Anywhere you'd reach for a "drawer" or "panel" — Sheet handles all four sides.

## When NOT to use

- Focused, centred decisions — use `Dialog`.
- Transient notifications — use `Toast`.
- Tooltip-sized hints — use `Popover` or `Tooltip`.

## Sides

`SheetContent` accepts `side`: `"left" | "right" | "top" | "bottom"` (default `"right"`). Each side gets its own slide-in animation.

## Layout slots

The popup is an unpadded `flex flex-col`. Compose with these optional slots, which give you a bordered, scrollable layout for free:

| slot | what it does |
|---|---|
| `SheetHeader` | Padded section with bottom border. Holds `SheetTitle` + `SheetDescription`. |
| `SheetBody` | Padded `flex-1 overflow-y-auto`. The scrollable region. |
| `SheetFooter` | Padded section with top border, right-aligned actions on `sm+`. |

You can omit any of these and place content directly inside `SheetContent`. For a fully unstructured panel, wrap your content in your own padded `<div>`.

## Examples

```tsx
// Right-side form panel
<Sheet>
  <SheetTrigger render={<Button>Edit profile</Button>} />
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Edit profile</SheetTitle>
      <SheetDescription>Update your details and save.</SheetDescription>
    </SheetHeader>
    <SheetBody>{/* form fields */}</SheetBody>
    <SheetFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>

// Left-side navigation drawer
<Sheet>
  <SheetTrigger render={<Button variant="ghost" size="icon"><Menu /></Button>} />
  <SheetContent side="left">
    <SheetHeader>
      <SheetTitle>Navigation</SheetTitle>
    </SheetHeader>
    <SheetBody>
      <nav>{/* links */}</nav>
    </SheetBody>
  </SheetContent>
</Sheet>

// Bottom action sheet (mobile)
<Sheet>
  <SheetTrigger render={<Button>Share</Button>} />
  <SheetContent side="bottom">
    <SheetHeader>
      <SheetTitle>Share post</SheetTitle>
    </SheetHeader>
    <SheetBody>{/* share targets */}</SheetBody>
  </SheetContent>
</Sheet>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Controlled open state. |
| `defaultOpen` | `boolean` | — | Uncontrolled initial open state. |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the open state changes. |

## Sub-components

### `SheetTrigger`

Element that opens the sheet. Supports `render` for asChild pattern.

### `SheetContent`

The sliding panel. Includes backdrop.

| Prop | Type | Default | Description |
|---|---|---|---|
| `side` | `"left" \| "right" \| "top" \| "bottom"` | `"right"` | Which edge the sheet slides from. |
| `variant` | `"solid" \| "glass"` | `"solid"` | Surface treatment. `glass` enables liquid-glass refraction (C3 themes only). |
| `showCloseButton` | `boolean` | `true` | Render the X close button. |

### `SheetHeader`

Title + description region.

### `SheetTitle`

Required for accessibility.

### `SheetDescription`

Description text.

### `SheetBody`

Scrollable middle region.

### `SheetFooter`

Actions row at the bottom.

### `SheetClose`

Explicit close trigger.

_Built on Base UI Dialog. Supports all four edges. Replaces what was originally a separate Drawer component._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/sheet.tsx`. Peer deps: `@base-ui-components/react`, `lucide-react`, `clsx`, `tailwind-merge`.
