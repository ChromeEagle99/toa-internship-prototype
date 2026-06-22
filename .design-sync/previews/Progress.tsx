import { Progress } from "toa-project";

export function Determinate() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 360 }}>
      <Progress value={25} />
      <Progress value={60} />
      <Progress value={90} />
    </div>
  );
}

export function WithLabels() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 360 }}>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13,
            marginBottom: 6,
          }}
        >
          <span className="text-fg">Uploading dataset</span>
          <span className="text-fg-muted">45%</span>
        </div>
        <Progress value={45} />
      </div>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13,
            marginBottom: 6,
          }}
        >
          <span className="text-fg">Onboarding complete</span>
          <span className="text-fg-muted">80%</span>
        </div>
        <Progress value={80} />
      </div>
    </div>
  );
}

export function Complete() {
  return (
    <div style={{ maxWidth: 360 }}>
      <Progress value={100} />
    </div>
  );
}
