---
component: comms-health-strip
slug: comms-health-strip
pack: rc3
status: stable
source: components/rc3/comms-health-strip.tsx
---

# Comms / health strip

RC3 organism. A persistent, compact strip carrying link state, signal strength, and platform health for the currently connected platform(s). One row per platform at platform scope; an aggregated summary at group / swarm / mission scope.

## When to use

- Any surface where a live platform is connected. Comms / health is invariant 2 — *visible whenever a live platform is connected* — and this organism is the canonical surface for that.
- Place at the top or edge of the operator canvas where it stays in peripheral vision.
- Use the aggregated view for multi-platform contexts so the operator sees the *summary* state of the group / swarm / mission without scanning a list.

## When NOT to use

- For per-component diagnostic deep-dives (per-link latency, retry counts, modulation, etc.) — those belong in a dedicated diagnostics panel, not the strip.
- For activity-feed style event lists — use a separate timeline / log component.
- For comms *control* (channel switching, frequency tuning) — the strip is read-only by design.

## Scope variants

| scope | view |
|---|---|
| `platform` | Single-platform row: signal bars + platform ID + LINK / DEGRADED / LOST + optional battery + optional GPS lock. |
| `group` / `swarm` / `mission` | Aggregated row: `<linked>/<total> LINK · <percent>% OK · <degraded> DEGRADED · <lost> LOST`. For `group` and `swarm` with ≤ 12 platforms, a row of status pips is appended. |

The single-platform row uses `<PlatformView>` internally; the aggregated row uses `<AggregatedView>`. Both render to a single rounded strip with hairline borders matching the baseline C3 chrome.

## Status taxonomy

Three states map to existing PRIZM semantic tokens — no RC3-specific status tokens. Ember is **not** used here; comms is status, not identity.

| status | meaning | token |
|---|---|---|
| `"good"` | Link healthy. | `--prizm-color-success` (green) |
| `"degraded"` | Link present but lossy or below threshold. | `--prizm-color-warning` (amber) |
| `"lost"` | Link not present. | `--prizm-color-danger` (red) |

The signal-bars sub-element renders 1–4 filled bars based on `signal: 0 | 1 | 2 | 3 | 4`, coloured by status.

## Behavioural rule — never silently stale

Honours behavioural invariant 5 — *telemetry never silently stale*. The strip is a read-out of state the host application passes in via props. The component does no polling, no caching, no implicit retry. If the host hands stale data, the strip will display stale data — operators should rely on the host's freshness guarantees, not the strip's.

If a degraded or lost state should produce a visible alert (toast, panel, escalation), wire it at the host level — the strip is a passive indicator.

## Accessibility

- The strip is a `<div role="status" aria-live="polite">` so screen readers announce state changes.
- The `aria-label` summarises the current state, e.g. `"Comms for UGV-04: LINK"` or `"Comms summary: 11 of 12 linked, 92 percent healthy"`.
- Visual status is never the sole signal — the text label (`LINK` / `DEGRADED` / `LOST` / `<N> DEGRADED` / `<N> LOST`) carries the meaning for operators with colour-vision differences.
- Pips at small sizes carry a `title` for tooltip access and inherit the same semantic colours as the bars.

## Examples

```tsx
// Platform scope — single platform live
<CommsHealthStrip
  scope="platform"
  platform={{
    id: "UGV-04",
    signal: 4,
    battery: 78,
    gpsLock: true,
    status: "good",
  }}
/>

// Platform scope — no platform connected
<CommsHealthStrip scope="platform" />

// Group scope — aggregated with pips
<CommsHealthStrip
  scope="group"
  platforms={[
    { id: "A1", signal: 4, status: "good" },
    { id: "A2", signal: 3, status: "good" },
    { id: "A3", signal: 2, status: "degraded" },
  ]}
/>

// Mission scope — large fleet, aggregated summary only
<CommsHealthStrip
  scope="mission"
  platforms={fleet}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `scope` | `"platform" \| "group" \| "swarm" \| "mission"` | — | Determines whether the strip renders a single rich row or an aggregated summary. |
| `platform` | `PlatformLink` | — | The single platform at `scope="platform"`. Omit for the "no platform connected" empty state. |
| `platforms` | `PlatformLink[]` | — | Multiple platforms at `scope="group"` / `"swarm"` / `"mission"`. |
| `className` | `string` | — | Additional Tailwind classes, merged via `cn()`. |

### Exported types

```ts
type LinkStatus = "good" | "degraded" | "lost";

interface PlatformLink {
  id: string;               // platform identifier, e.g. "UGV-04"
  signal: 0 | 1 | 2 | 3 | 4; // signal-bar fill, 0 = no bars
  battery?: number;          // percent, optional — shown if provided
  gpsLock?: boolean;         // shown if true
  status: LinkStatus;
}
```

## Source

The canonical source lives at `components/rc3/comms-health-strip.tsx`. Copy it into the consumer's project at the same relative path. Required peer dependencies: `clsx`, `tailwind-merge` (the component imports `cn` from `@/lib/utils`). No icon library required — the signal bars are inline div elements.

The semantic status tokens (`--prizm-color-success`, `--prizm-color-warning`, `--prizm-color-danger`) are the same in baseline C3 and RC3 — the override token files intentionally do not touch them. The strip renders correctly with or without `data-pack="rc3"` on a parent surface.
