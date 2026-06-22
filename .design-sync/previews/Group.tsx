import { Group, Button, Badge, Text } from "toa-project";

export function ButtonRow() {
  return (
    <Group gap="3">
      <Button variant="solid">Save changes</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Reset</Button>
    </Group>
  );
}

export function SpaceBetween() {
  return (
    <Group justify="between" style={{ width: 360 }}>
      <Text size="sm" weight="medium">
        Apollo Migration
      </Text>
      <Badge variant="success">Active</Badge>
    </Group>
  );
}

export function Tags() {
  return (
    <Group gap="2" wrap>
      <Badge variant="subtle">Design</Badge>
      <Badge variant="subtle">Engineering</Badge>
      <Badge variant="subtle">Research</Badge>
      <Badge variant="subtle">Operations</Badge>
    </Group>
  );
}
