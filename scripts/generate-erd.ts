/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ERD GENERATOR — emit a Mermaid ER diagram straight from the zod schemas.
 * ─────────────────────────────────────────────────────────────────────────────
 *  The store is a file-backed DAL, so there is no SQL to introspect — the schemas
 *  in `app/data/repositories` ARE the data model. This walks them and rewrites the
 *  generated block in `docs/data-model.md`, so the diagram can't drift from code.
 *
 *      npm run db:erd
 *
 *  It works off `z.toJSONSchema` (zod 4's stable JSON-Schema output) rather than
 *  zod internals, then renders: scalar fields → attributes, `*Id` fields → FK
 *  relationships (see FOREIGN_KEYS), and nested object/array fields → embedded
 *  relationships. To add an entity, import its schema and list it below.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import { UserSchema } from "../app/data/repositories/users";
import { ApplicationSchema } from "../app/data/repositories/applications";
import {
  ProgrammeSchema,
  CriteriaGroupSchema,
  CriteriaPathwaySchema,
  CriteriaRuleSchema,
  IntakeWindowSchema,
} from "../app/data/repositories/programmes";
import { ProjectEntrySchema, BlackoutPeriodSchema } from "../app/data/repositories/projects";

// ── Configuration: the only thing you edit when the model changes ─────────────

/** Top-level stored collections — each is its own file-backed repository. */
const COLLECTIONS = [
  { name: "User", schema: UserSchema },
  { name: "Application", schema: ApplicationSchema },
  { name: "Programme", schema: ProgrammeSchema },
  { name: "ProjectEntry", schema: ProjectEntrySchema },
] as const;

/**
 * Embedded value objects — nested JSON inside a parent record, NOT their own
 * collection. Registered with an id so they surface as named `$defs`/`$ref`s
 * instead of being inlined, which is what lets us draw them as related boxes.
 */
const EMBEDDED = [
  { name: "CriteriaGroup", schema: CriteriaGroupSchema },
  { name: "CriteriaPathway", schema: CriteriaPathwaySchema },
  { name: "CriteriaRule", schema: CriteriaRuleSchema },
  { name: "IntakeWindow", schema: IntakeWindowSchema },
  { name: "BlackoutPeriod", schema: BlackoutPeriodSchema },
] as const;

/** Foreign keys by naming convention: field name → the collection it points at. */
const FOREIGN_KEYS: Record<string, string> = {
  applicantId: "User",
  programmeId: "Programme",
};

// ── JSON-Schema helpers ───────────────────────────────────────────────────────

type JsonNode = Record<string, any>;

/** The `Name` in a `{ "$ref": "#/$defs/Name" }`, or null if the node isn't a ref. */
function refName(node: JsonNode | undefined): string | null {
  const ref = node?.$ref;
  return typeof ref === "string" ? ref.split("/").pop() ?? null : null;
}

/** A field is an embedded relationship if it's a ref, or an array of refs. */
function embeddedRef(node: JsonNode): { name: string; many: boolean } | null {
  const direct = refName(node);
  if (direct) return { name: direct, many: false };
  if (node.type === "array") {
    const item = refName(node.items);
    if (item) return { name: item, many: true };
  }
  return null;
}

/** A single Mermaid type token (no spaces/hyphens): enums and unions collapse. */
function typeToken(node: JsonNode): string {
  if (node.$ref) return refName(node) ?? "object";
  if (Array.isArray(node.enum)) return "enum";
  if (Array.isArray(node.anyOf)) return "union";
  if (node.type === "array") return `${typeToken(node.items ?? {})}[]`;
  if (node.type === "integer") return "number";
  if (typeof node.type === "string") return node.type;
  return "any";
}

/** The human note that follows a field: enum values, FK target, optionality. */
function comment(name: string, node: JsonNode, optional: boolean): string {
  const parts: string[] = [];
  const enumNode = Array.isArray(node.enum)
    ? node
    : node.type === "array" && Array.isArray(node.items?.enum)
      ? node.items
      : null;
  if (enumNode) parts.push(enumNode.enum.join(" | "));
  if (Array.isArray(node.anyOf)) parts.push(node.anyOf.map(typeToken).join(" | "));
  if (FOREIGN_KEYS[name]) parts.push(`→ ${FOREIGN_KEYS[name]}`);
  if (node.format === "email") parts.push("email");
  if (optional) parts.push("optional");
  return parts.join(", ");
}

// ── Rendering ─────────────────────────────────────────────────────────────────

interface Entity {
  name: string;
  json: JsonNode;
}
interface Relationship {
  from: string;
  to: string;
  many: boolean;
  label: string;
}

function renderEntity(entity: Entity, relationships: Relationship[]): string {
  const props: Record<string, JsonNode> = entity.json.properties ?? {};
  const required = new Set<string>(entity.json.required ?? []);
  const lines: string[] = [];

  for (const [name, node] of Object.entries(props)) {
    const embedded = embeddedRef(node);
    if (embedded) {
      // Embedded fields become relationships, not attributes.
      relationships.push({
        from: entity.name,
        to: embedded.name,
        many: embedded.many,
        label: `${name}${embedded.many ? "[]" : ""} (embedded)`,
      });
      continue;
    }
    const optional = !required.has(name);
    const key = name === "id" ? " PK" : FOREIGN_KEYS[name] ? " FK" : "";
    const note = comment(name, node, optional);
    const quoted = note ? ` "${note}"` : "";
    lines.push(`        ${typeToken(node)} ${name}${key}${quoted}`);
  }

  // An entity whose every field is a relationship has no scalar attributes;
  // render a tidy empty block rather than one with a blank line inside.
  if (lines.length === 0) return `    ${entity.name} {\n    }`;
  return `    ${entity.name} {\n${lines.join("\n")}\n    }`;
}

function renderRelationship(rel: Relationship): string {
  const card = rel.many ? "||--o{" : "||--||";
  return `    ${rel.from} ${card} ${rel.to} : "${rel.label}"`;
}

function buildDiagram(): string {
  // Register embedded schemas so references to them stay named in the output.
  const registry = z.registry<{ id: string }>();
  for (const e of EMBEDDED) registry.add(e.schema, { id: e.name });

  const opts = { metadata: registry as any, unrepresentable: "any" as const };

  // Convert every collection; merge the $defs each one pulls in (the embedded
  // value objects). A union across all collections covers every embedded type.
  const defs: Record<string, JsonNode> = {};
  const collectionEntities: Entity[] = COLLECTIONS.map((c) => {
    const json = z.toJSONSchema(c.schema, opts) as JsonNode;
    Object.assign(defs, json.$defs ?? {});
    return { name: c.name, json };
  });

  // Keep embedded entities in declared order, only those actually referenced.
  const embeddedEntities: Entity[] = EMBEDDED.filter((e) => defs[e.name]).map((e) => ({
    name: e.name,
    json: defs[e.name],
  }));

  const entities = [...collectionEntities, ...embeddedEntities];

  // First pass: FK relationships (a *Id field pointing at another collection).
  const relationships: Relationship[] = [];
  for (const c of collectionEntities) {
    const props: Record<string, JsonNode> = c.json.properties ?? {};
    for (const field of Object.keys(props)) {
      const target = FOREIGN_KEYS[field];
      if (target) relationships.push({ from: target, to: c.name, many: true, label: field });
    }
  }

  // Second pass: entity boxes (which also push their embedded relationships).
  const boxes = entities.map((e) => renderEntity(e, relationships));

  const body = [...relationships.map(renderRelationship), "", ...boxes].join("\n");
  return "erDiagram\n" + body;
}

// ── Markdown rewrite ──────────────────────────────────────────────────────────

const START = "<!-- ERD:START (generated by scripts/generate-erd.ts — run `npm run db:erd`) -->";
const END = "<!-- ERD:END -->";

const FOOTER = `## Notes

- **\`programmeId\` and \`pc\` are soft links.** They're plain \`string\` ids with no
  referential integrity enforced by the store — the relationship is by convention.
- **\`pc\` (Programme Centre) is a string today**, not its own entity. The PC models
  are deliberately deferred — see the header comment in
  [projects.ts](../app/data/repositories/projects.ts).
- **Users carry the role; the policy is code.** What each role *may do* lives in
  [access/permissions.ts](../app/data/access/permissions.ts), not in the data.
- The embedded value objects are drawn as separate boxes for clarity — they
  serialise as nested arrays inside their parent record's JSON.`;

function buildMarkdown(diagram: string): string {
  return `# Data model (ER diagram)

The store is a file-backed DAL, not a SQL database — each "table" is a zod schema in
[app/data/repositories/](../app/data/repositories/). **This file is generated** from
those schemas by [scripts/generate-erd.ts](../scripts/generate-erd.ts); don't edit the
diagram by hand — run \`npm run db:erd\` after changing a schema.

> Renders in VSCode's markdown preview, on GitHub, and at <https://mermaid.live>. It's
> plain text, so there's no runtime dependency and nothing that touches the air-gap rule.

## Entities and relationships

Solid lines with the crow's-foot (\`o{\`) are one-to-many; \`||\` is one-to-one. FK lines
join stored collections; the rest are embedded value objects (nested JSON in a parent).

${START}

\`\`\`mermaid
${diagram}
\`\`\`

${END}

${FOOTER}
`;
}

async function main() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const out = path.join(here, "..", "docs", "data-model.md");
  const diagram = buildDiagram();

  let contents: string;
  try {
    const existing = await fs.readFile(out, "utf8");
    const startIdx = existing.indexOf(START);
    const endIdx = existing.indexOf(END);
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      // Replace only the generated block, preserving any hand-edited prose.
      const before = existing.slice(0, startIdx);
      const after = existing.slice(endIdx + END.length);
      contents = `${before}${START}\n\n\`\`\`mermaid\n${diagram}\n\`\`\`\n\n${END}${after}`;
    } else {
      contents = buildMarkdown(diagram);
    }
  } catch {
    contents = buildMarkdown(diagram);
  }

  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, contents, "utf8");
  console.log(`Wrote ${path.relative(path.join(here, ".."), out)} (${COLLECTIONS.length} collections, ${EMBEDDED.length} embedded types).`);
}

main().catch((error) => {
  console.error("ERD generation failed:", error);
  process.exit(1);
});
