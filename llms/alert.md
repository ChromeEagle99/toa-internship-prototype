---
component: alert
slug: alert
status: stable
source: components/ui/alert.tsx
---

# Alert

An inline message block that calls attention to information without blocking the user. Five variants for different severities.

## Sub-components

- `Alert` — outer container (renders `role="alert"`)
- `AlertTitle` — short headline
- `AlertDescription` — body text

## Variants

| variant   | When to use |
|-----------|-------------|
| `default` | Neutral information |
| `info`    | Helpful context — maintenance windows, tips |
| `success` | Confirm a successful action |
| `warning` | Potential issue requiring user attention |
| `danger`  | Errors, failures, blocked states |

## When to use

- Inline contextual messages anchored to a page section.
- Status banners ("System maintenance at 02:00 UTC").

## When NOT to use

- Transient feedback ("Saved!") — use `Toast`.
- Critical blocking decisions — use `Dialog`.

## Accessibility

Uses `role="alert"` so screen readers announce it on mount. Combine with `AlertTitle` for a clear, scannable headline.

## Examples

```tsx
<Alert variant="danger">
  <AlertTitle>Connection lost</AlertTitle>
  <AlertDescription>Retrying every 5 seconds.</AlertDescription>
</Alert>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"default" \| "info" \| "success" \| "warning" \| "danger"` | `"default"` | Severity tone. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

## Sub-components

### `AlertTitle`

Short headline.

### `AlertDescription`

Body text.

_Root renders with `role="alert"` — screen readers announce on mount._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/alert.tsx`. Required deps: `class-variance-authority`, `clsx`, `tailwind-merge`.
