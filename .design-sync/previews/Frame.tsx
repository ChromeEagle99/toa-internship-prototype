import { Frame, Heading, Text } from "toa-project";

export function Padding() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 360 }}>
      <Frame padding="sm" maxWidth="full" className="rounded-md border border-border bg-surface">
        <Text size="sm">Small padding — compact panels and toolbars.</Text>
      </Frame>
      <Frame padding="md" maxWidth="full" className="rounded-md border border-border bg-surface">
        <Text size="sm">Medium padding — the default for most content.</Text>
      </Frame>
      <Frame padding="lg" maxWidth="full" className="rounded-md border border-border bg-surface">
        <Text size="sm">Large padding — spacious section containers.</Text>
      </Frame>
    </div>
  );
}

export function Section() {
  return (
    <Frame padding="lg" maxWidth="full" className="rounded-md border border-border bg-surface" style={{ width: 360 }}>
      <Heading as="h3" size="lg" style={{ marginBottom: 8 }}>
        Quarterly review
      </Heading>
      <Text size="sm" variant="muted">
        A consistent container that controls padding and maximum width so layouts stay
        aligned across the application.
      </Text>
    </Frame>
  );
}
