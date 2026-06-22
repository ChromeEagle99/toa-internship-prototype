import { VideoTile } from "toa-project";

export function LiveFpv() {
  return (
    <div style={{ width: 480, height: 270 }}>
      <VideoTile
        source="FPV · UGV-04"
        status="live"
        recording
        reticle
        sensor="EO"
        coordinates={"01°20'58\"N 103°49'13\"E"}
        bearing={272}
        range={840}
        zoom={4}
        aspectRatio="auto"
        className="h-full w-full"
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(160deg, oklch(0.42 0.03 250) 0%, oklch(0.28 0.02 250) 55%, oklch(0.2 0.02 250) 100%)",
          }}
        />
      </VideoTile>
    </div>
  );
}

export function FeedStates() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <div style={{ width: 320, height: 180 }}>
        <VideoTile
          source="IR · UAV-09"
          status="degraded"
          sensor="IR"
          bearing={48}
          range={2400}
          zoom={2}
          aspectRatio="auto"
          className="h-full w-full"
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(160deg, oklch(0.38 0.04 60) 0%, oklch(0.24 0.02 60) 100%)",
            }}
          />
        </VideoTile>
      </div>
      <div style={{ width: 320, height: 180 }}>
        <VideoTile
          source="LL · UAV-11"
          status="lost"
          sensor="LL"
          aspectRatio="auto"
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
