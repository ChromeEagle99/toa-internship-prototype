# design-sync notes — PRIZM 4.0 (TOA)

Repo-specific gotchas for syncing this project to claude.ai/design. Read before re-syncing.

## What this repo is

A **consumer** React Router app that *vendors* the PRIZM 4.0 design system (copy-paste, not
an npm package). The synced design system is the vendored set under `components/` (ui + rc3).
There is no library `dist/`, so the converter runs in **synth-entry mode** (bundles directly
from `components/*.tsx` source via esbuild). `pkg` is the app name `toa-project`; the bundle
global is `window.Prizm`.

## Setup that must be reproduced on a fresh clone / re-sync

- **Self-junction**: synth-entry derives `PKG_DIR = node_modules/<pkg>`, which doesn't exist
  (the app isn't self-installed). Create it:
  `New-Item -ItemType Junction -Path "node_modules\toa-project" -Target "<repo-abs-path>"`
  (PowerShell). `realpathSync` collapses it back to the repo root, so cssEntry/tsconfig bounds
  pass. Without it the build fails to find `components/`.
- **Build command** (`cfg.buildCmd`): `npm run build && cp build/client/assets/root-*.css
  .design-sync/compiled.css && node .design-sync/gen-docs.mjs`. The app's own Tailwind v4 build
  produces the compiled stylesheet (utilities + `:root` tokens + fonts) used as `cssEntry`; the
  hashed filename is copied to a stable path. `gen-docs.mjs` regenerates per-component docs.
- **Converter invocation**:
  `node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules --out ./ds-bundle`
  (no `--entry` — synth mode).
- **Render check** needs `playwright` importable + a chromium binary. Cached chromium builds
  live in `%LOCALAPPDATA%/ms-playwright/`. Install `playwright` into `.ds-sync/`, then point the
  validate at a cached binary via the env override:
  `DS_CHROMIUM_PATH="C:/Users/Admin/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe"`
  (repo pin / version-matching is unnecessary with the explicit path).

## Shims (sync-only; the app's own code/tsconfig is untouched)

`.design-sync/tsconfig.sync.json` adds two path aliases the synth bundle needs (every source
file must compile, even excluded ones):
- `next/link` → `.design-sync/shims/next-link.tsx` (plain anchor). The vendored
  `components/ui/link.tsx` imports `next/link`, but this is a React Router app with no `next`
  dep. Claude Design renders plain React, so anchor is the correct target.
- `@/lib/theme-context` → `.design-sync/shims/theme-context.tsx`. That module does NOT exist in
  the repo; only `components/rc3/swatch.tsx` (RC3Swatch, excluded) imports it.

## Excluded components (`cfg.componentSrcMap` null)

- `RC3Swatch` — docs-only helper depending on the absent `@/lib/theme-context`.
- `AutonomyModeSelectorDemo`, `PerceptionViewDemo` — demo wrappers, not DS components.

## Grouping

PRIZM exports components flat (named exports in one `components/ui` dir), and synth mode has no
`.d.ts` compound data, so `partitionSubcomponents` can't nest sub-parts. Grouping is driven by
`gen-docs.mjs`, which writes one doc per component carrying `category:` frontmatter (mapped from
llms.txt) into `.design-sync/docs/` (cfg.docsDir). rc3 category slugs to `rc3` to merge with the
src-dir-derived group. Result: 9 groups (overlay, navigation, forms, data-display, rc3, layout,
feedback, typography, actions).

## Known render warns (triaged — not new on re-sync)

- `[TOKENS_MISSING]` for `--font-sans--font-feature-settings`,
  `--font-sans--font-variation-settings`, `--font-mono--font-feature-settings`,
  `--font-mono--font-variation-settings` — Tailwind v4 font-feature/variation runtime sub-props,
  set per-element at runtime, never defined as static tokens. Non-blocking, expected.
- `[RENDER_BLANK]` on unauthored components that render empty without children (e.g. empty
  container sub-parts: CardContent, TableCell, SheetBody…). These are the typographic floor card
  / empty leaf containers, not failures. Authoring a preview fixes any that matter.

## Authored previews (47 components) — findings folded from wave learnings

Solo calibration: Button, Card, Select, Text. Then 5 family waves (Forms, Data/Feedback,
Nav/Layout/Typography, Overlay, RC3). All cells graded `good`. Key API/authoring gotchas worth
keeping:

- **Field**: `FieldError` takes `match` (boolean | keyof ValidityState); `match={true}` forces the
  error to show statically. No `forceShow`; `Field.Root` has no `invalid` prop. `FieldControl`
  (Base UI `Field.Control`) is an unstyled bare input — apply the Input className manually.
- **Combobox / Select**: closed trigger renders fine statically via the Value fallback; the open
  list is interaction-only (not shown in a static card — expected).
- **Badge** valid variants: solid/outline/subtle/success/warning/danger/info (no `neutral`).
- **Link** wraps `next/link` (shimmed). In previews prefer a plain styled `<a>` for trigger labels
  inside overlays (e.g. HoverCard) to avoid pulling Link/router context.
- **Overlays** render their panel statically via `defaultOpen` (Dialog/Sheet/Popover/Tooltip/
  Menu/ContextMenu/HoverCard) or `defaultValue` (NavigationMenu). Command is inline (non-portal).
  Card overrides applied in config: Dialog 640x480, Sheet 640x520, ContextMenu 360x320 (all
  `cardMode:"single"`). Popover/Tooltip/Menu/HoverCard/Command/NavigationMenu need no override.
- **VideoTile** (RC3): CSS `aspect-ratio` classes resolve to zero height in the capture sandbox;
  author with `aspectRatio="auto"` + an explicitly sized wrapper.
- **RC3** organisms inline the Ember signature hue, so they render honestly at enterprise/light;
  no pack/zone wrapper needed for a passing grade (a `data-zone="c3" data-pack="rc3"` wrapper is
  only a cosmetic upgrade).

Components NOT authored (~126) ship the typographic floor card — mostly compound sub-parts
(CardHeader, TableCell, DialogContent, MenuItem…) that are composed inside their parent's authored
preview. Authoring any of them is a cheap incremental re-sync.

## Re-sync risks

- `cfg.cssEntry` (`.design-sync/compiled.css`) is **generated** by `npm run build` (gitignored).
  Always run `buildCmd` before the converter on re-sync, or cssEntry will be stale/missing.
- `.design-sync/docs/` is generated by `gen-docs.mjs` (gitignored) — also via `buildCmd`.
- The self-junction is gitignored (under `node_modules/`) — recreate it on a fresh clone.
- Category map in `gen-docs.mjs` is hand-derived from llms.txt; if PRIZM adds component
  categories upstream, update the `CATEGORY` map.
- Scope: only `components/` (vendored DS) is synced. `app/components/` custom compositions
  (multi-step-form, dashboard, date-range-picker) are NOT — they live in a separate tree with a
  `calendar` name collision. Adding them is a future, separate decision.
