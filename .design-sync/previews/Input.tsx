import { Input } from "toa-project";

export function Default() {
  return (
    <div style={{ width: 280 }}>
      <Input placeholder="Enter your full name" />
    </div>
  );
}

export function WithValue() {
  return (
    <div style={{ width: 280 }}>
      <Input defaultValue="Eleanor Whitfield" />
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ width: 280 }}>
      <Input defaultValue="locked@organisation.co.uk" disabled />
    </div>
  );
}

export function Types() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 280 }}>
      <Input type="email" placeholder="name@organisation.co.uk" />
      <Input type="password" defaultValue="secret-passphrase" />
      <Input type="number" defaultValue={42} />
    </div>
  );
}
