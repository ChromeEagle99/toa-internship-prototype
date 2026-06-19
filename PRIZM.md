# PRIZM 4.0 — Brief for AI assistants

PRIZM 4.0 is a DSTA design system. If you are an AI assistant helping a developer build with PRIZM 4.0, read this file first. It contains everything you need to bootstrap work using PRIZM components and templates.

## What PRIZM 4.0 is

PRIZM 4.0 is **a DSTA design system**. It serves two distinct product families:

- **C3** — command and control systems. Dense data display, tactical UI, high-contrast surfaces. Used in operations centers, mission control, dispatch, network monitoring.
- **Enterprise** — websites and applications. Calm, spacious, professional. Used in dashboards, forms, marketing pages, customer portals.

Both product families share the same underlying **component primitives** but apply different **design tokens** (colours, density, contrast). PRIZM supports light and dark mode for each, giving four total theme variants:

- `c3-light`
- `c3-dark`
- `enterprise-light`
- `enterprise-dark`

## How PRIZM is distributed

PRIZM uses a **copy-paste model**. Components live in this repo and are designed to be copied into consuming projects, not installed as an npm package. This gives consuming teams full ownership of their component code.

When a developer asks you to add a PRIZM component to their project:

1. Identify the component slug from the registry (`lib/components-registry.ts`). Confirm `status: "stable"` — entries marked `planned` are reserved slugs for roadmap visibility and have no source file yet. Do not attempt to add a planned component, and do not fabricate a substitute; tell the developer it's on the roadmap.
2. Fetch the source file from `https://raw.githubusercontent.com/prizm-design/prizm/main/components/ui/<slug>.tsx` (or read locally if you have a checkout of the PRIZM repo alongside the consumer project).
3. Copy the file into the developer's project at the same relative path
4. Ensure the developer's project has the required peer dependencies (see "Dependencies" below)
5. Ensure the developer's project has the PRIZM token CSS imported (see "Theming" below)

## Where to fetch PRIZM files

PRIZM lives at **https://github.com/prizm-design/prizm**. The docs site is **https://prizm.design**. When you are applying PRIZM inside a consumer project and do **not** have a local PRIZM checkout, fetch source files directly from GitHub raw:

```
https://raw.githubusercontent.com/prizm-design/prizm/main/<repo-relative-path>
```

Worked examples:

| File | Raw URL |
|---|---|
| `components/ui/button.tsx` | `https://raw.githubusercontent.com/prizm-design/prizm/main/components/ui/button.tsx` |
| `app/c3/templates/app-shell/shell.tsx` | `https://raw.githubusercontent.com/prizm-design/prizm/main/app/c3/templates/app-shell/shell.tsx` |
| `lib/components-registry.ts` | `https://raw.githubusercontent.com/prizm-design/prizm/main/lib/components-registry.ts` |
| `styles/tokens/c3-dark.css` | `https://raw.githubusercontent.com/prizm-design/prizm/main/styles/tokens/c3-dark.css` |
| `llms.txt` | `https://raw.githubusercontent.com/prizm-design/prizm/main/llms.txt` |

If a fetch returns 404, the file genuinely doesn't exist — **don't fabricate a substitute** and don't synthesise your own version of a template that PRIZM already ships. Tell the developer the path is missing and stop, so a PRIZM maintainer can investigate.

For air-gapped environments where no outbound HTTP is allowed, the developer should clone or vendor the PRIZM repo into their workspace and you read from the local path instead.

## Repo structure

```
PRIZM 4.0/
├── app/                       # Next.js docs site
│   ├── components/            # Component browser + per-component pages
│   ├── c3/                    # C3 zone (overview, templates)
│   ├── enterprise/            # Enterprise zone (overview, templates)
│   └── docs/                  # Introduction, Getting started, Using with AI, Installation, Theming, Air-gap, Changelog, plus foundation pages
├── components/
│   ├── ui/                    # ←— THE COMPONENT LIBRARY (copy from here)
│   ├── rc3/                   # RC3 capability-pack organisms
│   └── site/                  # Docs site components (not for copying)
├── lib/
│   ├── utils.ts               # cn() helper used by all components
│   ├── theme-context.tsx      # Zone + mode state provider
│   └── components-registry.ts # Canonical list of all components
├── styles/
│   ├── fonts.css              # Self-hosted font declarations
│   └── tokens/
│       ├── baseline.css       # Raw color scales and structural primitives
│       ├── c3-light.css       # Semantic tokens for c3-light theme
│       ├── c3-dark.css
│       ├── enterprise-light.css
│       ├── enterprise-dark.css
│       ├── rc3-light.css      # RC3 pack accent override (activated by data-pack="rc3")
│       └── rc3-dark.css
├── llms.txt                   # Component index (this is the entry point for LLMs)
├── llms/                      # Per-component context files for LLMs
│   └── rc3/                   # Per-organism context files for RC3
└── PRIZM.md                   # ← you are here
```

## Component conventions

Every PRIZM component follows these conventions. When you write a new component or modify an existing one, preserve them.

1. **File location**: `components/ui/<kebab-slug>.tsx` — one file per component
2. **Exports**: named exports only, no defaults
3. **Styling**: Tailwind utility classes referencing semantic tokens (`bg-bg`, `text-fg`, `border-border`, `bg-accent`, etc.) — never raw color values
4. **Class merging**: use `cn()` from `@/lib/utils` to combine classes — never concatenate manually
5. **Variants**: use `class-variance-authority` (`cva`) for components with multiple visual variants
6. **Accessibility**: components either wrap Base UI primitives (which handle a11y) or include the necessary ARIA attributes themselves
7. **Refs**: every interactive component uses `forwardRef` so consumers can attach refs
8. **Client components**: marked with `"use client"` only when they need it (state, effects, browser APIs). Pure presentational components are server components by default.
9. **Icons**: use `lucide-react`. PRIZM applies a site-wide `stroke-width: 1.5` rule (in `app/globals.css` under `@layer base`) — lighter than lucide's default 2, gives icons a more crisp / precision feel. Custom SVGs with explicit per-path `stroke-width` attributes are unaffected. To deviate from 1.5 on a specific lucide icon, use Tailwind's arbitrary property (`className="[stroke-width:1]"` for thinner, `[stroke-width:2.5]` for heavier) or inline style — the lucide `strokeWidth={N}` prop sets the attribute, which CSS overrides.
10. **API surface is documented**: every component has an entry in `lib/components-api.ts` listing its props (name, type, default, description) and sub-components. When you change a component's props, update this file in the same change. The data is rendered on the component page and lifted into the per-component `llms/<slug>.md` by `pnpm generate:llms-api` so AI consumers see it both online and offline.

## Theming

Themes are activated by setting two data attributes on `<html>`:

```html
<html data-zone="c3" data-mode="dark">
```

The combinations:
- `data-zone="enterprise" data-mode="light"` — default
- `data-zone="enterprise" data-mode="dark"`
- `data-zone="c3" data-mode="light"`
- `data-zone="c3" data-mode="dark"`

When building features for a specific product, set the zone via `useTheme()` from `@/lib/theme-context`, or set the data attribute statically in the host application's root layout.

## Liquid glass — C3-only surface treatment

PRIZM 4.0 ships **liquid glass** as a C3-only surface treatment for floating panels over canvas content. It's available in both C3 light and C3 dark modes. Enterprise does NOT use glass — the design language conflict is intentional.

Two tiers, two usage paths:

| Tier class | Use case |
|---|---|
| `surface-glass-chrome` | Application frame: top bar, status ticker, icon rail. Lighter blur (8px), ~6% tint opacity. |
| `surface-glass-panel` | Floating overlays: sheets, popovers, side panels, notification centres. Heavier blur (12px), ~10% tint opacity, soft shadow. |

**Via component variant prop** (recommended ergonomic path):

```tsx
<Sheet>
  <SheetTrigger render={<Button>Open</Button>} />
  <SheetContent side="right" variant="glass">…</SheetContent>
</Sheet>

<Popover>
  <PopoverTrigger render={<Button>Open</Button>} />
  <PopoverContent variant="glass">…</PopoverContent>
</Popover>
```

The six components that support `variant="glass"`: `Sheet`, `Popover`, `Tooltip`, `HoverCard`, `Menu`, `ContextMenu`. Default is `"solid"`.

**Via utility class** (custom chrome):

```tsx
<header className="surface-glass-chrome border-b border-border px-3">…</header>
<aside className="surface-glass-panel border-r border-border">…</aside>
```

**Exceptions — always stay solid even in glass mode:**
- Alert dialogs (emergency UI)
- Critical-error toasts (`<Toast variant="danger">`)
- Confirmation modals for destructive actions

These need maximum legibility under stress. Don't apply glass to them.

For the full anatomy, tokens, and interactive demo, see `/docs/liquid-glass`. For the HF/HCI grounding, see the "Layered transparency for spatial context" principle in `/docs/principles`.

## Semantic tokens

Use these semantic tokens in component code. They are guaranteed to exist across all four theme variants:

| Token class | What it represents |
|---|---|
| `bg-bg` | Page background |
| `bg-bg-subtle` | Subtly raised background |
| `bg-bg-muted` | Muted background (hover states, secondary surfaces) |
| `bg-surface` | Surface for cards, panels, inputs |
| `bg-surface-elevated` | Elevated surface for dialogs, popovers |
| `border-border` | Default border |
| `border-border-strong` | Stronger border for emphasis |
| `text-fg` | Primary text |
| `text-fg-muted` | Secondary text |
| `text-fg-subtle` | Tertiary text |
| `bg-accent` / `text-accent` | Product accent color |
| `text-accent-fg` | Foreground that sits on top of accent backgrounds |
| `bg-accent-hover` | Accent color when hovered |
| `text-danger` / `bg-danger` | Destructive / error |
| `text-success` | Success state |
| `text-warning` | Warning state |
| `text-info` | Informational |

Never use raw Tailwind colour utilities (`bg-slate-500`, `text-blue-600`, etc.) in component code. They break theme switching.

## Templates

PRIZM ships layout scaffolds called *templates* — reusable patterns that compose primitives into recurring shapes. Each template anchors on the design principles at `/docs/principles` and documents which principles it embodies in a mandatory "Design Principles Applied" section on its page.

**Available C3 templates:**

- `/c3/templates/app-shell` — the foundational chrome layout (top bar, status ticker, icon rail, main canvas slot, expandable side panel). Standalone full-bleed preview at `/c3/templates/app-shell/preview`. The source component lives at `app/c3/templates/app-shell/shell.tsx` and is named `C3AppShell`. Always renders in C3 dark by default — that's the canonical operator state.

**Available Enterprise templates:** none yet (in scope for the next phase).

When building a new template, follow the convention: include a "Design Principles Applied" section listing 2–4 principles with concrete rationale, embed a live preview, and link to a standalone full-bleed preview route.

## Capability packs

PRIZM supports **capability module packs** — themed extensions to a product family that add an identity layer and domain-specific organisms without forking the foundations or component primitives. Activate a pack by setting `data-pack="<slug>"` on a parent surface; the pack's CSS overrides only the relevant semantic tokens, everything else inherits from the host product family.

**Available capability packs:**

- **RC3** — Robotics & Autonomy modules for C3 systems. Activates with `data-pack="rc3"` inside a C3 surface. Adds the Ember signature colour, an always-on identity rule (1.5px top border + signature dot + RC3 mark), schematic iconography conventions, a set of signature organisms (spanning safety, comms / health, autonomy, sensor feeds, telemetry, operator input, fleet roster / detail, and a live 3D perception view), and RC3-specific concepts (command-context spectrum, five behavioural invariants, surface regions). Source lives at `components/rc3/<slug>.tsx`; docs at `app/c3/rc3/`; LLM context at `llms/rc3/<slug>.md`; token overrides at `styles/tokens/rc3-{light,dark}.css`.

When building inside an RC3 surface: import organisms from `@/components/rc3/<slug>`. Set `data-pack="rc3"` on the App Shell or shadow root that wraps the RC3 application. The RC3 organisms honour the Ember signature regardless of the `data-pack` attribute (the hue is inlined as a constant); the attribute controls whether the broader C3 accent token also flips to Ember for non-RC3 components rendering inside the same surface.

For full RC3 context, including the identity rule, behavioural invariants, and component anatomy, see `/c3/rc3` on the docs site.

## Overview pages — orientation and how-to

For narrative orientation and tactical setup, read the Overview section:

- `/docs/introduction` — why PRIZM is named after a prism, what changed in 4.0 (Base UI foundation, Tailwind v4 tokens, AI-first documentation, custom Liquid Glass surface treatment), and what's next (more components, more templates, exploring an "Info systems" third product family)
- `/docs/getting-started` — install dependencies, copy your first component
- `/docs/using-with-ai` — team-facing guide for adopting PRIZM with AI in the loop
- `/docs/installation` — per-component installation flow
- `/docs/theming` — architecture of the four-variant token system
- `/docs/air-gap` — disconnected deployment setup
- `/docs/changelog` — dated timeline of new components, templates, foundations, design tweaks, and notable fixes

## Foundation reference pages

For the visual reference of every token — what each value looks like, when to use it, how it varies across themes — read the foundation pages on the docs site:

- `/docs/foundations` — index linking to each page below
- `/docs/principles` — the human factors and HCI research that shapes PRIZM's patterns. Core principles (apply universally), plus C3-specific (operator dark, alert escalation, staged commit, stress-resilient consistency, **layered transparency for spatial context**) and Enterprise-specific (progressive disclosure, form ergonomics, whitespace hierarchy, undo-over-confirm). Templates and components implement these — when in doubt about a design call, anchor on the principle, not on what "looks right".
- `/docs/colors` — every semantic token rendered across all four theme variants, plus the baseline scales (slate, cyan, blue, status hues)
- `/docs/typography` — font families, type scale samples, weights
- `/docs/surface-and-motion` — radii (xs–xl), shadow tiers (sm/md/lg), and a note on motion. PRIZM doesn't define its own duration / easing tokens; components use Tailwind's default `duration-*` / `ease-*` utilities.
- `/docs/icons` — lucide-react at PRIZM's site-wide 1.5 stroke-width. Size scale (h-3 through h-6), text-pairing conventions, accessibility rules (decorative vs meaningful), catalogue of the ~30 icons used across PRIZM, custom-SVG conventions.
- `/docs/liquid-glass` — **C3-only** translucent surface treatment. Two tiers (`surface-glass-chrome` for application frame, `surface-glass-panel` for floating overlays). Available in both C3 light and C3 dark modes; tint flips with mode for backdrop contrast. Six components ship a `variant="glass"` prop: Sheet, Popover, Tooltip, HoverCard, Menu, ContextMenu.

When you need to know "what does `--prizm-color-fg-muted` actually look like in C3 dark mode?" or "what radius does a card use?", these are the canonical references. For the *architecture* behind the tokens (why two layers exist, how activation works), see `/docs/theming`. For the *reasons* a pattern exists, see `/docs/principles`.

## Dependencies

Every PRIZM consumer needs:

```json
{
  "dependencies": {
    "@base-ui-components/react": "^1.0.0-alpha.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.460.0",
    "tailwind-merge": "^2.5.4"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0-beta.4"
  }
}
```

Plus the PRIZM token CSS files imported in their global CSS.

## Air-gap discipline

PRIZM 4.0 supports air-gapped deployment. **Never introduce external URL references** anywhere in the codebase:

- ❌ Google Fonts, fonts.gstatic.com
- ❌ CDN-hosted scripts or stylesheets
- ❌ Remote image URLs in component examples
- ❌ Third-party analytics or telemetry
- ❌ External font/icon imports

All fonts live in `/public/fonts/`. All icons come from `lucide-react`. All assets are repo-local.

The `pnpm audit:airgap` script scans the repo and CI fails if external references appear.

## What to do when asked to build something

**Check for a project rules file first.** A consumer project may carry a rules file your tool auto-loads each session (`CLAUDE.md`, or your tool's equivalent) that records its PRIZM zone, pack, and local conventions — read and honour it before scaffolding; it often settles the zone/pack question for you. If none exists, offer to set one up so the decisions persist across sessions rather than relying on a one-off prompt the context will eventually summarise away.

**Before scaffolding, settle the zone — and whether a capability pack applies. Getting it wrong means redoing the template, not just re-theming.** Infer the zone from the domain: operations / mission / command-and-control / dispatch / monitoring → **C3**; websites, portals, marketing pages, forms, customer-facing dashboards → **Enterprise**. Then check for a **capability pack**: a pack layers on top of its base family when the work falls in that pack's specialty — consult the "Capability packs" section above for the packs that currently exist and the domains each covers, rather than assuming a fixed set. If the request is genuinely ambiguous — a bare "build a dashboard" fits either zone, and a given domain may or may not warrant a pack — ask the developer rather than silently defaulting.

- **"Add a button"** → Read `components/ui/button.tsx`, copy to consumer's project, ensure deps + tokens.
- **"Build a settings form"** → Compose `Field`, `Input`, `Label`, `Button` components. Reference the registry to confirm which exist as stable.
- **"Build a C3 application" / "Apply PRIZM C3"** → **Start with the C3 App Shell template.** Fetch the source from `https://raw.githubusercontent.com/prizm-design/prizm/main/app/c3/templates/app-shell/shell.tsx` (or read it locally at `app/c3/templates/app-shell/shell.tsx` if you have a PRIZM checkout). Copy it into the consumer's project (e.g. `templates/c3/app-shell.tsx`), set `data-zone="c3"` on the consumer's root, then fill the main canvas slot and rail-panel slots with the feature's content. The shell already handles the operator-dark default, top bar, status ticker, icon rail, and the chrome-level Notification Centre + Workspace panels. Only fall back to composing primitives from scratch if the shell genuinely doesn't fit (embedded widget, settings page that sits outside an ops console). **Do not** synthesise a substitute shell — if you can't fetch the file, stop and report the path back to the developer.
- **"Build a C3 dashboard"** → A dashboard is one app *inside* the C3 App Shell. Start with the shell (as above), then put the dashboard content in the main canvas. Don't reinvent the chrome.
- **"Build a robotics / autonomy console" / "Build a UAV/UGV operator station" / "Apply RC3"** → **Start with the RC3 operator-console template.** Fetch the source from `https://raw.githubusercontent.com/prizm-design/prizm/main/app/c3/rc3/templates/operator-console/console.tsx` (or read it locally at `app/c3/rc3/templates/operator-console/console.tsx` if you have a PRIZM checkout). Copy it into the consumer's project (e.g. `templates/rc3/operator-console.tsx`), set `data-pack="rc3"` on the surface that wraps the RC3 application, and substitute the stylised canvas for the consumer's real map / sensor feeds. Import RC3 organisms from `@/components/rc3/<slug>` — sources at `components/rc3/<slug>.tsx`. Honour the five behavioural invariants documented at `app/c3/rc3/concepts/behavioural-invariants/` (safety reachable in one tap, comms / health always visible, active context unambiguous, no mode-switch via accident, telemetry never silently stale). **Do not** fabricate substitute organisms — check `app/c3/rc3/components/` for what's available and planned; if something is missing, stop and report the gap rather than invent.
- **"Make the dark mode work"** → The token system handles this automatically. Set `data-mode="dark"` on `<html>` and the component code stays the same.

## What NOT to do

- Don't invent new tokens. If a semantic token is missing, raise it as a system-level decision.
- Don't copy components from external libraries. PRIZM components are intentionally curated.
- Don't bake product-specific copy into shared components. Components are neutral primitives.
- Don't use raw colour values. Always go through semantic tokens.
- Don't introduce external URL references. Air-gap discipline is enforced in CI.