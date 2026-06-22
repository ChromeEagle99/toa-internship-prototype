import { Textarea } from "toa-project";

export function Default() {
  return (
    <div style={{ width: 320 }}>
      <Textarea placeholder="Describe the behaviour you observed…" />
    </div>
  );
}

export function WithValue() {
  return (
    <div style={{ width: 320 }}>
      <Textarea defaultValue="We noticed the dashboard takes a moment to load when several widgets are organised on the same row. Otherwise the colour scheme looks splendid." />
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ width: 320 }}>
      <Textarea
        defaultValue="This summary has been finalised and can no longer be edited."
        disabled
      />
    </div>
  );
}
