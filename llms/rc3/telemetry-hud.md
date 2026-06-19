---
slug: telemetry-hud
pack: rc3
title: Telemetry HUD
status: stable
---

# Telemetry HUD

RC3 signature organism. Operational telemetry for a UXV — aerial, ground, surface, or underwater. The same organism, four domain dialects. Two postures: a compact strip for edge overlays, and a four-edge frame for centred map / 3D / video viewports.

## When to reach for this

Whenever the operator needs live state from a platform. The `domain` discriminator picks the right label dialect — `ALT` for aerial, `ELEV` for ground, `DEPTH` for surface and underwater; `V/S` climb rate for aerial, `DIVE` for underwater. Composes naturally with [Video tile](/c3/rc3/components/video-tile) (drop the strip as an overlay, or wrap the tile in `mode="frame"`).

## Domain dialects

| Domain | Vertical | Vertical rate | Domain-specific |
| --- | --- | --- | --- |
| `aerial` | `ALT` | `V/S` | — |
| `ground` | `ELEV` | `V/S` | `SLOPE` |
| `surface` | `DEPTH` (below keel) | `V/S` | — |
| `underwater` | `DEPTH` (sub-surface) | `DIVE` | `BOT` (altitude above seabed) |

Shared core across all domains: `SPD`, `HDG`, `BATT` / `FUEL`, `ROLL`, `PITCH`.

## Modes

- **`strip`** (default) — inline horizontal row, suited to edge overlays and side panels. Flex-wraps on narrow viewports.
- **`frame`** — four-edge container around a centred viewport. Top: heading + platform marker. Left: speed + roll. Right: vertical + pitch. Bottom: charge + vertical rate + domain-specific cells. The centre stays clear; consumer's map / 3D / video sits in `children`.

## Anatomy

- **Domain** discriminator drives label resolution and which cells render.
- **Platform marker** (optional, leading) — Ember dot + mono identifier. Drop when the HUD overlays a video tile that already names the source.
- **Operational cells** — `SPD`, `ALT` / `ELEV` / `DEPTH`, `HDG`, `BATT` / `FUEL`, `ROLL`, `PITCH`, `V/S` / `DIVE`, plus domain-specific `SLOPE` and `BOT`. Each renders only when its prop is passed.
- **Battery / fuel colour** — success > 50%, warning 20–50%, danger < 20%.
- **Stale marker** — a field listed in `stale` keeps its last-known value but renders it dimmed with a `STALE {age}` tag (danger-toned). The frozen reading stays visible but unmistakably degraded.
- **Hairline dividers** between cells in strip mode. Backdrop-blurred chips in frame mode.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `domain` | `"aerial" \| "ground" \| "surface" \| "underwater"` | `"aerial"` | UXV domain. Drives label semantics. |
| `mode` | `"strip" \| "frame"` | `"strip"` | Layout posture. |
| `platform` | `string` | — | Platform identifier — e.g. `"UGV-04"`. Ember-dotted leading cell. |
| `speed` | `number` | — | Speed value. |
| `speedUnit` | `"m/s" \| "km/h" \| "kn"` | `"m/s"` | Speed unit. |
| `vertical` | `number` | — | Vertical position — altitude / elevation / depth depending on domain. |
| `verticalUnit` | `"m" \| "ft"` | `"m"` | Vertical unit. |
| `verticalRef` | `string` | — | Reference marker appended to the vertical cell — e.g. `"AGL"` / `"MSL"` / `"BLW"`. |
| `verticalRate` | `number` | — | Vertical rate in m/s. Signed. Label resolves from domain. |
| `heading` | `number` | — | Heading in degrees (0–359). Three-digit padded. |
| `battery` | `number` | — | Battery state of charge (0–100). Colour-coded. |
| `fuel` | `number` | — | Fuel level (0–100). Mutually exclusive with `battery`. |
| `roll` | `number` | — | Roll angle in degrees. Signed. |
| `pitch` | `number` | — | Pitch angle in degrees. Signed. |
| `slope` | `number` | — | Ground-only. Slope / grade in degrees. Signed. |
| `altitudeAboveBottom` | `number` | — | Distance to bottom in metres. Sounder reading; meaningful for underwater and deep-terrain ground platforms. |
| `stale` | `Partial<Record<TelemetryField, number>>` | — | Per-field staleness, in seconds since last fresh update. A listed field dims its value and gains a `STALE {age}` tag. Honours invariant 5. |
| `children` | `ReactNode` | — | Frame-mode centre content. Ignored in strip mode. |
| `className` | `string` | — | Forwarded to the root container. |

## Types

```ts
type UxvDomain = "aerial" | "ground" | "surface" | "underwater";
type SpeedUnit = "m/s" | "km/h" | "kn";
type VerticalUnit = "m" | "ft";
type HudMode = "strip" | "frame";
type TelemetryField =
  | "speed" | "vertical" | "heading" | "battery" | "fuel"
  | "roll" | "pitch" | "verticalRate" | "slope" | "altitudeAboveBottom";
```

## Wiring

```tsx
// Aerial — strip mode beside a video tile
<TelemetryHud
  domain="aerial"
  platform="UAV-09"
  speed={state.airspeed}
  speedUnit="kn"
  vertical={state.altitudeFt}
  verticalUnit="ft"
  verticalRef="AGL"
  heading={state.heading}
  battery={state.batteryPct}
  roll={state.attitude.roll}
  pitch={state.attitude.pitch}
  verticalRate={state.climbRate}
/>
```

```tsx
// Underwater — DEPTH and DIVE labels resolve from domain
<TelemetryHud
  domain="underwater"
  platform="UUV-11"
  speed={state.speed}
  vertical={state.depth}
  heading={state.heading}
  battery={state.batteryPct}
  pitch={state.diveAngle}
  verticalRate={state.diveRate}
  altitudeAboveBottom={state.sounderM}
/>
```

```tsx
// Frame mode — four-edge overlay around a viewport
<TelemetryHud mode="frame" domain="aerial" ...telemetry>
  <YourMapEngine />
</TelemetryHud>
```

```tsx
// Mark a field stale when it stops updating — invariant 5
<TelemetryHud
  domain="ground"
  platform="UGV-04"
  speed={state.speed}
  heading={state.lastHeading}
  battery={state.batteryPct}
  stale={{ heading: secondsSince(state.headingUpdatedAt) }}
/>
```

## Behavioural rule

Honours invariant 5 (telemetry never silently stale). When a field stops updating, the consumer marks it stale via the `stale` prop (seconds since last fresh) — the value dims and gains a `STALE {age}` tag so a frozen reading can never pass for live. Omission remains valid only when a field is genuinely absent, not merely stale.

## Identity colour

The Ember signature appears only on the optional platform marker dot. Battery and fuel use semantic tokens (success / warning / danger) for state. Identity and state stay visually distinct.

## Source

`components/rc3/telemetry-hud.tsx` — copy into your project at the same relative path. Requires the C3 token CSS and the RC3 token override (set `data-pack="rc3"` on the wrapping surface).
