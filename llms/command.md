---
component: command
slug: command
status: stable
source: components/ui/command.tsx
---

# Command

Command palette with a search input and keyboard-navigable item list. Use `CommandDialog` to wrap it in a modal triggered by ⌘K.

## Parts

| export | purpose |
|--------|---------|
| `Command` | Root container (search state + layout) |
| `CommandDialog` | Modal wrapper (Base UI Dialog) |
| `CommandInput` | Search input with magnifier icon |
| `CommandList` | Scrollable item list |
| `CommandEmpty` | Shown when no items match |
| `CommandGroup` | Labelled section of items |
| `CommandItem` | Clickable item (`onSelect` callback) |
| `CommandSeparator` | Horizontal divider between groups |
| `CommandShortcut` | Right-aligned keyboard hint |

## Examples

```tsx
// Inline command panel
<Command>
  <CommandInput placeholder="Search…" />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Navigation">
      <CommandItem onSelect={() => router.push("/dashboard")}>
        Dashboard <CommandShortcut>⌘D</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>

// Modal palette (⌘K)
const [open, setOpen] = useState(false);
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === "k" && e.metaKey) { e.preventDefault(); setOpen((o) => !o); }
  };
  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}, []);

<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Search components…" />
  <CommandList>…</CommandList>
</CommandDialog>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

## Sub-components

### `CommandDialog`

Pre-built dialog wrapper for ⌘K palettes.

### `CommandInput`

Search input at the top.

### `CommandList`

Scrollable results region.

### `CommandEmpty`

Shown when no results match.

### `CommandGroup`

Visual grouping of items with a heading.

### `CommandItem`

Individual command. Selects via Enter or click.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Used for filtering; defaults to children text. |
| `keywords` | `string[]` | — | Additional search terms. |
| `onSelect` | `() => void` | — | Called when the item is activated. |

_Custom command-palette primitive (no external cmdk dependency)._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/command.tsx`. Peer deps: `@base-ui-components/react`, `lucide-react`, `clsx`, `tailwind-merge`.
