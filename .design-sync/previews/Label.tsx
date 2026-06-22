import { Input, Label } from "toa-project";

export function Default() {
  return <Label>Organisation name</Label>;
}

export function WithControl() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 280 }}>
      <Label htmlFor="email-field">Email address</Label>
      <Input id="email-field" type="email" placeholder="name@organisation.co.uk" />
    </div>
  );
}

export function Disabled() {
  return (
    <div className="group" style={{ display: "flex", flexDirection: "column", gap: 6, width: 280 }}>
      <Label htmlFor="locked-field">Account reference</Label>
      <Input id="locked-field" className="peer" defaultValue="ACC-00821" disabled />
      <Label htmlFor="locked-field">This reference cannot be changed</Label>
    </div>
  );
}
