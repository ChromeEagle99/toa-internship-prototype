import { useNavigate } from "react-router";
import { z } from "zod";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  FieldError,
  MultiStepForm,
  useFormData,
  useFormField,
  type FormValues,
} from "~/components/multi-step-form";
import { useActor } from "~/context/actor-context";
import {
  EDUCATION_LEVELS,
  makeProjectRequest,
  projectRequestsRepository,
  type ProjectRequestLine,
} from "~/data";

/* ----------------------------------------------------------------- Per-step schemas
   The Project Request entity (see `data/repositories/project-requests.ts`): an IO
   Admin's ask to a Programme Centre for placements, with one line per education
   level. Recipients are the PC Head (To) and AD (P&C) (CC). Year is auto-filled. */

const centreSchema = z.object({
  pcCode: z.string().trim().min(1, "Enter the Programme Centre code."),
  toRecipients: z.string().trim().min(1, "Add at least one recipient (the PC Head)."),
});

const reviewSchema = z.object({
  confirm: z.literal(true, "Please confirm the request before sending."),
});

/** Comma/semicolon/newline-separated text → a trimmed, de-duplicated email list. */
function parseRecipients(raw?: string): string[] {
  return [
    ...new Set(
      String(raw ?? "")
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
}

/** The per-level counts record → request lines, dropping levels left at zero. */
function linesFromCounts(counts: Record<string, string> | undefined): ProjectRequestLine[] {
  return EDUCATION_LEVELS.flatMap((level) => {
    const n = Number((counts ?? {})[level] ?? "");
    return Number.isInteger(n) && n > 0
      ? [{ educationLevel: level, placementsRequested: n }]
      : [];
  });
}

/** Placements can't be expressed as a flat zod field, so validate imperatively. */
function validatePlacements(values: FormValues): true | string {
  const counts = (values.counts ?? {}) as Record<string, string>;
  for (const level of EDUCATION_LEVELS) {
    const raw = counts[level];
    if (raw === undefined || raw === "") continue;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0) return `Enter a whole number of placements for ${level}.`;
  }
  if (linesFromCounts(counts).length === 0) return "Request at least one placement.";
  return true;
}

/* --------------------------------------------------------------------- Step bodies */

function CentreStep() {
  const [pcCode, setPcCode] = useFormField<string>("pcCode");
  const [toRecipients, setToRecipients] = useFormField<string>("toRecipients");
  const [ccRecipients, setCcRecipients] = useFormField<string>("ccRecipients");

  return (
    <div className="space-y-5">
      <Field>
        <FieldLabel>Programme Centre code</FieldLabel>
        <Input
          value={pcCode ?? ""}
          onChange={(e) => setPcCode(e.target.value)}
          placeholder="e.g. PC11"
        />
        <FieldError name="pcCode" />
      </Field>

      <Field>
        <FieldLabel>To — PC Head</FieldLabel>
        <Input
          type="email"
          value={toRecipients ?? ""}
          onChange={(e) => setToRecipients(e.target.value)}
          placeholder="pchead.pc11@example.gov.sg"
        />
        <FieldError name="toRecipients" />
      </Field>

      <Field>
        <FieldLabel>CC — AD (P&amp;C)</FieldLabel>
        <Input
          type="email"
          value={ccRecipients ?? ""}
          onChange={(e) => setCcRecipients(e.target.value)}
          placeholder="adpnc.lee@example.gov.sg"
        />
      </Field>
    </div>
  );
}

function PlacementsStep() {
  const [counts, setCounts] = useFormField<Record<string, string>>("counts");
  const current = counts ?? {};
  const setCount = (level: string, value: string) => setCounts({ ...current, [level]: value });

  return (
    <div className="space-y-5">
      <div className="divide-y divide-border rounded-md border border-border">
        {EDUCATION_LEVELS.map((level) => (
          <div key={level} className="flex items-center justify-between gap-4 px-4 py-3">
            <Label htmlFor={`count-${level}`} className="font-normal">
              {level}
            </Label>
            <Input
              id={`count-${level}`}
              type="number"
              min={0}
              inputMode="numeric"
              className="w-24"
              value={current[level] ?? ""}
              onChange={(e) => setCount(level, e.target.value)}
              placeholder="0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-2.5">
      <dt className="text-sm text-fg-muted">{label}</dt>
      <dd className="text-right text-sm font-medium text-fg">{value || "—"}</dd>
    </div>
  );
}

function ReviewStep() {
  const values = useFormData((v) => v);
  const [confirm, setConfirm] = useFormField<boolean>("confirm");
  const year = new Date().getFullYear();
  const lines = linesFromCounts(values.counts as Record<string, string> | undefined);
  const total = lines.reduce((sum, l) => sum + l.placementsRequested, 0);

  return (
    <div className="space-y-4">
      <dl className="divide-y divide-border rounded-md border border-border">
        <SummaryRow label="Programme Centre" value={String(values.pcCode ?? "")} />
        <SummaryRow label="Year" value={String(year)} />
        <SummaryRow label="To" value={parseRecipients(values.toRecipients as string).join(", ")} />
        <SummaryRow label="CC" value={parseRecipients(values.ccRecipients as string).join(", ")} />
        {lines.map((l) => (
          <SummaryRow
            key={l.educationLevel}
            label={l.educationLevel}
            value={`${l.placementsRequested} ${l.placementsRequested === 1 ? "placement" : "placements"}`}
          />
        ))}
        <SummaryRow label="Total placements" value={String(total)} />
      </dl>
      <div className="flex items-center gap-2">
        <Checkbox id="confirm" checked={Boolean(confirm)} onCheckedChange={(c) => setConfirm(c)} />
        <Label htmlFor="confirm">The request details above are correct.</Label>
      </div>
      <FieldError name="confirm" />
    </div>
  );
}

/**
 * Project-request wizard (IO Admin). Collects the Programme Centre, recipients,
 * and the per-level placement counts, then writes a Project Request through the
 * data layer as the acting actor. Models the v6 Project Request entity and the
 * Vercel mockup's "send request to PC" step.
 */
export function ProjectRequestWizard() {
  const { actor } = useActor();
  const navigate = useNavigate();

  async function handleComplete(values: FormValues) {
    const now = new Date().toISOString();
    const year = new Date().getFullYear();
    const lines = linesFromCounts(values.counts as Record<string, string> | undefined);

    const request = makeProjectRequest({
      pcCode: String(values.pcCode ?? "").trim(),
      toRecipients: parseRecipients(values.toRecipients as string),
      ccRecipients: parseRecipients(values.ccRecipients as string),
      lines,
      year,
      createdBy: actor.id,
      createdAt: now,
    });

    const res = await projectRequestsRepository.as(actor).create(request);
    if (!res.ok) {
      throw new Error(`Could not raise the request — [${res.error.code}] ${res.error.message}`);
    }

    navigate("/requests");
  }

  return (
    <MultiStepForm
      title="New project request"
      submitLabel="Send request"
      allowStepNavigation
      initialValues={{
        pcCode: "",
        toRecipients: "",
        ccRecipients: "",
        counts: {},
        confirm: false,
      }}
      onComplete={handleComplete}
    >
      <MultiStepForm.Step id="centre" title="Programme Centre" schema={centreSchema}>
        <CentreStep />
      </MultiStepForm.Step>

      <MultiStepForm.Step id="placements" title="Placements" validate={validatePlacements}>
        <PlacementsStep />
      </MultiStepForm.Step>

      <MultiStepForm.Step id="review" title="Review" schema={reviewSchema}>
        <ReviewStep />
      </MultiStepForm.Step>
    </MultiStepForm>
  );
}
