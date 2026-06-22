import { Kbd } from "toa-project";

export function SingleKeys() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <Kbd>Esc</Kbd>
      <Kbd>Tab</Kbd>
      <Kbd>Enter</Kbd>
      <Kbd>Space</Kbd>
      <Kbd>&uarr;</Kbd>
      <Kbd>&darr;</Kbd>
    </div>
  );
}

export function Combinations() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
      <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
        <Kbd>Ctrl</Kbd>
        <span className="text-fg-muted">+</span>
        <Kbd>K</Kbd>
      </span>
      <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
        <Kbd>Ctrl</Kbd>
        <span className="text-fg-muted">+</span>
        <Kbd>Shift</Kbd>
        <span className="text-fg-muted">+</span>
        <Kbd>P</Kbd>
      </span>
    </div>
  );
}

export function InContext() {
  return (
    <p className="text-sm text-fg" style={{ maxWidth: 360 }}>
      Press <Kbd>Ctrl</Kbd> <Kbd>K</Kbd> to open the command palette, then <Kbd>Enter</Kbd> to
      run the selected action.
    </p>
  );
}
