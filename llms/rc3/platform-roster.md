---
slug: platform-roster
pack: rc3
title: Platform roster
status: stable
---

# Platform roster

RC3 signature organism. Vertical list of platforms with quick-glance link / autonomy / battery per row. The active platform is unmistakable — Ember-marked left edge and leading dot. Essential for group / swarm command surfaces.

## When to reach for this

Whenever the operator commands more than one platform — group, swarm, or mission scope. The roster's first responsibility is to make the active context unambiguous (invariant 3). Pair with the [Comms / health strip](/c3/rc3/components/comms-health-strip) in aggregated mode for a roster-plus-summary surface.

## Anatomy

- **Active marker** — left-edge Ember bar + leading Ember dot mark the active row.
- **Signal bars** — four-bar reading coloured by link status. Matches the comms / health strip's bar treatment.
- **Identifier + class** — mono identifier with optional class tag (UGV / UAV / USV / UUV) in fg-subtle.
- **Right cluster** — autonomy rung (mono caps), battery percentage with semantic colour, link label (LINK / DEGRADED / LOST) in semantic tone.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `platforms` | `RosterEntry[]` | — | Platforms to render, in display order. |
| `activeId` | `string` | — | The id of the currently active platform. Marked with Ember. |
| `onSelect` | `(id: string) => void` | — | Fires when the operator selects a row. Omit for status-only rosters. |
| `label` | `string` | — | Optional roster label rendered above the list. |
| `fillHeight` | `boolean` | `false` | Opt into fit-and-scroll. Root takes parent's full height; the label header stays anchored; the list scrolls within the roster frame. |
| `className` | `string` | — | Forwarded to the root container. |

## Types

```ts
interface RosterEntry {
  id: string;                    // operator-visible identifier
  link: "good" | "degraded" | "lost";
  signal?: 0 | 1 | 2 | 3 | 4;    // bars; defaults from link when omitted
  battery?: number;              // 0-100, colour-coded
  autonomy?: string;             // e.g. "MANUAL", "SUPERVISED"
  klass?: string;                // class tag, e.g. "UGV", "UAV"
}
```

## Wiring

```tsx
<PlatformRoster
  label="ECHELON BRAVO"
  platforms={fleet.map(toRosterEntry)}
  activeId={activePlatformId}
  onSelect={(id) => commandContext.focus(id)}
/>
```

The consumer holds the active-platform state machine; the roster renders it. When `onSelect` is passed, rows become interactive buttons with focus / hover affordances. When omitted, rows are status-only.

## Behavioural rule

Honours invariant 3 (active context unambiguous). The Ember-marked active row is unmistakable — no row hover state, no near-miss colour, no ambiguity. The same command word means different things at different platforms; the roster anchors the operator's spatial sense of who they are addressing.

## Identity colour

The Ember signature appears only on the active row — left-edge bar + leading dot — and nowhere else. Battery, link, and signal use semantic tokens (success / warning / danger). Identity and state stay visually distinct.

## Source

`components/rc3/platform-roster.tsx` — copy into your project at the same relative path. Requires the C3 token CSS and the RC3 token override (set `data-pack="rc3"` on the wrapping surface).
