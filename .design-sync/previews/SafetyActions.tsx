import { SafetyActions } from "toa-project";

export function Platform() {
  return <SafetyActions scope="platform" />;
}

export function Scopes() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      <SafetyActions scope="group" />
      <SafetyActions scope="swarm" />
      <SafetyActions scope="mission" />
    </div>
  );
}
