# Building with PRIZM 4.0

PRIZM is a Tailwind-based React design system (built on Base UI). Components are real
compiled React exports on `window.Prizm` — e.g. `window.Prizm.Button`, `window.Prizm.Card`.
Import them as you would any component; the bundle is loaded from the root `_ds_bundle.js`.

## Setup — no provider needed

There is **no React provider to wrap your app in**. PRIZM's theme tokens resolve at `:root`
as the **enterprise / light** theme by default, so components are fully styled out of the box.
To switch theme, set data attributes on a wrapping element (they cascade):
`data-zone="enterprise"` or `"c3"`, and `data-mode="light"` or `"dark"`. Leave them unset for
the default enterprise/light. Fonts: **Inter** (sans, the default) and **JetBrains Mono**
(`font-mono`) ship with the bundle.

## The styling idiom — semantic Tailwind utilities only

Style layout/your own glue with PRIZM's **semantic** Tailwind classes, which map to theme
tokens. **Never use raw colour utilities** (`bg-blue-500`, `text-slate-700`) — they don't
track the active theme and break dark mode / C3. Use these families:

- **Surfaces:** `bg-bg`, `bg-bg-subtle`, `bg-bg-muted`, `bg-surface`, `bg-surface-elevated`
- **Foreground/text:** `text-fg`, `text-fg-muted`, `text-fg-subtle`
- **Accent:** `bg-accent`, `bg-accent-hover`, `text-accent`, `text-accent-fg`
- **Status:** `text-danger` / `bg-danger` / `text-danger-fg`, `text-success`, `text-warning`,
  `text-info`
- **Borders:** `border-border`, `border-border-strong`, `border-accent`
- **Radii / shadow:** `rounded-sm|md|lg`, `shadow-sm|md|lg` (token-backed)

Prefer a component's own variant props over `className` overrides (e.g. `<Button variant="danger">`,
`<Badge variant="success">`, `<Text variant="muted">`). Icons: `lucide-react` at stroke-width 1.5.
Write user-facing copy in **British English** (colour, organise, behaviour).

## Compound components: flat named exports

PRIZM does NOT use dot-notation. Compose with the individual named exports — e.g. Card is built
from `Card` + `CardHeader` + `CardTitle` + `CardDescription` + `CardContent` + `CardFooter`;
Dialog from `Dialog` + `DialogTrigger` + `DialogContent` + `DialogHeader` + `DialogTitle` + …;
Table from `Table` + `TableHeader` + `TableRow` + `TableHead` + `TableCell`. Each component's
`<Name>.prompt.md` documents its parts and usage; its `<Name>.d.ts` is the prop contract.

## Where the truth lives

- **Tokens & idiom:** read the bound `styles.css` and its `@import` closure (it pulls in the
  compiled token + utility CSS and the component styles).
- **Per component:** `<Name>.prompt.md` (real PRIZM docs — when to use, variants, examples) and
  `<Name>.d.ts` (props).

## One idiomatic example

```tsx
function ReportCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly report</CardTitle>
        <CardDescription>Usage across all workspaces for June 2026.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-fg-muted">Active users rose 12% week on week.</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="solid" size="sm">View report</Button>
        <Button variant="outline" size="sm">Export</Button>
      </CardFooter>
    </Card>
  );
}
```
