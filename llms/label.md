---
component: label
slug: label
status: stable
source: components/ui/label.tsx
---

# Label

A styled `<label>` element. Used to associate text with form controls.

## When to use

- Pair with every form control: `Input`, `Textarea`, `Checkbox`, `Switch`, `Select`, etc.
- Use `htmlFor` to associate with a control's `id`.

## Accessibility

A control without a label is invisible to assistive tech. Even when text appears nearby, use `Label` with `htmlFor` to make the association explicit. For controls inside `Field`, prefer `FieldLabel`.

## Examples

```tsx
<div className="space-y-1.5">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `htmlFor` | `string` | — | The `id` of the form control this label is associated with. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Standard HTML `<label>`. Always associate with a control via `htmlFor`._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/label.tsx`. Required deps: `clsx`, `tailwind-merge`.
