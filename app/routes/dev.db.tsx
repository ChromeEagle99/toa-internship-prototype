import type { ReactNode } from "react";
import { ArrowLeft, Database, Trash2 } from "lucide-react";
import { Form, Link } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import {
  ROLES,
  applicationsRepository,
  draftApplication,
  exampleProgramme,
  exampleProject,
  exampleProjectRequests,
  exampleUsers,
  programmesRepository,
  projectRequestsRepository,
  projectsRepository,
  usersRepository,
  type Actor,
  type Project,
  type Repository,
} from "~/data";
import { getFileAdapter, usePersistentBackend } from "~/data/adapters/file.server";

import type { Route } from "./+types/dev.db";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  DEV DATABASE — a throwaway admin page for the local file-backed store.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Browse every collection in the DAL, seed sample rows, and delete them — all
 *  through the real repositories (`app/data`), so the same zod validation and
 *  policy checks production code hits also run here. It runs in loaders/actions
 *  on the SERVER and persists to `.data/dev-db.json`, so data survives a
 *  dev-server restart.
 *
 *  The table is SCHEMA-AGNOSTIC: columns are derived from whatever fields the
 *  records actually have, so a new field added to a repository's zod schema
 *  shows up here automatically — no edits to this file. Every row also has a
 *  "JSON" toggle showing the complete record, including nested structures.
 *
 *  It is a dev tool: it acts as a fixed IO Admin identity (full CRUD per POLICY)
 *  and is not meant to ship. Delete this route and the file adapter when a real
 *  backend lands; the DAL stays.
 */

export function meta() {
  return [
    { title: "Dev database — PRIZM 4.0" },
    { name: "description", content: "Inspect and seed records in the local file-backed store." },
  ];
}

/** A fixed dev identity. IO Admin has full CRUD on every resource per POLICY. */
const DEV_ADMIN: Actor = { id: "dev-admin", role: ROLES.ioAdmin };

/**
 * Fixed intake windows shared between the seeded programmes and projects. A
 * project attaches to a programme by carrying that programme's `intakeId`, so
 * these ids must stay stable across both seed factories.
 */
const INTAKES = {
  "INT-UNI-2025": {
    intakeId: "INT-UNI-2025",
    intakeTitle: "2025 Main Intake",
    applicationOpen: "2025-07-01",
    applicationClose: "2025-10-31",
    internshipStart: "2025-12",
    internshipEnd: "2026-02",
    durationMonths: 3,
  },
  "INT-UNI-2026": {
    intakeId: "INT-UNI-2026",
    intakeTitle: "2026 Main Intake",
    applicationOpen: "2026-02-01",
    applicationClose: "2026-06-30",
    internshipStart: "2026-06",
    internshipEnd: "2026-08",
    durationMonths: 3,
  },
  "INT-JC-2026": {
    intakeId: "INT-JC-2026",
    intakeTitle: "2026 Main Intake",
    applicationOpen: "2026-06-15",
    applicationClose: "2026-08-31",
    internshipStart: "2026-09",
    internshipEnd: "2026-11",
    durationMonths: 3,
  },
  "INT-PJC-2026": {
    intakeId: "INT-PJC-2026",
    intakeTitle: "2026 Main Intake",
    applicationOpen: "2026-07-01",
    applicationClose: "2026-09-15",
    internshipStart: "2026-10",
    internshipEnd: "2026-12",
    durationMonths: 3,
  },
} as const;

/**
 * Seed projects spread across the Projects list's lifecycle tabs. `reviewStatus`
 * decides the tab (pending → Pending Review, approved → Project Pool, allocated →
 * Allocated Projects); `intakeId` attaches each to a programme so the Programme
 * column populates.
 */
const SEED_PROJECTS: Partial<Project>[] = [
  // ── Pending Review ──
  {
    projectId: "proj-rf-signal",
    projectTitle: "RF Signal Propagation Modelling",
    pcCode: "SECC",
    educationLevel: "University (Undergraduate)",
    placement: 2,
    mentorName: "Assoc Prof Rajesh Kumar",
    mentorEmail: "rajesh.kumar@secc.org.sg",
    mentorDesignation: "Principal Research Engineer",
    reviewStatus: "pending",
    intakeId: "INT-UNI-2026",
  },
  {
    projectId: "proj-data-analytics",
    projectTitle: "Data Analytics Dashboard for Operations",
    pcCode: "EDS",
    educationLevel: "Junior College",
    placement: 2,
    mentorName: "Michael Lim",
    mentorEmail: "michael.lim@eds.org.sg",
    mentorDesignation: "Principal Cybersecurity Engineer",
    reviewStatus: "pending",
    intakeId: "INT-JC-2026",
  },
  {
    projectId: "proj-rf-frequency",
    projectTitle: "RF Frequency Planning Tool",
    pcCode: "SECC",
    educationLevel: "Post-JC / Post-Poly",
    placement: 1,
    mentorName: "Grace Ho",
    mentorEmail: "grace.ho@secc.org.sg",
    mentorDesignation: "Systems Engineer",
    reviewStatus: "pending",
    intakeId: "INT-PJC-2026",
  },
  // ── Project Pool (approved, awaiting allocation) ──
  {
    projectId: "proj-autonomous-nav",
    projectTitle: "Autonomous Navigation Stack",
    pcCode: "SECC",
    educationLevel: "University (Undergraduate)",
    placement: 3,
    mentorName: "Dr Tan Wei Ming",
    mentorEmail: "weiming.tan@secc.org.sg",
    mentorDesignation: "Senior Robotics Engineer",
    reviewStatus: "approved",
    intakeId: "INT-UNI-2026",
  },
  {
    projectId: "proj-threat-intel",
    projectTitle: "Threat Intelligence Pipeline",
    pcCode: "EDS",
    educationLevel: "University (Undergraduate)",
    placement: 2,
    mentorName: "Nurul Aisyah",
    mentorEmail: "nurul.aisyah@eds.org.sg",
    mentorDesignation: "Lead Cybersecurity Analyst",
    reviewStatus: "approved",
    intakeId: "INT-UNI-2026",
  },
  // ── Allocated Projects ──
  {
    projectId: "proj-sensor-fusion",
    projectTitle: "Sensor Fusion Prototype",
    pcCode: "SECC",
    educationLevel: "University (Undergraduate)",
    placement: 2,
    mentorName: "Dr Lim Wei",
    mentorEmail: "wei.lim@secc.org.sg",
    mentorDesignation: "Principal Member of Technical Staff",
    reviewStatus: "allocated",
    intakeId: "INT-UNI-2026",
  },
  {
    projectId: "proj-secure-comms",
    projectTitle: "Secure Comms Gateway",
    pcCode: "EDS",
    educationLevel: "Junior College",
    placement: 1,
    mentorName: "Kenneth Wong",
    mentorEmail: "kenneth.wong@eds.org.sg",
    mentorDesignation: "Senior Network Engineer",
    reviewStatus: "allocated",
    intakeId: "INT-JC-2026",
  },
  {
    projectId: "proj-ml-anomaly",
    projectTitle: "ML Anomaly Detection",
    pcCode: "EDS",
    educationLevel: "Post-JC / Post-Poly",
    placement: 2,
    mentorName: "Priya Subramaniam",
    mentorEmail: "priya.s@eds.org.sg",
    mentorDesignation: "Data Scientist",
    reviewStatus: "allocated",
    intakeId: "INT-PJC-2026",
  },
];

/** One browsable table: its repository and a seed factory. Columns are derived. */
interface CollectionConfig {
  key: string;
  label: string;
  repo: Repository<any>;
  /**
   * The record's primary-key field. Row keys and the Delete action target it —
   * it must match the repository's `identify` (e.g. "projectId", "requestId"),
   * since not every entity uses a plain "id".
   */
  pk: string;
  /** Build the sample rows added by "Seed sample". */
  seed: () => any[];
}

const COLLECTIONS: CollectionConfig[] = [
  {
    key: "programmes",
    label: "Programmes",
    repo: programmesRepository,
    pk: "programmeId",
    // Friendly PKs (PROG-xxxx) and fixed intake ids so the Projects below can
    // attach to them — the Projects list resolves each project's programme via
    // its `intakeId` matching one of these intake windows.
    seed: () => [
      exampleProgramme({
        programmeId: "PROG-0007",
        programmeTitle: "University Internship 2025",
        educationLevel: "University (Undergraduate)",
        status: "Completed",
        applicationsCount: 1,
        intakeWindows: [INTAKES["INT-UNI-2025"]],
      }),
      exampleProgramme({
        programmeId: "PROG-0009",
        programmeTitle: "University Internship 2026",
        educationLevel: "University (Undergraduate)",
        status: "Active",
        applicationsCount: 41,
        intakeWindows: [INTAKES["INT-UNI-2026"]],
      }),
      exampleProgramme({
        programmeId: "PROG-0010",
        programmeTitle: "Junior College Internship 2026",
        educationLevel: "Junior College",
        status: "Active",
        applicationsCount: 0,
        intakeWindows: [INTAKES["INT-JC-2026"]],
      }),
      exampleProgramme({
        programmeId: "PROG-0011",
        programmeTitle: "Post-JC / Post-Poly Internship 2026",
        educationLevel: "Post-JC / Post-Poly",
        status: "Active",
        applicationsCount: 5,
        intakeWindows: [INTAKES["INT-PJC-2026"]],
      }),
    ],
  },
  {
    key: "projects",
    label: "Projects",
    repo: projectsRepository,
    pk: "projectId",
    // A spread across the lifecycle tabs (Pending Review / Project Pool /
    // Allocated), each attached to a programme intake so the Programme column
    // populates. `reviewStatus` drives which tab a row lands in.
    seed: () => SEED_PROJECTS.map((overrides) => exampleProject(overrides)),
  },
  {
    key: "applications",
    label: "Applications",
    repo: applicationsRepository,
    pk: "id",
    seed: () => {
      const stamp = new Date().toISOString();
      return [
        draftApplication({ applicantId: "applicant-alice", fullName: "Alice Tan", createdAt: stamp }),
        draftApplication({ applicantId: "applicant-bob", fullName: "Bob Lim", createdAt: stamp }),
      ];
    },
  },
  {
    key: "project-requests",
    label: "Project requests",
    repo: projectRequestsRepository,
    pk: "requestId",
    // The requests an IO has sent to Programme Centres — the rows the
    // /project-requests table renders (mapped from these entities).
    seed: () => exampleProjectRequests(),
  },
  {
    key: "users",
    label: "Users",
    repo: usersRepository,
    pk: "id",
    // The identities the "act as" switcher and login pickers offer. NOTE: the
    // act-as/login loaders auto-seed these if the collection is empty, so a Clear
    // here is undone on the next visit — Seed/Delete to change the set.
    seed: () => exampleUsers(),
  },
];

function collectionFor(key: string | null): CollectionConfig {
  return COLLECTIONS.find((c) => c.key === key) ?? COLLECTIONS[0];
}

// ── Generic, schema-agnostic rendering ───────────────────────────────────────

/** Keys shown first when present, so the table stays scannable. The rest follow. */
const PRIORITY_KEYS = [
  "id",
  "programmeId",
  "projectId",
  "title",
  "programmeTitle",
  "projectTitle",
  "fullName",
  "name",
  "status",
  "reviewStatus",
];

/** Primary-key columns get monospaced, muted treatment. */
const ID_KEYS = ["id", "programmeId", "projectId"];

function isPrimitive(value: unknown): boolean {
  return value === null || (typeof value !== "object" && typeof value !== "function");
}

/** The union of every record's top-level keys, priority keys first. */
function deriveColumns(records: Record<string, unknown>[]): string[] {
  const keys: string[] = [];
  for (const record of records) {
    for (const key of Object.keys(record)) {
      if (!keys.includes(key)) keys.push(key);
    }
  }
  return keys.sort((a, b) => {
    const ra = PRIORITY_KEYS.indexOf(a);
    const rb = PRIORITY_KEYS.indexOf(b);
    if (ra !== -1 || rb !== -1) return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb);
    return keys.indexOf(a) - keys.indexOf(b); // preserve first-seen order
  });
}

/** Render a single cell value compactly; nested data is summarised, full in JSON. */
function renderCell(key: string, value: unknown): ReactNode {
  if (value === undefined || value === null) return <span className="text-fg-muted">—</span>;
  if ((key === "status" || key === "reviewStatus") && typeof value === "string")
    return <Badge variant="subtle">{value}</Badge>;
  if (ID_KEYS.includes(key)) return <span className="font-mono text-xs text-fg-muted">{String(value)}</span>;
  if (Array.isArray(value)) {
    return value.every(isPrimitive) ? (
      value.join(", ") || <span className="text-fg-muted">—</span>
    ) : (
      <span className="text-fg-muted">[{value.length}]</span>
    );
  }
  if (typeof value === "object") return <span className="text-fg-muted">{"{…}"}</span>;
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

export async function loader({ request }: Route.LoaderArgs) {
  usePersistentBackend();
  const url = new URL(request.url);
  const collection = collectionFor(url.searchParams.get("c"));

  // Valid records (parsed + authorised) come through the repository...
  const res = await collection.repo.as(DEV_ADMIN).list();
  // ...while the raw adapter count tells us if any rows were silently dropped
  // because they no longer match the schema (e.g. after you add a field).
  const raw = await getFileAdapter().list(collection.key);

  return {
    collectionKey: collection.key,
    records: (res.ok ? res.data : []) as Record<string, unknown>[],
    rawCount: raw.length,
    error: res.ok ? null : `[${res.error.code}] ${res.error.message}`,
  };
}

export async function action({ request }: Route.ActionArgs) {
  usePersistentBackend();
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const collection = collectionFor(String(form.get("collection") ?? ""));
  const repo = collection.repo.as(DEV_ADMIN);

  switch (intent) {
    case "seed": {
      const rows = collection.seed();
      for (const row of rows) await repo.create(row);
      return { feedback: { kind: "ok" as const, message: `Seeded ${rows.length} ${collection.label.toLowerCase()}.` } };
    }
    case "delete": {
      const res = await repo.remove(String(form.get("id") ?? ""));
      return res.ok
        ? { feedback: { kind: "ok" as const, message: "Record deleted." } }
        : { feedback: { kind: "error" as const, message: `[${res.error.code}] ${res.error.message}` } };
    }
    case "clear": {
      // Clear the raw collection, so rows hidden by schema drift are removed too.
      await getFileAdapter().clear(collection.key);
      return { feedback: { kind: "ok" as const, message: `Cleared ${collection.label.toLowerCase()}.` } };
    }
    default:
      return { feedback: { kind: "error" as const, message: `Unknown action “${intent}”.` } };
  }
}

export default function DevDatabase({ loaderData, actionData }: Route.ComponentProps) {
  const { collectionKey, records, rawCount, error } = loaderData;
  const collection = collectionFor(collectionKey);
  const feedback = actionData?.feedback ?? null;
  const columns = deriveColumns(records);
  const hidden = rawCount - records.length;

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <Heading as="h1" size="2xl">
              Dev database
            </Heading>
            <Text size="sm" variant="muted" className="mt-0.5">
              The local file-backed store — persists to <code>.data/dev-db.json</code> across restarts.
            </Text>
          </div>
          <Badge variant="subtle">
            <Database className="size-3.5" />
            file backend
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <Link to="/playground" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeft />
          Back to playground
        </Link>

        <Text size="sm" variant="muted">
          Every row goes through the real repository in <code>app/data</code> as a fixed IO Admin
          identity, so reads and writes are validated with zod and authorised against the policy.
          Columns are derived from the records themselves — add a field to a schema and it appears
          here automatically. Use the <strong>JSON</strong> toggle on a row to see the full record.
        </Text>

        {/* Collection switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.key}
              to={`?c=${c.key}`}
              className={cn(
                buttonVariants({ variant: c.key === collection.key ? "solid" : "outline", size: "sm" }),
              )}
            >
              {c.label}
            </Link>
          ))}
        </div>

        {feedback ? (
          <Alert variant={feedback.kind === "ok" ? "success" : "danger"}>
            <AlertTitle>{feedback.kind === "ok" ? "Done" : "Operation blocked"}</AlertTitle>
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="danger">
            <AlertTitle>Could not read the store</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {hidden > 0 ? (
          <Alert variant="warning">
            <AlertTitle>
              {hidden} stored {hidden === 1 ? "record is" : "records are"} hidden by schema validation
            </AlertTitle>
            <AlertDescription>
              {rawCount} {hidden === 1 ? "row" : "rows"} are in the file but only {records.length} match
              the current <code>{collection.label}</code> schema — the rest fail zod validation (usually
              after you add or tighten a field). Re-seed, or <strong>Clear</strong> and seed again, to
              refresh them.
            </AlertDescription>
          </Alert>
        ) : null}

        <Separator />

        {/* Maintenance for the current collection */}
        <div className="flex flex-wrap items-center gap-3">
          <Form method="post">
            <input type="hidden" name="intent" value="seed" />
            <input type="hidden" name="collection" value={collection.key} />
            <Button type="submit" variant="outline" size="sm">
              <Database />
              Seed sample {collection.label.toLowerCase()}
            </Button>
          </Form>
          <Form method="post">
            <input type="hidden" name="intent" value="clear" />
            <input type="hidden" name="collection" value={collection.key} />
            <Button type="submit" variant="ghost" size="sm">
              <Trash2 />
              Clear {collection.label.toLowerCase()}
            </Button>
          </Form>
          <Text size="xs" variant="muted">
            {records.length} record{records.length === 1 ? "" : "s"} shown
            {hidden > 0 ? ` · ${hidden} hidden` : ""}
          </Text>
        </div>

        {/* The current collection's records — columns derived from the data */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((key) => (
                  <TableHead key={key}>{key}</TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1}>
                    <Text size="sm" variant="muted">
                      No {collection.label.toLowerCase()} stored. Use “Seed sample” above to add some.
                    </Text>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={String(record[collection.pk])}>
                    {columns.map((key) => (
                      <TableCell key={key} className="align-top">
                        {renderCell(key, record[key])}
                      </TableCell>
                    ))}
                    <TableCell className="text-right align-top">
                      <div className="flex items-center justify-end gap-3">
                        <details className="text-left">
                          <summary className="cursor-pointer text-xs text-accent">JSON</summary>
                          <pre className="mt-2 max-h-80 max-w-md overflow-auto rounded-md border border-border bg-surface p-3 text-left text-xs">
                            {JSON.stringify(record, null, 2)}
                          </pre>
                        </details>
                        <Form method="post" className="inline">
                          <input type="hidden" name="intent" value="delete" />
                          <input type="hidden" name="collection" value={collection.key} />
                          <input type="hidden" name="id" value={String(record[collection.pk])} />
                          <Button type="submit" variant="ghost" size="sm">
                            <Trash2 />
                            Delete
                          </Button>
                        </Form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
