/**
 * The API surface for every PRIZM component.
 *
 * Each entry documents the props the component exposes — what knobs are
 * available, what values they take, what's the default. The component page
 * (/components/[slug]) renders this as a Props table; a build script lifts
 * it into the per-component llms/<slug>.md so LLM consumers see the same
 * data offline.
 *
 * SCOPE — this is a discovery reference, not a customization guide. It
 * answers "what can I configure?". For the "you own the source, modify
 * freely" mental model, see PRIZM.md.
 *
 * MAINTENANCE — when a component's props change, update its entry here in
 * the same change. The three AI-facing docs (AI_HANDOFF.md, PRIZM.md,
 * llms.txt) are the AI alignment surface; this file is the consumer-facing
 * discovery surface and must stay in sync with the source the same way.
 */

export interface PropSpec {
  name: string;
  /** TypeScript type as a display string, e.g. '"solid" | "outline"' or 'boolean'. */
  type: string;
  /** Default value as a display string, or undefined if no default. */
  default?: string;
  description: string;
}

export interface SubComponentSpec {
  name: string;
  /** One-line description of what the sub-component is for. */
  description: string;
  /** Props specific to this sub-component (beyond the common HTML attrs). */
  props?: PropSpec[];
}

export interface ComponentApi {
  /** Props for the main exported component (or root, for compound components). */
  props: PropSpec[];
  /** Compound components list their sub-components here. */
  subComponents?: SubComponentSpec[];
  /** Optional note about HTML attributes / refs / accessibility — appears below the prop table. */
  notes?: string;
}

/** Standard props every PRIZM component accepts — used in the page to remind. */
export const COMMON_PROPS_NOTE =
  "All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable.";

// ============================================================
//  Helpers — common prop specs used across many components
// ============================================================

const classNameProp: PropSpec = {
  name: "className",
  type: "string",
  description: "Additional Tailwind classes, merged with the component's defaults via `cn()`.",
};

// ============================================================
//  Component API specs
// ============================================================

export const COMPONENT_API: Record<string, ComponentApi> = {
  // ----- Actions -----
  button: {
    props: [
      {
        name: "variant",
        type: `"solid" | "outline" | "ghost" | "subtle" | "danger" | "link"`,
        default: `"solid"`,
        description:
          "Visual style. `solid` for primary CTAs, `outline` for secondary, `ghost` for tertiary, `subtle` for repeated dense UIs, `danger` for destructive, `link` for inline anchors.",
      },
      {
        name: "size",
        type: `"sm" | "md" | "lg" | "icon"`,
        default: `"md"`,
        description:
          "`sm` for dense rows, `md` default, `lg` for hero CTAs, `icon` for square 36×36 icon-only buttons (always pair with `aria-label`).",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Disables interaction and dims the button.",
      },
      classNameProp,
    ],
    notes:
      'Spreads all `<button>` props (type, onClick, disabled, etc.). Forwards `ref` to the underlying button element. Defaults `type` to `"button"` to prevent accidental form submission.',
  },

  // ----- Forms -----
  input: {
    props: [
      {
        name: "type",
        type: `"text" | "email" | "password" | "number" | "search" | "tel" | "url" | "..."`,
        default: `"text"`,
        description: "Native input type. All standard HTML input types are supported.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Disables interaction and dims the input.",
      },
      classNameProp,
    ],
    notes: "Spreads all `<input>` props. Forwards `ref` to the input element.",
  },

  textarea: {
    props: [
      {
        name: "rows",
        type: "number",
        default: "—",
        description: "Suggested visible height in rows. Users can still resize.",
      },
      classNameProp,
    ],
    notes:
      "Spreads all `<textarea>` props. Minimum height is 80px. Forwards `ref` to the textarea.",
  },

  checkbox: {
    props: [
      {
        name: "checked",
        type: "boolean",
        description: "Controlled checked state.",
      },
      {
        name: "defaultChecked",
        type: "boolean",
        description: "Uncontrolled initial checked state.",
      },
      {
        name: "onCheckedChange",
        type: "(checked: boolean) => void",
        description: "Called when the checked state changes.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Disables interaction.",
      },
      classNameProp,
    ],
    notes:
      "Built on Base UI Checkbox. Always pair with a `Label` for accessibility. Base UI handles keyboard support (Space) and `aria-checked`.",
  },

  switch: {
    props: [
      { name: "checked", type: "boolean", description: "Controlled checked state." },
      { name: "defaultChecked", type: "boolean", description: "Uncontrolled initial state." },
      {
        name: "onCheckedChange",
        type: "(checked: boolean) => void",
        description: "Called when toggled.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Disables interaction.",
      },
      classNameProp,
    ],
    notes:
      'Built on Base UI Switch (`role="switch"`). Use for settings that take effect immediately. For form-submit values, prefer Checkbox.',
  },

  select: {
    props: [
      { name: "value", type: "string", description: "Controlled selected value." },
      { name: "defaultValue", type: "string", description: "Uncontrolled initial value." },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Called when the selection changes.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Disables the trigger.",
      },
    ],
    subComponents: [
      {
        name: "SelectTrigger",
        description: "The visible button that opens the popup.",
        props: [classNameProp],
      },
      {
        name: "SelectValue",
        description: "Renders the currently selected value inside the trigger.",
        props: [
          {
            name: "placeholder",
            type: "ReactNode",
            description: "Shown when no value is selected.",
          },
        ],
      },
      {
        name: "SelectContent",
        description: "The popup list of items. Portals to document body.",
        props: [classNameProp],
      },
      {
        name: "SelectItem",
        description: "An individual option.",
        props: [
          { name: "value", type: "string", description: "The value this item represents." },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Disables this item.",
          },
          classNameProp,
        ],
      },
    ],
    notes:
      "Built on Base UI Select. Keyboard: arrows navigate, Enter selects, type to search, Escape closes.",
  },

  combobox: {
    props: [
      { name: "value", type: "string", description: "Controlled selected value." },
      { name: "defaultValue", type: "string", description: "Uncontrolled initial value." },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Called when the selection changes.",
      },
      {
        name: "items",
        type: "readonly any[]",
        description:
          "Items to filter against the input query. Pair with a render-function child on `ComboboxList` to render each filtered item.",
      },
    ],
    subComponents: [
      {
        name: "ComboboxInput",
        description:
          "The search input that is both the trigger and the query field. Focus or type to open the popup; the input's value drives filtering against the `items` prop.",
        props: [classNameProp],
      },
      {
        name: "ComboboxContent",
        description: "The popup with the filterable list. Portals to document body.",
        props: [classNameProp],
      },
      {
        name: "ComboboxList",
        description:
          "The list container. Accepts either static children or a render function `(item) => ReactNode` when `items` is set on the root.",
        props: [classNameProp],
      },
      {
        name: "ComboboxItem",
        description: "An individual option.",
        props: [{ name: "value", type: "string", description: "The value this item represents." }],
      },
      {
        name: "ComboboxEmpty",
        description: "Rendered when no items match the query.",
        props: [classNameProp],
      },
      {
        name: "ComboboxTrigger",
        description:
          "Optional Select-style button trigger. Use instead of `ComboboxInput` when you want a closed dropdown that opens on click rather than a typeahead-first input.",
        props: [classNameProp],
      },
    ],
    notes:
      "Built on Base UI Combobox. The default pattern is typeahead-first: `ComboboxInput` is the visible control and filters items as the user types. Use `ComboboxTrigger` only for a Select-style closed state.",
  },

  slider: {
    props: [
      { name: "value", type: "number", description: "Controlled value." },
      { name: "defaultValue", type: "number", description: "Uncontrolled initial value." },
      {
        name: "onValueChange",
        type: "(value: number) => void",
        description: "Called as the value changes.",
      },
      { name: "min", type: "number", default: "0", description: "Minimum value." },
      { name: "max", type: "number", default: "100", description: "Maximum value." },
      { name: "step", type: "number", default: "1", description: "Granularity." },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Disables interaction.",
      },
      classNameProp,
    ],
    notes:
      "Built on Base UI Slider. Keyboard: arrows adjust by step, Home/End jump to min/max, PageUp/PageDown adjust by ~10%.",
  },

  label: {
    props: [
      {
        name: "htmlFor",
        type: "string",
        description: "The `id` of the form control this label is associated with.",
      },
      classNameProp,
    ],
    notes: "Standard HTML `<label>`. Always associate with a control via `htmlFor`.",
  },

  field: {
    props: [
      { name: "name", type: "string", description: "Field name, used for form submission." },
      {
        name: "validate",
        type: "(value: unknown) => string | null",
        description: "Sync validator returning an error message or null.",
      },
      {
        name: "validationMode",
        type: `"onBlur" | "onChange"`,
        default: `"onBlur"`,
        description: "When validation runs.",
      },
      classNameProp,
    ],
    subComponents: [
      { name: "FieldLabel", description: "Label associated automatically via Field context." },
      { name: "FieldControl", description: "Slot for the actual control (Input, Textarea)." },
      { name: "FieldDescription", description: "Helper / hint text." },
      { name: "FieldError", description: "Validation error message — auto-shown when invalid." },
      {
        name: "FieldValidity",
        description: "Render-prop access to validity state for custom error UIs.",
      },
    ],
    notes:
      "Built on Base UI Field. Wires `aria-describedby` automatically between label, control, hint, and error.",
  },

  "radio-group": {
    props: [
      { name: "value", type: "string", description: "Controlled selected value." },
      { name: "defaultValue", type: "string", description: "Uncontrolled initial value." },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Called when the selection changes.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Disables the whole group.",
      },
      classNameProp,
    ],
    subComponents: [
      {
        name: "RadioGroupItem",
        description: "An individual radio option.",
        props: [
          { name: "value", type: "string", description: "This item's value." },
          { name: "id", type: "string", description: "Used for `Label htmlFor` pairing." },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Disables just this option.",
          },
        ],
      },
    ],
    notes:
      "Built on Base UI Radio + RadioGroup. Keyboard: arrows navigate, Space selects. Always pair each item with a `Label`.",
  },

  // ----- Layout -----
  card: {
    props: [classNameProp],
    subComponents: [
      { name: "CardHeader", description: "Title + description region." },
      { name: "CardTitle", description: "Heading element (h3 by default)." },
      { name: "CardDescription", description: "Secondary text under the title." },
      { name: "CardContent", description: "Main body." },
      { name: "CardFooter", description: "Actions row at the bottom." },
    ],
    notes: "All sub-components forward `ref` and spread their HTML attributes.",
  },

  stack: {
    props: [
      {
        name: "gap",
        type: `"0" | "1" | "2" | "3" | "4" | "6" | "8" | "12"`,
        default: `"4"`,
        description: "Vertical spacing between children (Tailwind scale).",
      },
      {
        name: "align",
        type: `"start" | "center" | "end" | "stretch"`,
        default: `"stretch"`,
        description: "Cross-axis alignment.",
      },
      classNameProp,
    ],
    notes: "Layout primitive: equal-gap vertical column. Forwards `ref`.",
  },

  group: {
    props: [
      {
        name: "gap",
        type: `"0" | "1" | "2" | "3" | "4" | "6" | "8"`,
        default: `"2"`,
        description: "Horizontal spacing between children.",
      },
      {
        name: "align",
        type: `"start" | "center" | "end" | "stretch" | "baseline"`,
        default: `"center"`,
        description: "Cross-axis alignment.",
      },
      {
        name: "justify",
        type: `"start" | "center" | "end" | "between" | "around"`,
        default: `"start"`,
        description: "Main-axis alignment.",
      },
      {
        name: "wrap",
        type: "boolean",
        default: "false",
        description: "Allow children to wrap to multiple rows.",
      },
      classNameProp,
    ],
    notes: "Layout primitive: equal-gap horizontal row. Forwards `ref`.",
  },

  separator: {
    props: [
      {
        name: "orientation",
        type: `"horizontal" | "vertical"`,
        default: `"horizontal"`,
        description: "Direction of the line.",
      },
      classNameProp,
    ],
    notes: 'Built on Base UI Separator. Adds `role="separator"` and correct `aria-orientation`.',
  },

  frame: {
    props: [classNameProp],
    notes:
      "Constrained content frame with consistent horizontal padding and a centered max-width. Use as a page-level container.",
  },

  // ----- Data display -----
  badge: {
    props: [
      {
        name: "variant",
        type: `"solid" | "outline" | "subtle" | "success" | "warning" | "danger" | "info"`,
        default: `"subtle"`,
        description: "Semantic tone. Use `success`/`warning`/`danger`/`info` for status meaning.",
      },
      classNameProp,
    ],
    notes:
      "Renders a non-interactive `<span>`. If status meaning is critical, ensure surrounding context conveys it — color alone is not sufficient.",
  },

  avatar: {
    props: [
      {
        name: "size",
        type: `"sm" | "md" | "lg" | "xl"`,
        default: `"md"`,
        description: "Avatar size: 24px / 32px / 40px / 56px.",
      },
      classNameProp,
    ],
    subComponents: [
      {
        name: "AvatarImage",
        description: "The image source.",
        props: [
          { name: "src", type: "string", description: "Image URL." },
          { name: "alt", type: "string", description: "Alternative text." },
        ],
      },
      {
        name: "AvatarFallback",
        description: "Text shown if the image fails or is loading. Usually initials.",
      },
    ],
    notes: "Built on Base UI Avatar. Fallback renders immediately while the image loads.",
  },

  table: {
    props: [classNameProp],
    subComponents: [
      { name: "TableHeader", description: "`<thead>` wrapper." },
      { name: "TableBody", description: "`<tbody>` wrapper." },
      { name: "TableFooter", description: "`<tfoot>` wrapper." },
      { name: "TableRow", description: "Row with hover styling." },
      { name: "TableHead", description: "Header cell." },
      { name: "TableCell", description: "Body cell." },
      { name: "TableCaption", description: "Accessible caption." },
    ],
    notes:
      "Plain HTML table primitives with PRIZM styling. No sorting / virtualization — bring your own.",
  },

  calendar: {
    props: [
      { name: "value", type: "Date", description: "Controlled selected date." },
      { name: "defaultValue", type: "Date", description: "Uncontrolled initial date." },
      {
        name: "onValueChange",
        type: "(date: Date | null) => void",
        description: "Called when selection changes.",
      },
      { name: "minDate", type: "Date", description: "Earliest selectable date." },
      { name: "maxDate", type: "Date", description: "Latest selectable date." },
      classNameProp,
    ],
    notes: "Pure React (no external date library). Month navigation only.",
  },

  kbd: {
    props: [classNameProp],
    notes: "Renders a `<kbd>` element styled as a keyboard key. Plain children.",
  },

  code: {
    props: [
      {
        name: "block",
        type: "boolean",
        default: "false",
        description: "Render as a block (multi-line) instead of inline.",
      },
      classNameProp,
    ],
    notes:
      "Structural styling only — no syntax highlighting. Pair with shiki or highlight.js if highlighted code is needed.",
  },

  // ----- Feedback -----
  alert: {
    props: [
      {
        name: "variant",
        type: `"default" | "info" | "success" | "warning" | "danger"`,
        default: `"default"`,
        description: "Severity tone.",
      },
      classNameProp,
    ],
    subComponents: [
      { name: "AlertTitle", description: "Short headline." },
      { name: "AlertDescription", description: "Body text." },
    ],
    notes: 'Root renders with `role="alert"` — screen readers announce on mount.',
  },

  spinner: {
    props: [
      {
        name: "size",
        type: `"sm" | "md" | "lg" | "xl"`,
        default: `"md"`,
        description: "Spinner size: 12px / 16px / 24px / 40px.",
      },
      {
        name: "label",
        type: "string",
        default: `"Loading"`,
        description: 'Accessible label exposed via `role="status"` + hidden `<title>`.',
      },
      classNameProp,
    ],
    notes: "Animated SVG spinner. Use for indeterminate loading.",
  },

  skeleton: {
    props: [classNameProp],
    notes:
      'Sized via Tailwind utilities on the className (e.g. `h-4 w-3/4`). Auto-applies `aria-hidden="true"`.',
  },

  progress: {
    props: [
      {
        name: "value",
        type: "number",
        description: "Current value (0–100).",
      },
      {
        name: "max",
        type: "number",
        default: "100",
        description: "Maximum value.",
      },
      classNameProp,
    ],
    notes: "Built on Base UI Progress. Determinate only — use Spinner for unknown durations.",
  },

  toast: {
    props: [],
    subComponents: [
      {
        name: "ToastProvider",
        description: "Wraps the app. Required for `toast.add()` calls to render.",
      },
      {
        name: "ToastViewport",
        description: "Where toasts appear. Rendered inside ToastProvider by default.",
      },
    ],
    notes:
      "Built on Base UI Toast. Trigger via the imperative `toast.add({ title, description, variant })` singleton from `components/ui/toast.tsx`. `<ToastProvider>` must be in `app/layout.tsx` for toasts to render.",
  },

  "empty-state": {
    props: [classNameProp],
    subComponents: [
      { name: "EmptyStateIcon", description: "Large icon at the top." },
      { name: "EmptyStateTitle", description: "Headline." },
      { name: "EmptyStateDescription", description: "Supporting text." },
      { name: "EmptyStateActions", description: "Row of CTAs below the text." },
    ],
    notes: "Placeholder for empty data regions. Compose with a primary CTA when actionable.",
  },

  // ----- Navigation -----
  tabs: {
    props: [
      { name: "value", type: "string", description: "Controlled active tab value." },
      {
        name: "defaultValue",
        type: "string",
        description: "Uncontrolled initial active tab.",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Called when the active tab changes.",
      },
      {
        name: "orientation",
        type: `"horizontal" | "vertical"`,
        default: `"horizontal"`,
        description: "Tab list orientation.",
      },
      classNameProp,
    ],
    subComponents: [
      { name: "TabsList", description: "Container for the trigger buttons." },
      {
        name: "TabsTrigger",
        description: "Individual tab button.",
        props: [{ name: "value", type: "string", description: "Matches a panel's value." }],
      },
      {
        name: "TabsContent",
        description: "Panel content shown when its value is active.",
        props: [{ name: "value", type: "string", description: "Matches a trigger's value." }],
      },
    ],
    notes:
      "Built on Base UI Tabs. Selected trigger uses **accent-colored text** + raised surface (`data-active`). Keyboard: arrows navigate, Tab moves to content.",
  },

  breadcrumb: {
    props: [classNameProp],
    subComponents: [
      { name: "BreadcrumbList", description: "`<ol>` for the items." },
      { name: "BreadcrumbItem", description: "Each step." },
      { name: "BreadcrumbLink", description: "Clickable previous step." },
      {
        name: "BreadcrumbPage",
        description: 'Current page — marked `aria-current="page"`, non-clickable.',
      },
      { name: "BreadcrumbSeparator", description: "Chevron divider between items." },
    ],
    notes: 'Root renders `<nav aria-label="Breadcrumb">`.',
  },

  pagination: {
    props: [
      { name: "page", type: "number", description: "Current page (1-indexed)." },
      { name: "totalPages", type: "number", description: "Total number of pages." },
      {
        name: "onPageChange",
        type: "(page: number) => void",
        description: "Called when the user changes pages.",
      },
      {
        name: "siblingCount",
        type: "number",
        default: "1",
        description: "Pages shown adjacent to the current.",
      },
      classNameProp,
    ],
  },

  "navigation-menu": {
    props: [classNameProp],
    subComponents: [
      { name: "NavigationMenu.List", description: "Top-level horizontal nav list." },
      { name: "NavigationMenu.Item", description: "Each top-level item." },
      { name: "NavigationMenu.Trigger", description: "Item that opens a sub-menu." },
      { name: "NavigationMenu.Content", description: "Sub-menu popup content." },
      { name: "NavigationMenu.Link", description: "Direct nav link (no sub-menu)." },
    ],
    notes:
      "Built on Base UI Navigation Menu. Exports are prefixed `NavigationMenu.*` (namespace pattern).",
  },

  command: {
    props: [classNameProp],
    subComponents: [
      { name: "CommandDialog", description: "Pre-built dialog wrapper for ⌘K palettes." },
      { name: "CommandInput", description: "Search input at the top." },
      { name: "CommandList", description: "Scrollable results region." },
      { name: "CommandEmpty", description: "Shown when no results match." },
      { name: "CommandGroup", description: "Visual grouping of items with a heading." },
      {
        name: "CommandItem",
        description: "Individual command. Selects via Enter or click.",
        props: [
          {
            name: "value",
            type: "string",
            description: "Used for filtering; defaults to children text.",
          },
          { name: "keywords", type: "string[]", description: "Additional search terms." },
          {
            name: "onSelect",
            type: "() => void",
            description: "Called when the item is activated.",
          },
        ],
      },
    ],
    notes: "Custom command-palette primitive (no external cmdk dependency).",
  },

  link: {
    props: [
      {
        name: "href",
        type: "string",
        description: "Destination. Internal links use client-side navigation via Next.js Link.",
      },
      classNameProp,
    ],
    notes:
      "Wraps `next/link`. Spreads all `<a>` attributes (target, rel, etc.) for external links.",
  },

  // ----- Overlay -----
  dialog: {
    props: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      { name: "defaultOpen", type: "boolean", description: "Uncontrolled initial open state." },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Called when the open state changes.",
      },
    ],
    subComponents: [
      {
        name: "DialogTrigger",
        description: "Element that opens the dialog. Supports `render` for asChild pattern.",
      },
      {
        name: "DialogContent",
        description: "Modal body, includes backdrop and focus trap.",
        props: [
          {
            name: "showCloseButton",
            type: "boolean",
            default: "true",
            description: "Render the X close button in the top-right.",
          },
        ],
      },
      { name: "DialogHeader", description: "Title + description region." },
      {
        name: "DialogTitle",
        description: "Required — Base UI uses it for `aria-labelledby`.",
      },
      { name: "DialogDescription", description: "Wired to `aria-describedby`." },
      { name: "DialogFooter", description: "Actions row at the bottom." },
      { name: "DialogClose", description: "Explicit close trigger." },
    ],
    notes:
      "Built on Base UI Dialog. Escape closes, backdrop closes, focus returns to trigger. Always include a DialogTitle.",
  },

  sheet: {
    props: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      {
        name: "defaultOpen",
        type: "boolean",
        description: "Uncontrolled initial open state.",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Called when the open state changes.",
      },
    ],
    subComponents: [
      {
        name: "SheetTrigger",
        description: "Element that opens the sheet. Supports `render` for asChild pattern.",
      },
      {
        name: "SheetContent",
        description: "The sliding panel. Includes backdrop.",
        props: [
          {
            name: "side",
            type: `"left" | "right" | "top" | "bottom"`,
            default: `"right"`,
            description: "Which edge the sheet slides from.",
          },
          {
            name: "variant",
            type: `"solid" | "glass"`,
            default: `"solid"`,
            description:
              "Surface treatment. `glass` enables liquid-glass refraction (C3 themes only).",
          },
          {
            name: "showCloseButton",
            type: "boolean",
            default: "true",
            description: "Render the X close button.",
          },
        ],
      },
      { name: "SheetHeader", description: "Title + description region." },
      { name: "SheetTitle", description: "Required for accessibility." },
      { name: "SheetDescription", description: "Description text." },
      { name: "SheetBody", description: "Scrollable middle region." },
      { name: "SheetFooter", description: "Actions row at the bottom." },
      { name: "SheetClose", description: "Explicit close trigger." },
    ],
    notes:
      "Built on Base UI Dialog. Supports all four edges. Replaces what was originally a separate Drawer component.",
  },

  popover: {
    props: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      { name: "defaultOpen", type: "boolean", description: "Uncontrolled initial open state." },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Called when the open state changes.",
      },
    ],
    subComponents: [
      {
        name: "PopoverTrigger",
        description: "Element that opens the popover. Supports `render` for asChild.",
      },
      {
        name: "PopoverContent",
        description: "The floating popup. Portals to body.",
        props: [
          {
            name: "sideOffset",
            type: "number",
            default: "8",
            description: "Pixel gap between trigger and popover.",
          },
          {
            name: "variant",
            type: `"solid" | "glass"`,
            default: `"solid"`,
            description: "Surface treatment. `glass` (C3 only) for floating over canvas content.",
          },
          {
            name: "showCloseButton",
            type: "boolean",
            default: "false",
            description: "Render an X close button.",
          },
        ],
      },
      { name: "PopoverHeader", description: "Top section with title + description." },
      { name: "PopoverTitle", description: "Wired to `aria-labelledby`." },
      { name: "PopoverDescription", description: "Wired to `aria-describedby`." },
    ],
    notes: "Built on Base UI Popover.",
  },

  tooltip: {
    props: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      {
        name: "defaultOpen",
        type: "boolean",
        description: "Uncontrolled initial open state.",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Called when the open state changes.",
      },
      {
        name: "delay",
        type: "number",
        description: "Override the provider's delay for this instance.",
      },
    ],
    subComponents: [
      {
        name: "TooltipProvider",
        description: "Wraps the app. Required.",
        props: [
          {
            name: "delay",
            type: "number",
            default: "~600",
            description: "ms before tooltips open on hover. Lower for dense ops UIs.",
          },
        ],
      },
      {
        name: "TooltipTrigger",
        description: "Element to hover/focus. Supports `render` for asChild.",
      },
      {
        name: "TooltipContent",
        description: "The floating label.",
        props: [
          {
            name: "side",
            type: `"top" | "right" | "bottom" | "left"`,
            description: "Anchor side relative to the trigger.",
          },
          {
            name: "sideOffset",
            type: "number",
            default: "6",
            description: "Pixel gap.",
          },
          {
            name: "align",
            type: `"start" | "center" | "end"`,
            description: "Alignment along the chosen side.",
          },
          {
            name: "variant",
            type: `"solid" | "glass"`,
            default: `"solid"`,
            description: "Surface treatment. `glass` for C3 templates over canvas.",
          },
        ],
      },
    ],
    notes: "Built on Base UI Tooltip. Provider must wrap the app or section.",
  },

  menu: {
    props: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Called when the open state changes.",
      },
    ],
    subComponents: [
      { name: "MenuTrigger", description: "Element that opens the menu." },
      {
        name: "MenuContent",
        description: "The menu popup.",
        props: [
          {
            name: "sideOffset",
            type: "number",
            default: "4",
            description: "Pixel gap from trigger.",
          },
          {
            name: "variant",
            type: `"solid" | "glass"`,
            default: `"solid"`,
            description: "Surface treatment.",
          },
        ],
      },
      { name: "MenuItem", description: "Individual menu item." },
      {
        name: "MenuCheckboxItem",
        description: "Toggleable menu item with a check indicator.",
      },
      { name: "MenuRadioGroup", description: "Wraps mutually-exclusive radio items." },
      { name: "MenuRadioItem", description: "An item inside a MenuRadioGroup." },
      { name: "MenuLabel", description: "Plain styled label." },
      { name: "MenuGroup", description: "Semantically-grouped items." },
      { name: "MenuGroupLabel", description: "Aria-associated label for a MenuGroup." },
      { name: "MenuSeparator", description: "Visual divider between items." },
      { name: "MenuShortcut", description: "Keyboard shortcut hint, right-aligned." },
      { name: "MenuSubmenu", description: "Wraps a nested submenu trigger + content." },
      { name: "MenuSubmenuTrigger", description: "Submenu trigger item." },
      { name: "MenuSubmenuContent", description: "Nested submenu popup." },
      { name: "MenuSubmenuIndicator", description: "Chevron showing a submenu exists." },
    ],
    notes: "Built on Base UI Menu.",
  },

  "context-menu": {
    props: [],
    subComponents: [
      {
        name: "ContextMenuTrigger",
        description: "Wraps the area where right-click should open the menu. Renders a `<div>`.",
      },
      {
        name: "ContextMenuContent",
        description: "The menu popup.",
        props: [
          {
            name: "variant",
            type: `"solid" | "glass"`,
            default: `"solid"`,
            description: "Surface treatment.",
          },
        ],
      },
      { name: "ContextMenuItem", description: "Individual menu item." },
      {
        name: "ContextMenuCheckboxItem",
        description: "Toggleable item with check indicator.",
      },
      { name: "ContextMenuRadioGroup", description: "Mutually-exclusive radio items." },
      { name: "ContextMenuRadioItem", description: "An item inside a radio group." },
      { name: "ContextMenuLabel", description: "Plain styled label." },
      { name: "ContextMenuGroup", description: "Semantically-grouped items." },
      { name: "ContextMenuGroupLabel", description: "Aria label for a group." },
      { name: "ContextMenuSeparator", description: "Visual divider." },
      { name: "ContextMenuShortcut", description: "Keyboard shortcut hint." },
    ],
    notes: "Built on Base UI Context Menu. Opens on right-click within the trigger area.",
  },

  "hover-card": {
    props: [
      {
        name: "openDelay",
        type: "number",
        default: "600",
        description: "ms before opening on hover.",
      },
      {
        name: "closeDelay",
        type: "number",
        default: "300",
        description: "ms before closing after hover ends.",
      },
    ],
    subComponents: [
      { name: "HoverCardTrigger", description: "Element to hover." },
      {
        name: "HoverCardContent",
        description: "The floating card.",
        props: [
          {
            name: "sideOffset",
            type: "number",
            default: "8",
            description: "Pixel gap.",
          },
          {
            name: "variant",
            type: `"solid" | "glass"`,
            default: `"solid"`,
            description: "Surface treatment.",
          },
        ],
      },
    ],
    notes: "Built on Base UI Preview Card. Rich hover preview — not for touch interfaces.",
  },

  // ----- Typography -----
  heading: {
    props: [
      {
        name: "level",
        type: "1 | 2 | 3 | 4 | 5 | 6",
        default: "2",
        description: "Renders as `<h1>` through `<h6>`. Affects size and weight.",
      },
      classNameProp,
    ],
    notes: "Use `level` to set both semantic level and visual size at once.",
  },

  text: {
    props: [
      {
        name: "size",
        type: `"xs" | "sm" | "base" | "lg"`,
        default: `"base"`,
        description: "Text size.",
      },
      {
        name: "tone",
        type: `"fg" | "muted" | "subtle" | "accent" | "danger"`,
        default: `"fg"`,
        description: "Color tone.",
      },
      {
        name: "as",
        type: `"p" | "span" | "div"`,
        default: `"p"`,
        description: "Underlying element.",
      },
      classNameProp,
    ],
    notes: 'Body text primitive. Use `as="span"` for inline.',
  },

  prose: {
    props: [classNameProp],
    notes:
      "Long-form content wrapper. Styles descendant `<h1>`–`<h6>`, `<p>`, `<ul>`, `<ol>`, `<a>`, `<code>`, `<pre>` etc. with PRIZM defaults.",
  },
};

/** Lookup helper. */
export function getComponentApi(slug: string): ComponentApi | undefined {
  return COMPONENT_API[slug];
}