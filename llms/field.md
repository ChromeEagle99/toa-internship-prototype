---
component: field
slug: field
status: stable
source: components/ui/field.tsx
built-on: Base UI Field
---

# Field

A form field wrapper that bundles a label, control, helper text, and error message into one accessible unit. Built on Base UI's Field primitive — handles all `aria-describedby` wiring automatically.

## Sub-components

- `Field` — root container (renders a `<div>`)
- `FieldLabel` — label text
- `FieldControl` — slot for the actual control (Input, Textarea, etc.)
- `FieldDescription` — helper / hint text
- `FieldError` — validation error message (auto-shown when control is invalid)
- `FieldValidity` — exposes validity state via render prop

## When to use

- Any form control with a label, hint, or potential validation error.
- Prefer over manually building label + hint + error markup — Base UI Field wires accessibility for you.

## Examples

```tsx
<Field>
  <FieldLabel>Project key</FieldLabel>
  <Input placeholder="PRIZM" />
  <FieldDescription>Used as the prefix for issue IDs.</FieldDescription>
</Field>
```

With validation:

```tsx
<Field validate={(v) => (v ? null : "Required")}>
  <FieldLabel>Name</FieldLabel>
  <FieldControl render={<Input />} />
  <FieldError />
</Field>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | — | Field name, used for form submission. |
| `validate` | `(value: unknown) => string \| null` | — | Sync validator returning an error message or null. |
| `validationMode` | `"onBlur" \| "onChange"` | `"onBlur"` | When validation runs. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

## Sub-components

### `FieldLabel`

Label associated automatically via Field context.

### `FieldControl`

Slot for the actual control (Input, Textarea).

### `FieldDescription`

Helper / hint text.

### `FieldError`

Validation error message — auto-shown when invalid.

### `FieldValidity`

Render-prop access to validity state for custom error UIs.

_Built on Base UI Field. Wires `aria-describedby` automatically between label, control, hint, and error._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/field.tsx`. Required deps: `@base-ui-components/react`, `clsx`, `tailwind-merge`.
