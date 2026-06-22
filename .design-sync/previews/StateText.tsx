import { StateText } from "toa-project";

export function SafetyStates() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
      <StateText tone="success">ARMED</StateText>
      <StateText tone="warning">GEOFENCE NEAR</StateText>
      <StateText tone="danger">E-STOP LATCHED</StateText>
      <StateText tone="muted">DISARMED</StateText>
    </div>
  );
}

export function InlineReadout() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
      <StateText tone="success">LINK NOMINAL</StateText>
      <StateText tone="warning">GPS DEGRADED</StateText>
      <StateText tone="danger">FAILSAFE</StateText>
    </div>
  );
}
