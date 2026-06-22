import { Text } from "toa-project";

export function Sizes() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Text size="lg">Large — section intro text (lg)</Text>
      <Text size="md">Medium — the default body size for running prose (md)</Text>
      <Text size="sm">Small — secondary copy, captions, and helper text (sm)</Text>
      <Text size="xs">Extra small — dense metadata and timestamps (xs)</Text>
    </div>
  );
}

export function Variants() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Text variant="default">Default — primary foreground text for most content.</Text>
      <Text variant="muted">Muted — supporting copy that sits below the primary text.</Text>
      <Text variant="subtle">Subtle — the quietest tier, for hints and placeholders.</Text>
    </div>
  );
}

export function Weights() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Text weight="normal">Normal weight — the standard for body copy.</Text>
      <Text weight="medium">Medium weight — gentle emphasis within a line.</Text>
      <Text weight="semibold">Semibold weight — strong emphasis and inline labels.</Text>
    </div>
  );
}
