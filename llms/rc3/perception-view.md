---
slug: perception-view
pack: rc3
title: Perception view
status: stable
---

# Perception view

RC3 signature organism. The operator's live 3D window into what a robot swarm perceives — the mapped structure, the areas of interest within it, and how fresh and trustworthy each part of the picture is. The trustworthy screen, not the map-builder.

## When to reach for this

Whenever the operator needs to see — and command through — what the swarm perceives in space: a building or terrain being mapped, the occupancy of a floor, the point cloud a platform is returning, and the objectives / hazards marked within it. Composes with [Telemetry HUD](/c3/rc3/components/telemetry-hud) (wrap the view in `mode="frame"` to pin telemetry to the edges) and the [Video tile](/c3/rc3/components/video-tile) for a full operator picture.

## What RC3 owns — and what it doesn't

RC3 does **not** fuse, register, or run SLAM. It assumes an upstream system consolidates the swarm's sensors into one clean scene and hands it over — the same role the [Controller interface](/c3/rc3/components/controller-interface) plays for a physical gamepad. RC3 owns:

- The **input data contract** — ROS 2 / Foxglove-shaped layers (`PointCloud`, `Grid`, mesh) plus a native AOI schema.
- The **operator chrome** — coordinate-frame chip, layer legend / toggles, AOI registry, per-source provenance and freshness, the holding / lost overlay.
- A dependency-free **reference renderer** — canvas-2D projection of points, occupancy voxels, structural mesh, AOI markers, and live per-source transforms.

A high-scale vendor engine can take over the drawing via `renderDelegate` while keeping the contract and chrome. LOD, octree streaming, mesh reconstruction, and glTF / GLB / 3D Tiles binary decoding are delegate concerns, not core.

## Data contract

The scene is the web-friendly expression of the robotics-runtime families:

| Layer | ROS 2 / Foxglove origin |
| --- | --- |
| `points` | `sensor_msgs/PointCloud2` · Foxglove `PointCloud` |
| `occupancy` | `nav_msgs/OccupancyGrid` · OctoMap · Foxglove `Grid` |
| `mesh` | pre-tessellated glTF / 3D Tiles backdrop (binaries are a delegate concern) |
| AOIs | the one schema RC3 defines natively |

Pin a **canonical coordinate frame** (`ENU` / `NED` / `z-up` / `y-up`) and have each source declare its `FrameTransform` into it. Frame mismatch (z-up vs y-up, ENU vs NED) is the number-one integration failure, so the frame is named on screen.

## Anatomy

- **Coordinate frame** — top-left chip naming the canonical frame plus the overall `LIVE` / `HOLDING` / `FEED LOST` status.
- **Layer legend** — per-layer toggles with a kind swatch and element count. Points, occupancy, and mesh switch independently.
- **AOI registry** — areas of interest with kind tone (objective / hazard / inspect / marker) and confidence. Selecting one rings it in Ember on the canvas. A long list scrolls within the panel rather than overrunning the canvas (same overflow pattern as the platform roster).
- **Source provenance** — every contributing platform, its identity colour, and its freshness (`LIVE` or `STALE {age}`). A large swarm scrolls internally rather than running off the canvas.
- **Freshness decay** — geometry from a source that stops reporting fades and desaturates rather than vanishing or staying crisp.
- **Holding / lost** — when the consolidated feed pauses or drops, the whole view raises an unmistakable overlay with the age of the last good frame.
- **Reference renderer** — dependency-free canvas-2D projector. Drag to orbit; scroll-wheel or the on-canvas +/− buttons to zoom; `autoRotate` adds an idle slow spin the operator can pause / resume from a play-pause control. These camera controls render only on the reference renderer — under a `renderDelegate` the vendor engine owns its own camera.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `scene` | `PerceptionScene` | — | The consolidated scene from upstream — frame, sources, layers, AOIs. |
| `status` | `"live" \| "holding" \| "lost"` | `"live"` | Overall feed posture. `holding` dims + banners; `lost` overlays. Honours invariant 5. |
| `hiddenLayerIds` | `string[]` | — | Controlled — layer ids toggled off. Pair with `onToggleLayer`. |
| `onToggleLayer` | `(layerId: string) => void` | — | Fired when a legend entry is tapped. |
| `selectedAoiId` | `string \| null` | `null` | Controlled — focused AOI; ringed in Ember on the canvas. |
| `onSelectAoi` | `(aoiId: string \| null) => void` | — | Fired when an AOI is tapped; passes `null` on re-tap. |
| `staleAfterSeconds` | `number` | `3` | Source age beyond which geometry decays and provenance flips to STALE. |
| `autoRotate` | `boolean` | `false` | Slowly orbit the reference camera. Respects `prefers-reduced-motion`; pauses while dragging and from the on-canvas play-pause control. |
| `renderDelegate` | `(ctx: PerceptionRenderContext) => ReactNode` | — | Escape hatch — render geometry with a vendor engine; RC3 keeps the chrome. |
| `bareChrome` | `boolean` | `false` | Drop the legend / AOI / provenance panels — e.g. a compact tile. |
| `className` | `string` | — | Forwarded to the root container. |

## Types

```ts
type CoordinateFrame = "ENU" | "NED" | "z-up" | "y-up";
type Vec3 = [number, number, number];
type PerceptionStatus = "live" | "holding" | "lost";
type AoiKind = "objective" | "hazard" | "inspect" | "marker";
type SceneLayer = PointCloudLayer | OccupancyLayer | MeshLayer;

interface FrameTransform {
  translation: Vec3; // metres, into the scene frame
  yaw?: number; // radians about the up axis
}

interface PerceptionSource {
  id: string;
  label?: string;
  ageSeconds: number; // since last fresh geometry — drives decay + holding
  transform?: FrameTransform;
}

interface AreaOfInterest {
  id: string;
  label: string;
  kind: AoiKind;
  position: Vec3;
  sourceId?: string;
  confidence?: number; // 0–1
  ageSeconds?: number;
}

interface PerceptionScene {
  frame: CoordinateFrame;
  sources: PerceptionSource[];
  layers: SceneLayer[];
  aois?: AreaOfInterest[];
}
```

## Wiring

```tsx
// Live scene from an upstream perception subscription
<PerceptionView
  scene={{
    frame: "ENU",
    sources: feed.platforms.map((p) => ({
      id: p.id,
      ageSeconds: secondsSince(p.lastFrameAt),
      transform: { translation: p.position, yaw: p.yaw },
    })),
    layers: feed.layers, // points / occupancy / mesh
    aois: feed.areasOfInterest,
  }}
  status={feed.connected ? "live" : "holding"}
  hiddenLayerIds={hidden}
  onToggleLayer={toggleLayer}
  selectedAoiId={selectedAoi}
  onSelectAoi={setSelectedAoi}
/>
```

```tsx
// Hand the drawing to a vendor 3D engine, keep RC3's chrome
<PerceptionView
  scene={scene}
  renderDelegate={({ scene, hiddenLayerIds, selectedAoiId }) => (
    <YourEngine scene={scene} hidden={hiddenLayerIds} focus={selectedAoiId} />
  )}
/>
```

## Behavioural rule

Honours invariant 5 (telemetry never silently stale) — perception is telemetry with a shape. Geometry from a source that stops reporting fades rather than staying crisp; per-source freshness is always on screen; and a held or lost feed raises an unmistakable overlay. A frozen scene can never pass for a live one. Keep each source's `ageSeconds` honest, and raise `status` to `holding` / `lost` when the consolidated feed itself degrades.

## Identity colour

The Ember signature appears on the coordinate-frame marker dot, the source-provenance dots, and the selected-AOI ring. Layer point colours use a fixed per-source palette; AOI kinds use semantic tones (hazard danger, inspect warning). Identity and state stay visually distinct.

## Source

`components/rc3/perception-view.tsx` — copy into your project at the same relative path. Dependency-free (canvas-2D; no WebGL / Three.js). Requires the C3 token CSS and the RC3 token override (set `data-pack="rc3"` on the wrapping surface).
