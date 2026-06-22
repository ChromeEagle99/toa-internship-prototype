import { PerceptionView } from "toa-project";

type Vec3 = [number, number, number];

// Deterministic pseudo-random so the scene renders identically each capture.
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HALF_X = 9;
const HALF_Y = 7;
const HEIGHT = 26;

function buildScene() {
  const rand = rng(0x5eed);

  // Aerial point cloud — roof + upper walls.
  const aerial: Vec3[] = [];
  for (let i = 0; i < 220; i++) {
    aerial.push([(rand() * 2 - 1) * HALF_X, (rand() * 2 - 1) * HALF_Y, HEIGHT + (rand() - 0.5) * 0.6]);
  }
  for (let i = 0; i < 120; i++) {
    const onX = rand() > 0.5;
    aerial.push([
      onX ? (rand() * 2 - 1) * HALF_X : rand() > 0.5 ? HALF_X : -HALF_X,
      onX ? (rand() > 0.5 ? HALF_Y : -HALF_Y) : (rand() * 2 - 1) * HALF_Y,
      HEIGHT * (0.55 + rand() * 0.45),
    ]);
  }

  // Ground point cloud — lower walls + apron.
  const ground: Vec3[] = [];
  for (let i = 0; i < 260; i++) {
    const onX = rand() > 0.5;
    ground.push([
      onX ? (rand() * 2 - 1) * HALF_X : rand() > 0.5 ? HALF_X : -HALF_X,
      onX ? (rand() > 0.5 ? HALF_Y : -HALF_Y) : (rand() * 2 - 1) * HALF_Y,
      HEIGHT * 0.5 * rand(),
    ]);
  }

  // Occupancy — coarse floor plan.
  const voxels: Vec3[] = [];
  for (let x = -HALF_X + 1; x < HALF_X; x += 1.4) {
    for (let y = -HALF_Y + 1; y < HALF_Y; y += 1.4) {
      if (Math.abs(y) < 1.1 && x > -6 && x < 6) continue;
      if (rand() > 0.82) continue;
      voxels.push([x, y, 0.2]);
    }
  }

  // Structural shell — four walls + roof.
  const v: Vec3[] = [
    [-HALF_X, -HALF_Y, 0],
    [HALF_X, -HALF_Y, 0],
    [HALF_X, HALF_Y, 0],
    [-HALF_X, HALF_Y, 0],
    [-HALF_X, -HALF_Y, HEIGHT],
    [HALF_X, -HALF_Y, HEIGHT],
    [HALF_X, HALF_Y, HEIGHT],
    [-HALF_X, HALF_Y, HEIGHT],
  ];
  const faces: [number, number, number][] = [];
  const quad = (a: number, b: number, c: number, d: number) => {
    faces.push([a, b, c], [a, c, d]);
  };
  quad(0, 1, 5, 4);
  quad(1, 2, 6, 5);
  quad(2, 3, 7, 6);
  quad(3, 0, 4, 7);
  quad(4, 5, 6, 7);

  return { aerial, ground, voxels, vertices: v, faces };
}

const G = buildScene();

const SCENE = {
  frame: "ENU" as const,
  sources: [
    { id: "UAV-09", label: "UAV-09", ageSeconds: 0.4 },
    { id: "UGV-04", label: "UGV-04", ageSeconds: 1.1 },
    { id: "UGV-05", label: "UGV-05", ageSeconds: 8.3 },
  ],
  layers: [
    {
      kind: "mesh" as const,
      id: "shell",
      label: "Structure",
      vertices: G.vertices,
      faces: G.faces,
    },
    {
      kind: "occupancy" as const,
      id: "floor-occupancy",
      label: "Floor plan",
      sourceId: "UGV-05",
      voxels: G.voxels,
      voxelSize: 1.1,
    },
    {
      kind: "points" as const,
      id: "ground-cloud",
      label: "Ground cloud",
      sourceId: "UGV-04",
      points: G.ground,
    },
    {
      kind: "points" as const,
      id: "aerial-cloud",
      label: "Aerial cloud",
      sourceId: "UAV-09",
      points: G.aerial,
    },
  ],
  aois: [
    {
      id: "entry",
      label: "Entrance",
      kind: "objective" as const,
      position: [-HALF_X - 1.5, 0, 1.4] as Vec3,
      confidence: 0.93,
      ageSeconds: 1.1,
    },
    {
      id: "smoke",
      label: "Smoke",
      kind: "hazard" as const,
      position: [2, HALF_Y, HEIGHT * 0.8] as Vec3,
      confidence: 0.74,
      ageSeconds: 0.4,
    },
    {
      id: "casualty",
      label: "Casualty",
      kind: "inspect" as const,
      position: [HALF_X, -1, HEIGHT * 0.5] as Vec3,
      confidence: 0.61,
      ageSeconds: 0.4,
    },
    {
      id: "roof",
      label: "Roof access",
      kind: "marker" as const,
      position: [-4, HALF_Y - 2, HEIGHT] as Vec3,
    },
  ],
};

export function ConsolidatedScene() {
  return (
    <div style={{ maxWidth: 720 }}>
      <PerceptionView scene={SCENE} status="live" selectedAoiId="smoke" />
    </div>
  );
}

export function HoldingFeed() {
  const held = {
    ...SCENE,
    sources: SCENE.sources.map((s) => ({ ...s, ageSeconds: s.ageSeconds + 9 })),
  };
  return (
    <div style={{ maxWidth: 720 }}>
      <PerceptionView scene={held} status="holding" />
    </div>
  );
}
