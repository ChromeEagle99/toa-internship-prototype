---
component: input
slug: input
status: stable
source: components/ui/input.tsx
---

# Input

Single-line text input. Wrap with a `Label` and `Field` for accessible form structure.

## When to use

- Any single-line text entry: name, email, search, URL.
- Compose with `Label` for accessibility and `Field` for hint/error text (both planned).

## When NOT to use

- Multi-line text — use `Textarea`.
- Numeric ranges — use `Slider`.
- Searchable selection — use `Combobox`.

## Props

Accepts all standard `<input>` props plus a `className` for additional styling.

## Accessibility

- Always pair with a `<label htmlFor="...">` or wrap in a `<Field>` (planned).
- Validation errors should be announced via `aria-describedby` pointing to the error message.
- `disabled` and `aria-invalid` styles are built in.

## Examples

```tsx
<Input placeholder="Email" type="email" />
<Input placeholder="Disabled" disabled />
<Input placeholder="Invalid" aria-invalid="true" />
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `"text" \| "email" \| "password" \| "number" \| "search" \| "tel" \| "url" \| "..."` | `"text"` | Native input type. All standard HTML input types are supported. |
| `disabled` | `boolean` | `false` | Disables interaction and dims the input. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Spreads all `<input>` props. Forwards `ref` to the input element._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/input.tsx`. Required deps: `clsx`, `tailwind-merge`.
