---
component: tabs
slug: tabs
status: stable
source: components/ui/tabs.tsx
built-on: Base UI Tabs
---

# Tabs

Switch between related views without leaving the page.

## Sub-components

- `Tabs` — root with `defaultValue` (uncontrolled) or `value`/`onValueChange` (controlled)
- `TabsList` — container for the tab triggers
- `TabsTrigger` — clickable tab, has a `value` matching a panel
- `TabsContent` — panel content shown when its `value` is active

## When to use

- 2–7 related views in the same workspace (Settings tabs, dashboard tabs).

## When NOT to use

- Switching between unrelated areas of the app — use top-level navigation.
- Many tabs (>7) — consider a side nav.

## Accessibility

Base UI handles `role="tablist"`, arrow-key navigation, and focus management.

## Examples

```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">...</TabsContent>
  <TabsContent value="activity">...</TabsContent>
</Tabs>
```

<!-- prizm:api-start -->
## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Controlled active tab value. |
| `defaultValue` | `string` | — | Uncontrolled initial active tab. |
| `onValueChange` | `(value: string) => void` | — | Called when the active tab changes. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Tab list orientation. |
| `className` | `string` | — | Additional Tailwind classes, merged with the component's defaults via `cn()`. |

## Sub-components

### `TabsList`

Container for the trigger buttons.

### `TabsTrigger`

Individual tab button.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Matches a panel's value. |

### `TabsContent`

Panel content shown when its value is active.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Matches a trigger's value. |

_Built on Base UI Tabs. Selected trigger uses **accent-colored text** + raised surface (`data-active`). Keyboard: arrows navigate, Tab moves to content._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

`components/ui/tabs.tsx`. Required deps: `@base-ui-components/react`, `clsx`, `tailwind-merge`.
