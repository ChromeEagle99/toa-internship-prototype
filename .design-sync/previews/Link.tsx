import { Link, Text } from "toa-project";

export function Standalone() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Link href="#">View the full release notes</Link>
      <Link href="#">Manage your subscription</Link>
      <Link href="#">Contact our support team</Link>
    </div>
  );
}

export function Inline() {
  return (
    <Text size="md" style={{ maxWidth: 420 }}>
      Your trial ends in three days. <Link href="#">Upgrade your plan</Link> to keep
      access to advanced reporting and priority support.
    </Text>
  );
}
