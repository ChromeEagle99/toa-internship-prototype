---
component: safety-actions
slug: safety-actions
pack: rc3
status: stable
source: components/rc3/safety-actions.tsx
---

# Safety actions

RC3 organism. The primary safety affordance for the active scope. One tap to reach, a deliberate second tap to fire. The primary action is destructive; the secondary action is recoverable.

## When to use

- An operator needs a single, glanceable control for "stop / recall / abort" on the platform, group, swarm, or mission currently in focus.
- The surface needs to honour behavioural invariant 1 (*safety reachable within one tap from any live state*) — place this organism somewhere it's always visible when a platform is live.
- The action is destructive enough that a single accidental tap must not fire it — but quick enough that a confirmation dialog would be too slow.

## When NOT to use

- For graded LOA changes — use [AutonomyModeSelector](/c3/rc3/components/autonomy-mode-selector).
- For non-destructive choices or navigation — use [Button](/components/button) or [Tabs](/components/tabs).
- For destructive but rare actions that warrant a full dialog (delete account, factory reset) — use [Dialog](/components/dialog) with a confirm step.

## Scope variants

The component surfaces a different primary + secondary action set per scope. Pass `scope` to declare which.

| scope | primary action | secondary action |
|---|---|---|
| `platform` | `E-Stop` | `Override` |
| `group` | `Recall Group` | `Pause` |
| `swarm` | `Recall Swarm` | `Suspend` |
| `mission` | `Abort Mission` | `Pause` |

Action keys (passed back to `onAction`):

| key | meaning |
|---|---|
| `"e-stop"` | Emergency stop on a single platform. |
| `"override"` | Operator takes manual control. |
| `"recall-group"` | Recall every platform in the named group. |
| `"recall-swarm"` | Recall every platform in the swarm. |
| `"abort"` | Abort the entire mission. |
| `"pause"` | Pause the group / mission (recoverable). |
| `"suspend"` | Suspend the swarm (recoverable). |

## Behavioural rule — two-tap confirm

Honours behavioural invariant 1 (*safety reachable in one tap*) and invariant 4 (*deliberate transitions*). The primary action is always visible; the first tap arms it ("Confirm · X"), the second tap within 3 seconds fires. Escape or the floating cancel chip disarms.

The `confirm` prop defaults to `true`. Set `false` only in scripted-test contexts where the two-tap gesture would prevent automation; never set it false in production.

The secondary action fires immediately on a single tap — it's recoverable by design.

## States

- **Armed** — first tap on the primary action. Label changes to `Confirm · <Action>`. The button pulses and shows a floating cancel chip.
- **Disabled** — `disabled` prop blocks every action. Use only when no platform is live.

## Visual treatment

The primary action uses the `danger` semantic token (`bg-danger`, `text-danger-fg`) — destructive actions render the same way they would in baseline C3. **Never** use the RC3 Ember signature colour on a safety action; danger is status, not identity. The semantic separation is deliberate and must not be collapsed.

## Accessibility

- The component is a `<div role="group">` named "Safety actions for `<scope>`".
- Each button has `type="button"` so it doesn't submit forms.
- The armed primary button has `aria-pressed="true"` and its `aria-label` becomes `"Confirm <action>"` so screen readers announce the second-gesture requirement.
- The cancel chip has an explicit `aria-label="Cancel"`.
- Escape disarms when the primary is armed.
- `disabled` removes pointer events and dims the controls.

## Examples

```tsx
// Platform scope — E-Stop with Override fallback
<SafetyActions
  scope="platform"
  onAction={(key) => {
    if (key === "e-stop") emergencyStop(platformId);
    if (key === "override") takeManualControl(platformId);
  }}
/>

// Mission scope — Abort with Pause fallback
<SafetyActions
  scope="mission"
  onAction={(key) => {
    if (key === "abort") abortMission(missionId);
    if (key === "pause") pauseMission(missionId);
  }}
/>

// Disabled when no platform is live
<SafetyActions
  scope="platform"
  disabled={!platformLive}
  onAction={handleSafety}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `scope` | `"platform" \| "group" \| "swarm" \| "mission"` | — | The command-context scope. Determines the primary and secondary actions surfaced. |
| `onAction` | `(key: SafetyActionKey) => void` | — | Called when an action fires. The primary action only fires after the second armed tap. |
| `confirm` | `boolean` | `true` | Require an armed second tap on the primary action. Don't set `false` in production. |
| `disabled` | `boolean` | `false` | Disable all controls. Use only when no platform is live. |
| `className` | `string` | — | Additional Tailwind classes, merged via `cn()`. |

### Exported types

```ts
type SafetyScope = "platform" | "group" | "swarm" | "mission";

type SafetyActionKey =
  | "e-stop"
  | "override"
  | "recall-group"
  | "recall-swarm"
  | "abort"
  | "pause"
  | "suspend";
```

## Source

The canonical source lives at `components/rc3/safety-actions.tsx`. Copy it into the consumer's project at the same relative path. Required peer dependencies: `lucide-react`, `clsx`, `tailwind-merge` (the component imports `cn` from `@/lib/utils`).

The danger semantic token (`--prizm-color-danger`) is the same in baseline C3 and RC3 — the override token files (`styles/tokens/rc3-light.css`, `styles/tokens/rc3-dark.css`) intentionally do not touch it. The safety action renders correctly with or without `data-pack="rc3"` on a parent surface.
