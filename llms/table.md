---
component: table
slug: table
status: stable
source: components/ui/table.tsx
---

# Table

Semantic HTML table with PRIZM token-based styling. Includes a horizontal scroll wrapper for responsive overflow.

## Parts

`Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`

## Examples

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Role</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map((u) => (
      <TableRow key={u.id}>
        <TableCell>{u.name}</TableCell>
        <TableCell>{u.role}</TableCell>
        <TableCell><Badge>{u.status}</Badge></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Notes

- `TableRow` has a hover state (`hover:bg-bg-muted/50`) and a selected state (`data-[state=selected]:bg-bg-muted`) — set `data-state="selected"` on the row.
- Horizontal overflow is handled by the automatic wrapper inside `Table`.

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

## Sub-components

### `TableHeader`

`<thead>` wrapper.

### `TableBody`

`<tbody>` wrapper.

### `TableFooter`

`<tfoot>` wrapper.

### `TableRow`

Row with hover styling.

### `TableHead`

Header cell.

### `TableCell`

Body cell.

### `TableCaption`

Accessible caption.

_Plain HTML table primitives with PRIZM styling. No sorting / virtualization — bring your own._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/table.tsx`. Requires `clsx`, `tailwind-merge`.
