import { ControllerInterface } from "toa-project";

export function TeleopState() {
  return (
    <div style={{ maxWidth: 720 }}>
      <ControllerInterface
        platform="UGV-04"
        leftStick={{ x: 0.32, y: 0.61 }}
        leftStickLabel="DRIVE"
        rightStick={{ x: -0.18, y: 0.04 }}
        rightStickLabel="GIMBAL"
        leftTrigger={0.85}
        leftTriggerLabel="ZOOM"
        rightTrigger={0.2}
        rightTriggerLabel="FOCUS"
        buttons={[
          { id: "a", label: "A", binding: "ARM", pressed: true },
          { id: "b", label: "B", binding: "STOP" },
          { id: "rb", label: "RB", binding: "MODE" },
          { id: "lb", label: "LB", binding: "LIGHT", pressed: true },
          { id: "dp", label: "▲", binding: "SPEED" },
        ]}
      />
    </div>
  );
}
