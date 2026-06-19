---
component: autonomy-mode-selector
slug: autonomy-mode-selector
pack: rc3
status: stable
source: components/rc3/autonomy-mode-selector.tsx
---

# Autonomy mode selector

RC3 organism. The level-of-autonomy (LOA) ladder for the active scope, and the consent gesture that gates every transition across it. The climb arms; the descent is immediate.

## When to use

- An operator needs to set or change the system's authority level — who is driving (operator vs system AI) and how much room the system has to act on its own.
- The scope is a single platform, a group of platforms, a swarm, or a whole mission. The same component handles all four scopes — pass `scope` to declare which.
- The control needs to live in a glanceable spot. Default `compact` mode collapses to a single tactical row showing the active rung; the full ladder discloses on demand.

## When NOT to use

- For binary on/off toggles — use [Switch](/components/switch).
- For navigation between views — use [Tabs](/components/tabs).
- For irreversible destructive actions like aborts or e-stops — use [SafetyActions](/c3/rc3/components/safety-actions) instead. The autonomy selector is for graded authority changes; it is not an emergency control.

## Scope variants

| scope | When to use |
|---|---|
| `platform` | A single physical platform (UGV, UAS, USV, etc.). |
| `group` | A named element / echelon of 2–N platforms acting together. |
| `swarm` | A larger, often homogeneous group operating under shared intent. |
| `mission` | The whole mission — strategic-level LOA. |

The `scope` prop is informational; the same ladder renders for all four. Use `platform` to label what the active context is in the header (e.g. `PLATFORM · UGV-04`).

## Rungs are caller-supplied

There is no single agreed LOA vocabulary (Sheridan, NASA LACES, and the various service formulations all differ). The component does not pick a winner. Rungs are passed as a prop. A default `DEFAULT_RUNGS` ladder ships as a starting point — loop-position language, task-agnostic:

| index | label | authority |
|---|---|---|
| `L0` | `MANUAL` | `OPERATOR` |
| `L1` | `SUPERVISED` | `OP-IN-LOOP` |
| `L2` | `DELEGATED` | `OP-ON-LOOP` |
| `L3` | `AUTONOMOUS` | `SYSTEM AI` |

Replace `DEFAULT_RUNGS` with your programme's taxonomy if it differs. Order rungs lowest-to-highest authority-to-machine.

## Postures

| `compact` | `framed` | When to use |
|---|---|---|
| `true` (default) | `false` (default) | Production posture, embedded in an operator console. Single tactical row; the full rail discloses on demand. Inherits host surface chrome. |
| `true` | `true` | Standalone / floating context (modal, popover, hero placement). Same disclosure behaviour, with a hairline bezel + surface fill. |
| `false` | `true` (recommended) | Training surfaces, review screens, docs. Full rail always visible. |
| `false` | `false` | Full rail with no chrome — for embedding in a host card that already carries the frame. |

## Behavioural rule — asymmetric consent

Honours behavioural invariant 4 — *no mode-switch via accident*. Climbing toward more machine authority arms on first tap and commits on the second within three seconds. Descending toward the operator is immediate, so the safety escape is never gated behind a confirmation. Escape disarms.

The `consent` prop defaults to `true`; set `false` only in training or simulation contexts where the climb should commit on a single tap.

## States

- **Engaged (default)** — a rung is active. Compact row shows the active rung; the rail (when disclosed) shows the chevron pointer.
- **Armed** — operator has tapped a higher rung; second tap will commit. The destination rung's label swaps to `CONFIRM` in Ember and a ghost chevron pulses on the rail. When `framed`, the bezel border goes Ember. The aria-label reads `"Confirm transition to <label>"` so screen readers still announce the destination rung that the second gesture will commit to.
- **Disabled** — `disabled` prop blocks every transition and dims the whole control. Use only when no platform is live — never to mask an error or a comms gap.

## Accessibility

- The rail is a `role="radiogroup"` named by scope. Each rung is a `role="radio"` with `aria-checked` reflecting the active mode.
- The disclosure chevron is a button with `aria-expanded` and `aria-controls` pointing at the rail. It does not commit a mode change.
- An arming rung updates its `aria-label` to `"Confirm transition to <label>"` so screen readers announce that a second gesture is required before authority changes.
- Enter / Space selects a rung. Escape disarms an armed transition. The active rung is disabled — there is no transition to itself.
- The Ember pointer is never the sole signal — the index, label, and authority line carry the meaning for operators with colour-vision differences.

## Examples

```tsx
// Compact, framed — operator console default
<AutonomyModeSelector
  scope="platform"
  platform="UGV-04"
  rungs={DEFAULT_RUNGS}
  activeKey={activeKey}
  onTransition={setActiveKey}
  framed
/>

// Always-expanded — training surface
<AutonomyModeSelector
  scope="mission"
  platform="OP NIGHTOWL · 47"
  rungs={DEFAULT_RUNGS}
  activeKey="autonomous"
  compact={false}
  framed
  onTransition={setActiveKey}
/>

// Embedded in a host card — no frame, host provides chrome
<div className="rounded-lg border border-border bg-surface p-6">
  <AutonomyModeSelector
    scope="group"
    platform="ECHELON BRAVO · 3"
    rungs={DEFAULT_RUNGS}
    activeKey={activeKey}
    onTransition={setActiveKey}
  />
</div>

// Custom rungs — programme-specific LOA taxonomy
const SHERIDAN_RUNGS: AutonomyRung[] = [
  { key: "1", index: "L1", label: "OPERATOR DECIDES", authority: "OPERATOR" },
  // ... eight more rungs ...
  { key: "10", index: "L10", label: "FULL AUTONOMY", authority: "SYSTEM AI" },
];

<AutonomyModeSelector scope="platform" rungs={SHERIDAN_RUNGS} activeKey="3" />
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `scope` | `"platform" \| "group" \| "swarm" \| "mission"` | — | The command-context scope. Displayed in the header. |
| `platform` | `string` | — | Optional platform / context label rendered next to the scope in the header. |
| `rungs` | `AutonomyRung[]` | — | The LOA taxonomy, ordered lowest to highest authority-to-machine. Use `DEFAULT_RUNGS` for the task-agnostic loop-position ladder, or supply your programme's vocabulary. |
| `activeKey` | `string` | — | The `key` of the currently active rung. |
| `onTransition` | `(toKey: string) => void` | — | Called when a transition commits. Climb commits after the second armed tap; descent commits on the first tap. |
| `consent` | `boolean` | `true` | Require an armed second gesture to commit a climb. Set `false` only in training contexts. |
| `disabled` | `boolean` | `false` | Disable all controls and dim the panel. Use only when no platform is live. |
| `compact` | `boolean` | `true` | Compact posture — single tactical row with disclosure chevron. Set `false` for always-expanded postures. |
| `framed` | `boolean` | `false` | Standalone chrome — hairline bezel + surface fill. Default `false` is embed-friendly; set `true` when the control is the dominant visual. |
| `className` | `string` | — | Additional Tailwind classes, merged via `cn()`. |

### Exported types

```ts
type AutonomyScope = "platform" | "group" | "swarm" | "mission";

interface AutonomyRung {
  key: string;        // stable identifier, e.g. "manual"
  index: string;      // displayed on the rail, e.g. "L0"
  label: string;      // display label in caps, e.g. "MANUAL"
  authority: string;  // loop-position authority, e.g. "OPERATOR"
  blurb?: string;     // optional meaning line; not rendered on the rail
}

const DEFAULT_RUNGS: AutonomyRung[]; // loop-position ladder, L0 → L3
```

## Source

The canonical source lives at `components/rc3/autonomy-mode-selector.tsx`. Copy it into the consumer's project at the same relative path. Required peer dependencies: `lucide-react`, `clsx`, `tailwind-merge` (or whatever your project uses for class merging — the component imports `cn` from `@/lib/utils`).

The component honours the Ember signature colour as an inlined constant (`oklch(71% 0.195 32)`) so the active rung renders correctly regardless of theme. When the consuming surface sets `data-pack="rc3"` on a parent element, the same hue backs the accent semantic token via the RC3 token override files (`styles/tokens/rc3-light.css`, `styles/tokens/rc3-dark.css`).
