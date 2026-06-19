---
slug: controller-interface
pack: rc3
title: Controller interface
status: stable
---

# Controller interface

RC3 signature organism. Live operator input state — sticks, triggers, buttons. Read-only; the consumer wires input from their gamepad / WebSocket / physical controller pipeline. Useful for direct teleop confirmation, deadzone debugging, and binding reference.

## When to reach for this

Whenever the operator is in direct teleop and benefits from seeing what their input is doing. Useful even with experienced operators — the binding labels rot less than memory under stress, and visible stick / trigger state confirms the input pipeline is live.

Not for touch / virtual-joystick input where the operator drags the stick on the screen rather than on physical hardware. That's a separate concern.

## Anatomy

- **Platform marker** — optional Ember-dotted leading cell. Drop when the controller sits next to a video tile that already names the source.
- **Stick wells** — circular SVG wells with a faint dashed deadzone, a centre-to-position trace, and a neutral fg dot at the current `(x, y)`. Numerical X / Y values below for precise reading. Label above (e.g. `DRIVE`, `GIMBAL`).
- **Trigger bars** — thin vertical bars filling from the bottom, value 0 to 1 displayed below.
- **Button pills** — small mono pills with optional binding subtitle. Pressed state inverts the pill (`bg-fg` / `text-bg`) for high-contrast read-at-a-glance.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `platform` | `string` | — | Platform identifier — e.g. `"UGV-04"`. Ember-dotted leading cell. |
| `leftStick` | `StickState` | — | Left stick state. `{ x, y }` normalised to -1 / 1. |
| `leftStickLabel` | `string` | `"STICK L"` | Label above the left stick well. |
| `rightStick` | `StickState` | — | Right stick state. |
| `rightStickLabel` | `string` | `"STICK R"` | Label above the right stick well. |
| `leftTrigger` | `number` | — | Left trigger value, 0 to 1. |
| `leftTriggerLabel` | `string` | `"TRIG L"` | Label above the left trigger bar. |
| `rightTrigger` | `number` | — | Right trigger value, 0 to 1. |
| `rightTriggerLabel` | `string` | `"TRIG R"` | Label above the right trigger bar. |
| `buttons` | `ControllerButton[]` | — | Button row. |
| `className` | `string` | — | Forwarded to the root container. |

## Types

```ts
interface StickState {
  x: number;  // -1 (full left) to 1 (full right)
  y: number;  // -1 (full down) to 1 (full up)
}

interface ControllerButton {
  id: string;
  label: string;
  pressed?: boolean;
  binding?: string;
}
```

## Wiring

Read-only. The consumer reads the gamepad (or WebSocket from a physical controller) and pushes state in on each tick. RC3 does not own the input pipeline.

```tsx
const pad = navigator.getGamepads()[0];

<ControllerInterface
  platform="UGV-04"
  leftStick={{ x: pad.axes[0], y: -pad.axes[1] }}
  leftStickLabel="DRIVE"
  rightStick={{ x: pad.axes[2], y: -pad.axes[3] }}
  rightStickLabel="GIMBAL"
  leftTrigger={pad.buttons[6].value}
  leftTriggerLabel="ZOOM−"
  rightTrigger={pad.buttons[7].value}
  rightTriggerLabel="ZOOM+"
  buttons={[
    { id: "a", label: "A", binding: "HORN", pressed: pad.buttons[0].pressed },
    { id: "b", label: "B", binding: "REC",  pressed: pad.buttons[1].pressed },
    { id: "x", label: "X", binding: "MARK", pressed: pad.buttons[2].pressed },
    { id: "y", label: "Y", binding: "RTL",  pressed: pad.buttons[3].pressed },
  ]}
/>
```

## Behavioural rule

Honours invariant 5 (telemetry never silently stale) by extension. When a stick or trigger goes unresponsive, omit its prop rather than holding the last-known value. A frozen stick reading masquerading as live input is the same failure shape as a stale video frame.

## Identity colour

The Ember signature appears only on the optional platform marker dot. Stick wells, trigger bars, and button pills stay neutral — operational controls use semantic intensity (pressed = high-contrast inversion) rather than identity hue.

## Source

`components/rc3/controller-interface.tsx` — copy into your project at the same relative path. Requires the C3 token CSS and the RC3 token override (set `data-pack="rc3"` on the wrapping surface).
