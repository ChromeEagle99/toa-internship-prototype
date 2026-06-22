import { Checkbox, Label } from "toa-project";

export function Unchecked() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Checkbox id="updates" />
      <Label htmlFor="updates">Send me product updates</Label>
    </div>
  );
}

export function Checked() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Checkbox id="terms" defaultChecked />
      <Label htmlFor="terms">I accept the terms and conditions</Label>
    </div>
  );
}

export function Indeterminate() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Checkbox id="select-all" indeterminate />
      <Label htmlFor="select-all">Select all organisations</Label>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Checkbox id="off" disabled />
        <Label htmlFor="off">Unavailable option</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Checkbox id="on" defaultChecked disabled />
        <Label htmlFor="on">Locked selection</Label>
      </div>
    </div>
  );
}
