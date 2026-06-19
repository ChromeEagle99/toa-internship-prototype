---
component: navigation-menu
slug: navigation-menu
status: stable
source: components/ui/navigation-menu.tsx
builtOn: Base UI Navigation Menu
---

# Navigation Menu

Top-level site navigation with hover-triggered dropdown panels. Used in site headers.

## When to use

- Primary site navigation with multi-level flyout menus.
- App headers where groups of links need to be categorised.

## When NOT to use

- Action menus (right-click or button-triggered) — use `Menu` or `ContextMenu`.
- In-page section navigation — use `Tabs`.

## Parts

| export | purpose |
|--------|---------|
| `NavigationMenu` | Root |
| `NavigationMenuList` | Horizontal list of top-level items |
| `NavigationMenuItem` | Each nav item |
| `NavigationMenuTrigger` | Button that opens a dropdown panel |
| `NavigationMenuContent` | Floating dropdown panel |
| `NavigationMenuLink` | Plain nav link (no dropdown) |
| `NavigationMenuIndicator` | Active item indicator dot |

## Examples

```tsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Products</NavigationMenuTrigger>
      <NavigationMenuContent className="p-4 w-64">
        <ul className="space-y-2">
          <li><a href="/c3" className="text-sm text-fg hover:underline">C3 Suite</a></li>
          <li><a href="/enterprise" className="text-sm text-fg hover:underline">Enterprise Portal</a></li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="/docs" className="text-sm text-fg px-3 py-2">
        Docs
      </NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

## Sub-components

### `NavigationMenu.List`

Top-level horizontal nav list.

### `NavigationMenu.Item`

Each top-level item.

### `NavigationMenu.Trigger`

Item that opens a sub-menu.

### `NavigationMenu.Content`

Sub-menu popup content.

### `NavigationMenu.Link`

Direct nav link (no sub-menu).

_Built on Base UI Navigation Menu. Exports are prefixed `NavigationMenu.*` (namespace pattern)._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/navigation-menu.tsx`. Peer deps: `@base-ui-components/react`, `lucide-react`, `clsx`, `tailwind-merge`.
