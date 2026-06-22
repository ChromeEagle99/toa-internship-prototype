import { TelemetryHud } from "toa-project";

export function AerialStrip() {
  return (
    <div style={{ maxWidth: 640 }}>
      <TelemetryHud
        domain="aerial"
        platform="UAV-09"
        speed={14.2}
        speedUnit="m/s"
        vertical={128}
        verticalUnit="m"
        verticalRef="AGL"
        verticalRate={1.4}
        heading={272}
        battery={64}
        roll={-3}
        pitch={5}
      />
    </div>
  );
}

export function GroundStripStale() {
  return (
    <div style={{ maxWidth: 640 }}>
      <TelemetryHud
        domain="ground"
        platform="UGV-04"
        speed={8}
        speedUnit="km/h"
        vertical={42}
        verticalUnit="m"
        verticalRef="MSL"
        heading={117}
        battery={28}
        slope={-6}
        stale={{ heading: 14 }}
      />
    </div>
  );
}
