import { PlatformRoster } from "toa-project";

export function EchelonBravo() {
  return (
    <PlatformRoster
      label="ECHELON BRAVO"
      activeId="UGV-04"
      platforms={[
        { id: "UGV-04", klass: "UGV", link: "good", signal: 4, battery: 72, autonomy: "SUPERVISED" },
        { id: "UAV-09", klass: "UAV", link: "good", signal: 3, battery: 64, autonomy: "AUTONOMOUS" },
        { id: "UAV-11", klass: "UAV", link: "degraded", signal: 2, battery: 38, autonomy: "DELEGATED" },
        { id: "UGV-05", klass: "UGV", link: "degraded", signal: 2, battery: 19, autonomy: "MANUAL" },
        { id: "UAV-14", klass: "UAV", link: "lost", signal: 0, battery: 51, autonomy: "MANUAL" },
      ]}
    />
  );
}

export function SurfaceFlotilla() {
  return (
    <PlatformRoster
      label="SURFACE FLOTILLA"
      activeId="USV-02"
      platforms={[
        { id: "USV-01", klass: "USV", link: "good", signal: 4, battery: 88, autonomy: "AUTONOMOUS" },
        { id: "USV-02", klass: "USV", link: "good", signal: 4, battery: 76, autonomy: "SUPERVISED" },
        { id: "UUV-03", klass: "UUV", link: "degraded", signal: 1, battery: 44, autonomy: "DELEGATED" },
      ]}
    />
  );
}
