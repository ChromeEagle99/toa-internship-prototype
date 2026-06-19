---
component: prose
slug: prose
status: stable
source: components/ui/prose.tsx
---

# Prose

Container for long-form HTML content (MDX, markdown-rendered HTML, rich text). Applies consistent typographic styling to child elements without requiring `@tailwindcss/typography`.

## When to use

- Docs pages, changelogs, help content, any MDX-rendered body.
- Wrapping HTML from a CMS or rich text editor.

## When NOT to use

- Short UI copy — use `Text` or `Heading`.

## Styled child elements

`h1`–`h4`, `p`, `ul`, `ol`, `li`, `strong`, `em`, `a`, `code`, `pre`, `blockquote`, `hr`, `table`, `th`, `td`

## Examples

```tsx
<Prose>
  <h2>Installation</h2>
  <p>Run <code>npm install</code> to get started.</p>
  <ul>
    <li>Step one</li>
    <li>Step two</li>
  </ul>
</Prose>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Long-form content wrapper. Styles descendant `<h1>`–`<h6>`, `<p>`, `<ul>`, `<ol>`, `<a>`, `<code>`, `<pre>` etc. with PRIZM defaults._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/prose.tsx`. Requires `clsx`, `tailwind-merge`. No external typography plugin needed.
