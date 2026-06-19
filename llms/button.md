---
component: button
slug: button
status: stable
source: components/ui/button.tsx
---

# Button

Trigger an action. The most foundational interactive primitive in PRIZM.

## When to use

- The user is performing an action: submit, save, delete, open, confirm, cancel.
- The user is navigating somewhere — use `variant="link"` or a `<Link>` styled as a button.

## When NOT to use

- For non-interactive labels (use `Badge`).
- For toggle states (use `Switch` or `Checkbox`).

## Variants

| variant   | When to use |
|-----------|-------------|
| `solid`   | Primary action on a page or in a dialog. One per context. |
| `outline` | Secondary action alongside a `solid` button. |
| `ghost`   | Tertiary action, in toolbars or alongside other buttons. |
| `subtle`  | Quieter than outline; for repeated actions in dense UIs (common in C3). |
| `danger`  | Destructive actions: delete, remove, terminate. |
| `link`    | Inline navigation that styled like a link rather than a button. |

## Sizes

| size  | Use case |
|-------|----------|
| `sm`  | Dense toolbars, tables, badges-with-action |
| `md`  | Default |
| `lg`  | Hero CTAs, landing pages |
| `icon`| Square 36×36 for icon-only buttons (always include `aria-label`) |

## Accessibility

- Always provide visible text or `aria-label` for icon-only buttons.
- `disabled` removes pointer events and dims the button.
- Focus ring is provided automatically.

## Examples

```tsx
// Primary action with secondary cancel
<div className="flex gap-2">
  <Button>Save changes</Button>
  <Button variant="outline">Cancel</Button>
</div>

// Destructive
<Button variant="danger">Delete account</Button>

// Icon-only
<Button variant="ghost" size="icon" aria-label="Settings">
  <Settings className="h-4 w-4" />
</Button>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"solid" \| "outline" \| "ghost" \| "subtle" \| "danger" \| "link"` | `"solid"` | Visual style. `solid` for primary CTAs, `outline` for secondary, `ghost` for tertiary, `subtle` for repeated dense UIs, `danger` for destructive, `link` for inline anchors. |
| `size` | `"sm" \| "md" \| "lg" \| "icon"` | `"md"` | `sm` for dense rows, `md` default, `lg` for hero CTAs, `icon` for square 36×36 icon-only buttons (always pair with `aria-label`). |
| `disabled` | `boolean` | `false` | Disables interaction and dims the button. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Spreads all `<button>` props (type, onClick, disabled, etc.). Forwards `ref` to the underlying button element. Defaults `type` to `"button"` to prevent accidental form submission._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

The canonical source lives at `components/ui/button.tsx`. Copy it into the consumer's project at the same relative path. Required peer dependencies: `class-variance-authority`, `clsx`, `tailwind-merge`.
