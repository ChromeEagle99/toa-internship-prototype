# Project rules — building UI with PRIZM 4.0

This project uses the **PRIZM 4.0** design system (DSTA). Honour these rules before
building or changing any UI. The full brief is in [PRIZM.md](PRIZM.md); the component
index is in [llms.txt](llms.txt); the canonical prop/API surface is in
[lib/components-api.ts](lib/components-api.ts). Read those before inventing anything.

## Core rule

This project's UI is built with PRIZM. Use PRIZM components **and templates** — start
from a PRIZM template where one fits before composing from primitives. **Before building
any UI from scratch, check `llms.txt` for what already exists** (and the registry for
status) — if PRIZM ships it, copy it in; don't hand-roll a substitute. This is the rule
that drifts: it's easy to follow every token rule while quietly rebuilding a component
PRIZM already ships. PRIZM is copy-paste, not an npm package — you own the code.

> Enterprise has no templates yet (C3 ships the App Shell; RC3 the operator console).
> The template-first rule still applies the moment one exists or the zone changes.

This file is the source of truth: re-read it before new work and partway through long
sessions.

## Active configuration

- **Zone:** `enterprise` (calm, spacious, professional — dashboards, forms, portals)
- **Mode:** `light`
- **Capability pack:** none

Set statically on `<html>` in [app/root.tsx](app/root.tsx):
`<html data-zone="enterprise" data-mode="light">`. If a feature needs C3 (operations /
command-and-control / monitoring) or a pack (e.g. RC3 robotics), stop and confirm with
the developer before scaffolding — getting the zone wrong means redoing templates, not
just re-theming.

## Where things live in THIS project (consumer layout)

PRIZM's repo uses root-relative paths (`components/ui/`, `lib/`) with `@/` → repo root,
and this project mirrors that exactly so copied components need **zero import edits**.
Two aliases (see [tsconfig.json](tsconfig.json); Vite honours it via
`resolve.tsconfigPaths`):

- **`@/*` → `./*` (repo root)** — the PRIZM design system. Vendored components and the
  shared helpers live here, matching PRIZM upstream.
- **`~/*` → `./app/*`** — *your* app code: routes, and any custom components you build.

| What | Path here | Import as |
|------|-----------|-----------|
| PRIZM components (vendored) | `components/{ui,site,rc3}/<slug>.tsx` | `@/components/<group>/<slug>` |
| Your custom components | `app/components/<slug>.tsx` | `~/components/<slug>` |
| `cn()` helper (shared) | `lib/utils.ts` | `@/lib/utils` |
| Token CSS (vendored) | `styles/tokens/*.css` | `@import`-ed by `app/app.css` |
| Tailwind theme wiring | `app/app.css` (`@theme` maps `--prizm-color-*` → `--color-*`) | — |

**Rule of thumb:** anything copied from PRIZM goes in root `components/` (`@/...`);
anything you author goes in `app/components/` (`~/...`). Custom components pull PRIZM in
via `@/components/...` and the shared `cn()` via `@/lib/utils`.

When you copy a PRIZM component, place it at `components/<group>/<slug>.tsx`. Its
`@/lib/utils` / `@/components/...` imports resolve unchanged because `@/*` → repo root —
the same layout PRIZM ships.

## Adding a component

1. Confirm it exists and is `status: "stable"` — check `llms.txt` / the registry at
   `lib/components-registry.ts` (fetch from raw if not vendored). Don't add `planned`
   slugs or fabricate substitutes; report roadmap gaps to the developer.
2. Fetch source: `https://raw.githubusercontent.com/prizm-design/prizm/main/components/ui/<slug>.tsx`
3. Save to `components/ui/<slug>.tsx` (root — the design system, imported as `@/`).
4. Pull dependencies/sub-components it imports the same way. If a fetch 404s, **stop and
   report the missing path** — do not synthesise a replacement.

## Conventions (enforced)

- **Semantic Tailwind tokens only:** `bg-bg`, `bg-surface`, `text-fg`, `text-fg-muted`,
  `border-border`, `bg-accent`, `text-accent-fg`, `text-danger`, etc.
- **Never raw colour utilities** (`bg-slate-500`, `text-blue-600`, …) — they break theme
  switching across the four variants.
- **Prefer existing component variants** over `className` overrides.
- **Check `llms/<slug>.md`** (fetch from raw) for a component's props, accessibility, and
  usage before wiring it up — don't guess the API.
- **British English** in all user-facing copy (colour, customise, organise, behaviour…).
- **Merge classes with `cn()`** from `@/lib/utils` — never string-concatenate.
- **`cva`** for multi-variant components; **`forwardRef`** for interactive ones; named
  exports only.
- **Icons:** `lucide-react` (PRIZM uses site-wide `stroke-width: 1.5`, already in
  `app/app.css`).
- **Air-gap discipline:** never introduce external URL references — no CDN scripts, no
  remote fonts (Google Fonts/gstatic), no remote images, no third-party analytics. All
  assets must be repo-local.
  > ⚠️ [app/root.tsx](app/root.tsx) currently links Inter from `fonts.googleapis.com`
  > (React Router starter default). That violates air-gap discipline. If this project
  > must be air-gap-clean, self-host Inter under `public/fonts/` and drop the
  > `<link>`s. Left as-is for now — confirm with the developer.

## Docs to fetch when you need them

- Brief: [PRIZM.md](PRIZM.md) · Index: [llms.txt](llms.txt) · API: [lib/components-api.ts](lib/components-api.ts)
- Per-component context: `https://raw.githubusercontent.com/prizm-design/prizm/main/llms/<slug>.md`
- Principles / foundations: `https://prizm.design/docs/principles`, `/docs/colors`, etc.
- Raw fetch pattern: `https://raw.githubusercontent.com/prizm-design/prizm/main/<repo-relative-path>`

## Don't

Invent new tokens · copy components from other libraries · bake product copy into shared
primitives · use raw colour values · add external URLs.
