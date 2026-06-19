---
component: dialog
slug: dialog
status: stable
source: components/ui/dialog.tsx
built-on: Base UI Dialog
---

# Dialog

A modal dialog for focused tasks that interrupt the user's current flow. Built on Base UI's accessible Dialog primitive.

## Sub-components

- `Dialog` — root provider
- `DialogTrigger` — element that opens the dialog
- `DialogContent` — the dialog body (includes backdrop and focus trapping)
- `DialogHeader` — title + description region
- `DialogTitle`
- `DialogDescription`
- `DialogFooter` — actions row at the bottom
- `DialogClose` — explicit close trigger (the X button is included by default)

## When to use

- Confirming destructive actions
- Short focused forms (renames, settings, picker)
- Critical decisions that warrant breaking the user's flow

## When NOT to use

- For long forms — use a full page or `Sheet`
- For non-critical information — use `Toast` or inline `Alert`
- For navigation — never block navigation with a modal

## Accessibility

- Focus is trapped inside the dialog while open.
- Escape closes the dialog.
- Clicking the backdrop closes by default.
- Focus returns to the triggering element on close.
- Always include a `DialogTitle` — Base UI uses it for `aria-labelledby`.

## Examples

```tsx
<Dialog>
  <DialogTrigger render={<Button variant="outline">Open</Button>} />
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete project</DialogTitle>
      <DialogDescription>
        This action cannot be undone. All data will be permanently removed.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose render={<Button variant="outline">Cancel</Button>} />
      <Button variant="danger">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Controlled open state. |
| `defaultOpen` | `boolean` | — | Uncontrolled initial open state. |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the open state changes. |

## Sub-components

### `DialogTrigger`

Element that opens the dialog. Supports `render` for asChild pattern.

### `DialogContent`

Modal body, includes backdrop and focus trap.

| Prop | Type | Default | Description |
|---|---|---|---|
| `showCloseButton` | `boolean` | `true` | Render the X close button in the top-right. |

### `DialogHeader`

Title + description region.

### `DialogTitle`

Required — Base UI uses it for `aria-labelledby`.

### `DialogDescription`

Wired to `aria-describedby`.

### `DialogFooter`

Actions row at the bottom.

### `DialogClose`

Explicit close trigger.

_Built on Base UI Dialog. Escape closes, backdrop closes, focus returns to trigger. Always include a DialogTitle._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/dialog.tsx`. Required deps: `@base-ui-components/react`, `lucide-react`, `clsx`, `tailwind-merge`.
