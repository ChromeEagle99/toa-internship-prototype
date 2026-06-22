import { Separator, Text, Heading } from "toa-project";

export function Horizontal() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 360 }}>
      <div>
        <Heading as="h3" size="lg">
          Workspace settings
        </Heading>
        <Text size="sm" variant="muted">
          Manage members, billing and integrations.
        </Text>
      </div>
      <Separator />
      <Text size="sm" variant="muted">
        Changes are saved automatically and apply across your organisation.
      </Text>
    </div>
  );
}

export function Vertical() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, height: 32 }}>
      <Text size="sm">Profile</Text>
      <Separator orientation="vertical" />
      <Text size="sm">Notifications</Text>
      <Separator orientation="vertical" />
      <Text size="sm">Security</Text>
    </div>
  );
}
