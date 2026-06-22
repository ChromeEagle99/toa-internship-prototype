import { StateDot } from "toa-project";

export function OperationalStates() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
      <StateDot state="active">Motors armed</StateDot>
      <StateDot state="standby">Link standby</StateDot>
      <StateDot state="off">Payload offline</StateDot>
    </div>
  );
}

export function SubsystemRow() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
      <StateDot state="active">GPS fix</StateDot>
      <StateDot state="active">Comms relay</StateDot>
      <StateDot state="standby">Tether</StateDot>
      <StateDot state="off">Spotlight</StateDot>
    </div>
  );
}
