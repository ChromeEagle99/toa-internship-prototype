import { Heading } from "toa-project";

export function Sizes() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Heading as="h1" size="4xl">
        Annual report 2026
      </Heading>
      <Heading as="h2" size="3xl">
        Financial highlights
      </Heading>
      <Heading as="h3" size="2xl">
        Revenue by region
      </Heading>
      <Heading as="h4" size="xl">
        Customer growth
      </Heading>
      <Heading as="h5" size="lg">
        Retention metrics
      </Heading>
      <Heading as="h6" size="md">
        Notes and assumptions
      </Heading>
    </div>
  );
}

export function PageHeader() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Heading as="h1" size="3xl">
        Team members
      </Heading>
      <Heading as="h2" size="md" className="text-fg-muted">
        Manage who has access to your organisation
      </Heading>
    </div>
  );
}
