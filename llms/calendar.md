---
component: calendar
slug: calendar
status: stable
source: components/ui/calendar.tsx
---

# Calendar

Single-month date picker grid. Stateless by default — pass `selected` and `onSelect` for controlled mode. No external date library required.

## Props

| prop | type | description |
|------|------|-------------|
| `selected` | `Date` | Controlled selected date. Pair with `onSelect`. |
| `defaultSelected` | `Date` | Initial selection in uncontrolled mode. |
| `onSelect` | `(date: Date) => void` | Called when a day is clicked |
| `disabled` | `(date: Date) => boolean` | Return true to disable a date |
| `defaultMonth` | `Date` | Initial visible month |

## Examples

```tsx
// Uncontrolled (Calendar tracks its own state)
<Calendar />
<Calendar defaultSelected={new Date()} />

// Controlled
const [date, setDate] = useState<Date>();
<Calendar selected={date} onSelect={setDate} />

// Disable past dates
<Calendar
  selected={date}
  onSelect={setDate}
  disabled={(d) => d < new Date()}
/>
```

## Notes

- Today is shown with an accent-coloured border.
- The selected date gets `bg-accent text-accent-fg`.
- Navigation arrows step one month at a time.

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `Date` | — | Controlled selected date. |
| `defaultValue` | `Date` | — | Uncontrolled initial date. |
| `onValueChange` | `(date: Date \| null) => void` | — | Called when selection changes. |
| `minDate` | `Date` | — | Earliest selectable date. |
| `maxDate` | `Date` | — | Latest selectable date. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Pure React (no external date library). Month navigation only._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/calendar.tsx`. Requires `lucide-react`, `clsx`, `tailwind-merge`, `button.tsx` (for arrow buttons).
