import { AutonomyModeSelector } from "toa-project";

const RUNGS = [
  { key: "manual", index: "L0", label: "MANUAL", authority: "OPERATOR" },
  { key: "supervised", index: "L1", label: "SUPERVISED", authority: "OP-IN-LOOP" },
  { key: "delegated", index: "L2", label: "DELEGATED", authority: "OP-ON-LOOP" },
  { key: "autonomous", index: "L3", label: "AUTONOMOUS", authority: "SYSTEM AI" },
];

export function FullLadder() {
  return (
    <div style={{ maxWidth: 360 }}>
      <AutonomyModeSelector
        scope="platform"
        platform="UGV-04"
        rungs={RUNGS}
        activeKey="supervised"
        compact={false}
        framed
      />
    </div>
  );
}

export function CompactGlance() {
  return (
    <div style={{ maxWidth: 360 }}>
      <AutonomyModeSelector
        scope="swarm"
        platform="ECHELON BRAVO"
        rungs={RUNGS}
        activeKey="autonomous"
        compact
        framed
      />
    </div>
  );
}
