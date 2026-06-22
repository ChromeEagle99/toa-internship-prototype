import { Label, RadioGroup, RadioGroupItem } from "toa-project";

export function Default() {
  return (
    <RadioGroup defaultValue="email">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem id="r-email" value="email" />
        <Label htmlFor="r-email">Email notifications</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem id="r-sms" value="sms" />
        <Label htmlFor="r-sms">Text message</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem id="r-none" value="none" />
        <Label htmlFor="r-none">No notifications</Label>
      </div>
    </RadioGroup>
  );
}

export function Disabled() {
  return (
    <RadioGroup defaultValue="standard" disabled>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem id="d-standard" value="standard" />
        <Label htmlFor="d-standard">Standard delivery</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RadioGroupItem id="d-express" value="express" />
        <Label htmlFor="d-express">Express delivery</Label>
      </div>
    </RadioGroup>
  );
}
