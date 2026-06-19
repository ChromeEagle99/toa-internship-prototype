---
component: group
slug: group
status: stable
source: components/ui/group.tsx
---

# Group

A horizontal layout primitive. Equal-gap row with alignment and wrapping options. The horizontal counterpart to `Stack`.

## Props

- `gap` — spacing scale: `0`, `1`, `2` (default), `3`, `4`, `6`, `8`
- `align` — cross-axis: `start`, `center` (default), `end`, `stretch`, `baseline`
- `justify` — main-axis: `start` (default), `center`, `end`, `between`, `around`
- `wrap` — `true` | `false` (default)

## When to use

- Button rows ("Cancel | Save").
- Inline groups of related controls (a search input plus filter chips).
- Toolbars.

## When NOT to use

- Vertical layouts — use `Stack`.
- Complex multi-row alignment — use Tailwind grid.

## Examples

```tsx
<Group gap="2" justify="end">
  <Button variant="outline">Cancel</Button>
  <Button>Save changes</Button>
</Group>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `gap` | `"0" \| "1" \| "2" \| "3" \| "4" \| "6" \| "8"` | `"2"` | Horizontal spacing between children. |
| `align` | `"start" \| "center" \| "end" \| "stretch" \| "baseline"` | `"center"` | Cross-axis alignment. |
| `justify` | `"start" \| "center" \| "end" \| "between" \| "around"` | `"start"` | Main-axis alignment. |
| `wrap` | `boolean` | `false` | Allow children to wrap to multiple rows. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Layout primitive: equal-gap horizontal row. Forwards `ref`._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/group.tsx`. Required deps: `class-variance-authority`, `clsx`, `tailwind-merge`.
