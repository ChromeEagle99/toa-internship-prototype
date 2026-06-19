---
slug: video-tile
pack: rc3
title: Video tile
status: stable
---

# Video tile

RC3 signature organism. Frames a single sensor feed — FPV camera, gimbal, IR, EO. The actual video element is consumer-rendered; RC3 ships the surface (border, source label with Ember identity dot, semantic status, telemetry burn-in strip, recording indicator, reticle, no-signal overlay).

## When to reach for this

Whenever an operator needs to see live video from a vehicle. The dominant pane in most operator consoles: FPV for direct teleop, gimbal for surveillance, IR for night / low-visibility, EO for high-resolution daylight.

A single tile renders one feed. Multi-feed displays (side-by-side, picture-in-picture) are template-level compositions — drop several `<VideoTile>` into a grid.

## Anatomy

- **Frame** — `rounded-md` hairline border on `bg-bg`. Aspect ratio constrained (default 16:9; pass `"auto"` to release).
- **Source + status chip** — top-left. Ember identity dot + mono identifier (`FPV · UGV-04`) + semantic status label (LIVE / DEGRADED / NO SIGNAL). Always visible. Ember marks "this is the active RC3 feed source"; status reads in the label colour.
- **Telemetry strip** — bottom-left mono row. Surfaces only the cells the consumer passes: coordinates, sensor mode, bearing, range, zoom. Each cell renders only if its prop is present. Suppressed entirely when feed is lost.
- **Recording chip** — top-right when `recording={true}`. Danger dot + `REC` in mono.
- **Reticle** — optional centre crosshair + outer ring for aim. Off by default. Hidden when the feed is lost — meaning is undefined.
- **No-signal overlay** — replaces the frame on `status="lost"`. Backdrop-blurred `bg-bg` with danger dot + `NO SIGNAL` caption. Frozen frames are never shown alone.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `source` | `string` | — | Operator-visible identifier, e.g. `"FPV · UGV-04"`. |
| `status` | `"live" \| "degraded" \| "lost"` | — | Feed status. Drives the status label and no-signal overlay. |
| `recording` | `boolean` | `false` | Danger-toned `REC` indicator in the top-right. |
| `aspectRatio` | `"16:9" \| "4:3" \| "9:16" \| "1:1" \| "auto"` | `"16:9"` | Aspect ratio constraint. |
| `reticle` | `boolean` | `false` | Centre crosshair + outer ring overlay. |
| `coordinates` | `string` | — | Consumer-formatted look-point coordinates, e.g. `01°20'58"N 103°49'13"E`. |
| `bearing` | `number` | — | Camera bearing in degrees (0–359). Formatted `BRG ###°`. |
| `range` | `number` | — | Range to look-point in metres. Formatted `RNG N m` below 1 km, `N.N km` above. |
| `zoom` | `number` | — | Zoom multiplier — e.g. 4 for 4×. |
| `sensor` | `"EO" \| "IR" \| "LL"` | — | Sensor mode badge. |
| `children` | `ReactNode` | — | The consumer-rendered video element / canvas / player. |
| `className` | `string` | — | Forwarded to the root container. |

## Types

```ts
type FeedStatus = "live" | "degraded" | "lost";
type SensorMode = "EO" | "IR" | "LL";
```

Your application owns the classification — typically derived from link metrics + frame rate + last-frame timestamp on the consumer side.

## Wiring

The video stream itself is consumer-rendered. RC3 stays out of the protocol business — transport varies hugely across platforms (RTSP / H.264, WebRTC, MJPEG, HLS, raw frames over WebSocket).

```tsx
// WebRTC / HLS — straight to <video>
<VideoTile
  source="FPV · UGV-04"
  status={feed.status}
  recording={feed.recording}
>
  <video
    ref={feed.videoRef}
    autoPlay
    muted
    playsInline
    className="h-full w-full object-cover"
  />
</VideoTile>
```

```tsx
// RTSP via your JS player
<VideoTile source="GIMBAL · UAV-09" status={feed.status}>
  <YourRtspPlayer url={feed.rtspUrl} className="h-full w-full" />
</VideoTile>
```

## Behavioural rule

Honours invariant 5 (telemetry never silently stale). A stale frame masquerading as a live feed is the worst-case failure — operators act on imagery that is no longer true. When the feed is lost, the tile blanks with an explicit NO SIGNAL overlay rather than holding the last frame. Reticle hides on lost too — aim meaning is undefined without imagery.

## Identity colour

The Ember signature appears on the **source dot** in the top-left chip — marking "this is the active RC3 feed source" — and nowhere else on the tile. Status (LIVE / DEGRADED / NO SIGNAL) reads in the label colour using semantic tokens (success / warning / danger). Recording uses danger. Ember and status are visually distinct so the operator reads identity and state independently.

## Source

`components/rc3/video-tile.tsx` — copy into your project at the same relative path. Requires the C3 token CSS and the RC3 token override (set `data-pack="rc3"` on the wrapping surface).
