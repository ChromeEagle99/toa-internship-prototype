---
slug: platform-detail
pack: rc3
title: Platform detail
status: stable
---

# Platform detail

RC3 signature organism. Vertical card showing the deep state of a single platform — the master-detail companion to [Platform roster](/c3/rc3/components/platform-roster). Header + three labelled sections (Comms, Telemetry, Mission) + optional consumer-supplied `extras` sections + optional last-contact footer. Each section renders only when its props are passed.

## When to reach for this

Compose adjacent to a roster whenever the operator needs deeper state than the roster row provides — position, heading, speed, mission progress, who's responsible. Roster scans; detail drills.

## Anatomy

- **Header** — Ember-dotted platform identifier, optional class tag, optional current-autonomy summary on the right.
- **Comms section** — LINK (semantic colour), signal-bars indicator + count, battery gauge + percent (colour-coded).
- **Telemetry section** — POSITION, HEADING (with rotating dial), SPEED, vertical (ALT / ELEV / DEPTH resolved from `domain`).
- **Mission section** — mission step progress (`WPT-04 · 4/12`) and active operator.
- **Extras sections** — consumer-supplied domain-specific rows (payload, sensor health, fuel, munitions). Rendered between Mission and Last contact.
- **Last contact footer** — time since last heartbeat. Anchors invariant 5.

## Visual indicators

Signal bars, battery gauge, and heading dial sit next to their text values. Text stays — operators read text faster than icons under stress. The indicators are a glanceable secondary read. All use semantic tokens; no Ember on state surfaces.

### Indicator alphabet for `extras`

Four pack-internal primitives from `@/components/rc3/indicators` extend the alphabet for consumer-supplied `extras[].value`. Pick the indicator that matches the data's shape — don't add chrome decoration to signal "tactical"; the instrument reads tactical because the encoding is honest.

- **`PipCount`** — discrete inventory (munition, cartridges, comms-relay drops). Pips stay countable; a smooth gauge would round away the operationally-meaningful unit. Props: `filled`, `total`, optional `suffix`, optional `tone`. Keep `total` small (≤ 8); larger totals belong in plain text.
- **`CapacityBar`** — continuous percentage (fuel reserve, comms-relay buffer, mission completion, tank level). Thin horizontal bar with a semantic-toned fill. Props: `pct` (0–100), optional `tone` (`success | warning | danger | muted`, default `success`), optional `suffix` (replaces the default `N%` text — pass `"42 min"` for time-remaining, etc.). Tone is explicit because "low = bad" is not universal (mission completion at 20% is fine, fuel at 20% is not).
- **`StateDot`** — three-state operational status (`active` / `standby` / `off`). Colour-coded dot paired with a label. Use for sensor channels, sub-system health, secondary modes.
- **`StateText`** — binary safety-critical state (ARMED / SAFE, WEAPONS HOT / COLD). Colour-coded mono text, no border or pill. Matches the LINK / LOST family already in Comms. Props: `tone` (`success | warning | danger | muted`), children.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `platform` | `string` | — | Platform identifier. Ember-dotted header. |
| `klass` | `string` | — | Class tag — UGV / UAV / USV / UUV. |
| `domain` | `"aerial" \| "ground" \| "surface" \| "underwater"` | — | Drives the vertical concept label. |
| `link` | `"good" \| "degraded" \| "lost"` | — | Link state. |
| `signal` | `0 \| 1 \| 2 \| 3 \| 4` | — | Signal bars count. |
| `battery` | `number` | — | Battery percent (0–100). Colour-coded. |
| `autonomy` | `string` | — | Current autonomy rung label. |
| `position` | `string` | — | Consumer-formatted coordinates. |
| `heading` | `number` | — | Heading in degrees. |
| `speed` | `number` | — | Speed value. |
| `speedUnit` | `"m/s" \| "km/h" \| "kn"` | `"m/s"` | Speed unit. |
| `vertical` | `number` | — | Vertical position. Label from domain. |
| `verticalUnit` | `"m" \| "ft"` | `"m"` | Vertical unit. |
| `verticalRef` | `string` | — | Reference marker (AGL / MSL / BLW). |
| `mission` | `MissionStep` | — | Mission step progress. |
| `operator` | `string` | — | Active operator. |
| `lastContact` | `string` | — | Time since last heartbeat. |
| `extras` | `PlatformDetailExtra[]` | — | Domain-specific rows surfaced between Mission and Last contact. |
| `fillHeight` | `boolean` | `false` | Opt into fit-and-scroll. Root takes parent's full height; header and last-contact footer stay anchored; the body scrolls within the frame. |
| `className` | `string` | — | Forwarded to root. |

## Types

```ts
interface MissionStep {
  current: number;
  total: number;
  label?: string;
}

interface PlatformDetailExtra {
  section?: string;     // section header — consecutive same-section entries group
  label: string;        // row label
  value: ReactNode;     // row value
}
```

`extras` behaviour: consecutive entries with the same `section` value group under one labelled section. An entry without `section` merges into the immediately-preceding section (or starts a generic "Extra" section if none precedes). Empty array renders nothing.

```tsx
import {
  CapacityBar,
  PipCount,
  StateDot,
  StateText,
} from "@/components/rc3/indicators";

<PlatformDetail
  platform="UAV-07"
  // ...comms / telemetry / mission props...
  extras={[
    {
      section: "Payload",
      label: "Munition",
      value: <PipCount filled={4} total={4} suffix="AGM-114" />,
    },
    {
      section: "Payload",
      label: "Status",
      value: <StateText tone="danger">ARMED</StateText>,
    },
    {
      section: "Endurance",
      label: "Fuel",
      value: <CapacityBar pct={62} suffix="62%" />,
    },
    {
      section: "Sensors",
      label: "EO/IR",
      value: <StateDot state="active">Tracking</StateDot>,
    },
    {
      section: "Sensors",
      label: "Radar",
      value: <StateDot state="standby">Standby</StateDot>,
    },
  ]}
/>
```

### Internal scrolling

Pass `fillHeight` to opt into fit-and-scroll: root takes parent's full height, header and last-contact footer stay anchored, body (Comms / Telemetry / Mission / extras) scrolls within the frame. Use inside height-constrained containers (e.g. a sidebar column with `flex-1 min-h-0`) so a card with many `extras` doesn't push the parent layout. Without it, the card stays intrinsic-height.

## Wiring

Read-only. Compose with platform roster:

```tsx
const active = fleet.find((p) => p.id === activeId);

<div className="flex gap-4">
  <PlatformRoster
    platforms={fleet.map(toRosterEntry)}
    activeId={activeId}
    onSelect={setActiveId}
  />
  {active && (
    <PlatformDetail
      platform={active.id}
      klass={active.klass}
      domain={active.domain}
      link={active.link}
      signal={active.signal}
      battery={active.battery}
      autonomy={active.autonomy}
      position={active.coords}
      heading={active.heading}
      speed={active.speed}
      vertical={active.altitude}
      verticalUnit={active.altitudeUnit}
      verticalRef={active.altitudeRef}
      mission={active.mission}
      operator={active.operator}
      lastContact={active.lastContact}
    />
  )}
</div>
```

## Behavioural rule

Honours invariant 3 (active context unambiguous). The Ember-dotted header marks which platform this detail is for. When the operator selects a different row, the card swaps wholesale — never a partial update that could leave fields from the previous platform.

## Identity colour

The Ember signature appears only on the header dot. Battery and link use semantic tokens; everything else stays neutral. Identity and state read independently.

## Source

`components/rc3/platform-detail.tsx` — copy into your project at the same relative path.

`components/rc3/indicators.tsx` — pack-internal indicator primitives (`PipCount`, `StateDot`, `StateText`). Copy alongside the organism when payload / sensor `extras` are in scope.
