---
component: code
slug: code
status: stable
source: components/ui/code.tsx
---

# Code

Inline and block code display. `Code` renders a `<code>` element inline; `CodeBlock` renders a `<pre>` element for multi-line code.

## When to use

- `Code`: referencing function names, variables, or commands inline in prose.
- `CodeBlock`: displaying multi-line code snippets, config examples, terminal output.

## Examples

```tsx
// Inline
<p>Pass options via the <Code>--config</Code> flag.</p>

// Block
<CodeBlock>{`import { Button } from "@/components/ui/button";

export function Example() {
  return <Button>Click me</Button>;
}`}</CodeBlock>
```

## Notes

No syntax highlighting is included — the component applies only structural and colour styling. For syntax highlighting, wrap `CodeBlock` content with a library like `shiki` or `highlight.js` and render the HTML output.

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `block` | `boolean` | `false` | Render as a block (multi-line) instead of inline. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

_Structural styling only — no syntax highlighting. Pair with shiki or highlight.js if highlighted code is needed._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/code.tsx`. Requires `clsx`, `tailwind-merge`.
