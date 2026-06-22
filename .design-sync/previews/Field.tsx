import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "toa-project";

export function Default() {
  return (
    <Field
      name="organisation"
      style={{ display: "flex", flexDirection: "column", gap: 6, width: 300 }}
    >
      <FieldLabel>Organisation name</FieldLabel>
      <FieldControl
        placeholder="Acme Industries"
        className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-sm shadow-sm placeholder:text-fg-subtle"
      />
    </Field>
  );
}

export function WithDescription() {
  return (
    <Field
      name="display-name"
      style={{ display: "flex", flexDirection: "column", gap: 6, width: 300 }}
    >
      <FieldLabel>Display name</FieldLabel>
      <FieldControl
        defaultValue="Eleanor Whitfield"
        className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-sm shadow-sm placeholder:text-fg-subtle"
      />
      <FieldDescription>
        This is how your name will appear to other members of the organisation.
      </FieldDescription>
    </Field>
  );
}

export function WithError() {
  return (
    <Field
      name="email"
      style={{ display: "flex", flexDirection: "column", gap: 6, width: 300 }}
    >
      <FieldLabel>Email address</FieldLabel>
      <FieldControl
        defaultValue="not-an-email"
        className="flex h-9 w-full rounded-md border border-danger bg-surface px-3 py-1 text-sm shadow-sm placeholder:text-fg-subtle"
      />
      <FieldError match>Please enter a valid email address.</FieldError>
    </Field>
  );
}

export function Disabled() {
  return (
    <Field
      name="reference"
      disabled
      style={{ display: "flex", flexDirection: "column", gap: 6, width: 300 }}
    >
      <FieldLabel>Account reference</FieldLabel>
      <FieldControl
        defaultValue="ACC-00821"
        className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-sm shadow-sm placeholder:text-fg-subtle disabled:cursor-not-allowed disabled:opacity-50"
      />
      <FieldDescription>This reference cannot be changed.</FieldDescription>
    </Field>
  );
}
