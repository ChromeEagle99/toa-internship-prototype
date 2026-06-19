---
component: link
slug: link
status: stable
source: components/ui/link.tsx
---

# Link

An inline hyperlink with PRIZM styling. Wraps `next/link` so client-side navigation works inside Next.js apps; falls through all standard `<a>` props.

## When to use

- Inline navigation inside body text.
- Anywhere you'd write `<a>` for in-app navigation.

## When NOT to use

- Button-like calls to action — use `Button variant="link"`.
- External URLs that should open in a new tab — pass `target="_blank" rel="noreferrer noopener"`.

## Examples

```tsx
<p>
  See the <Link href="/docs/getting-started">getting started guide</Link>.
</p>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `href` | `string` | — | Destination. Internal links use client-side navigation via Next.js Link. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Wraps `next/link`. Spreads all `<a>` attributes (target, rel, etc.) for external links._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/link.tsx`. Required deps: `next`, `clsx`, `tailwind-merge`.
