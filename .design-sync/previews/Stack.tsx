import { Stack, Heading, Text, Button, Input } from "toa-project";

export function FormColumn() {
  return (
    <Stack gap="4" style={{ width: 320 }}>
      <div>
        <Heading as="h3" size="lg">
          Invite a teammate
        </Heading>
        <Text size="sm" variant="muted">
          They will receive an email with a link to join your workspace.
        </Text>
      </div>
      <Input placeholder="name@company.co.uk" />
      <Button variant="solid">Send invitation</Button>
    </Stack>
  );
}

export function Gaps() {
  return (
    <div style={{ display: "flex", gap: 32 }}>
      <Stack gap="1">
        <Text size="sm">Tight</Text>
        <Text size="sm">spacing</Text>
        <Text size="sm">(gap 1)</Text>
      </Stack>
      <Stack gap="4">
        <Text size="sm">Default</Text>
        <Text size="sm">spacing</Text>
        <Text size="sm">(gap 4)</Text>
      </Stack>
    </div>
  );
}
