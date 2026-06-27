import { useNavigate } from "react-router";
import { z } from "zod";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";

import {
  FieldError,
  MultiStepForm,
  useFormData,
  useFormField,
  type FormValues,
} from "~/components/multi-step-form";
import { DateRangePicker } from "~/components/date-range-picker";
import { useActor } from "~/context/actor-context";
import {
  EDUCATION_LEVELS,
  intakesRepository,
  makeIntake,
  makeProgramme,
  programmesRepository,
} from "~/data";

/* ----------------------------------------------------------------- Per-step schemas
   One zod schema per step, describing just the fields that step owns. Mirrors
   the Programme entity from the v6 prototype (education level, title,
   description; year is auto-filled) and the mockup's "Window & Capacity" step
   (the programme's first intake). Eligibility and project attachment are later
   steps — added once those features land. */

const detailsSchema = z.object({
  educationLevel: z.enum(EDUCATION_LEVELS, { message: "Choose an education level." }),
  title: z.string().trim().min(1, "Give the programme a title."),
});

const intakeSchema = z.object({
  applicationOpen: z.string().min(1, "Set when applications open."),
  applicationClose: z.string().min(1, "Set when applications close."),
  internshipStart: z.string().min(1, "Set the internship start."),
  internshipEnd: z.string().min(1, "Set the internship end."),
});

const reviewSchema = z.object({
  confirm: z.literal(true, "Please confirm the details are correct."),
});

/** ISO date (yyyy-mm-dd) ↔ Date, kept local so the calendar day never shifts. */
function toISO(d?: Date): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function fromISO(s?: string): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/** Date ordering the schema can't express cleanly (cross-field). */
function validateIntakeDates(values: FormValues): true | string {
  const open = String(values.applicationOpen ?? "");
  const close = String(values.applicationClose ?? "");
  const start = String(values.internshipStart ?? "");
  const end = String(values.internshipEnd ?? "");
  if (close < open) return "Applications must close on or after they open.";
  if (end < start) return "The internship must end on or after it starts.";
  return true;
}

/* --------------------------------------------------------------------- Step bodies */

function DetailsStep() {
  const [educationLevel, setEducationLevel] = useFormField<string>("educationLevel");
  const [title, setTitle] = useFormField<string>("title");
  const [description, setDescription] = useFormField<string>("description");
  const year = new Date().getFullYear();

  return (
    <div className="space-y-5">
      <Field>
        <FieldLabel>Education level</FieldLabel>
        <Select value={educationLevel ?? ""} onValueChange={(v) => setEducationLevel(v as string)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an education level" />
          </SelectTrigger>
          <SelectContent>
            {EDUCATION_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>Intakes inherit this level; only matching projects can attach.</FieldDescription>
        <FieldError name="educationLevel" />
      </Field>

      <Field>
        <FieldLabel>Programme title</FieldLabel>
        <Input
          value={title ?? ""}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. University 2026"
        />
        <FieldError name="title" />
      </Field>

      <Field>
        <FieldLabel>Description</FieldLabel>
        <Textarea
          rows={3}
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional — a short summary of this cohort."
        />
      </Field>

      <Text size="xs" variant="muted">
        Year is auto-filled as <span className="font-medium text-fg">{year}</span>. Multiple
        programmes per education level and year are allowed.
      </Text>
    </div>
  );
}

function IntakeStep() {
  const [applicationOpen, setApplicationOpen] = useFormField<string>("applicationOpen");
  const [applicationClose, setApplicationClose] = useFormField<string>("applicationClose");
  const [internshipStart, setInternshipStart] = useFormField<string>("internshipStart");
  const [internshipEnd, setInternshipEnd] = useFormField<string>("internshipEnd");

  return (
    <div className="space-y-5">
      <Text size="sm" variant="muted">
        Every programme needs at least one intake. Set its application window and internship period —
        you can add more intakes later from the programme page.
      </Text>

      <Field>
        <FieldLabel>Application window</FieldLabel>
        <DateRangePicker
          className="w-full"
          placeholder="Select when applications open and close"
          value={{ from: fromISO(applicationOpen), to: fromISO(applicationClose) }}
          onChange={(r) => {
            setApplicationOpen(toISO(r.from));
            setApplicationClose(toISO(r.to));
          }}
        />
        <FieldError name="applicationOpen" />
        <FieldError name="applicationClose" />
      </Field>

      <Field>
        <FieldLabel>Internship period</FieldLabel>
        <DateRangePicker
          className="w-full"
          placeholder="Select the internship start and end"
          value={{ from: fromISO(internshipStart), to: fromISO(internshipEnd) }}
          onChange={(r) => {
            setInternshipStart(toISO(r.from));
            setInternshipEnd(toISO(r.to));
          }}
        />
        <FieldError name="internshipStart" />
        <FieldError name="internshipEnd" />
      </Field>
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

  return (
    <div className="space-y-4">
      <Text size="sm" variant="muted">
        Review the programme and its first intake, then create it.
      </Text>
      <dl className="divide-y divide-border rounded-md border border-border">
        <SummaryRow label="Education level" value={String(values.educationLevel ?? "")} />
        <SummaryRow label="Title" value={String(values.title ?? "")} />
        <SummaryRow label="Year" value={String(year)} />
        <SummaryRow label="Description" value={String(values.description ?? "")} />
        <SummaryRow
          label="Application window"
          value={`${String(values.applicationOpen ?? "")} → ${String(values.applicationClose ?? "")}`}
        />
        <SummaryRow
          label="Internship period"
          value={`${String(values.internshipStart ?? "")} → ${String(values.internshipEnd ?? "")}`}
        />
      </dl>
      <div className="flex items-center gap-2">
        <Checkbox id="confirm" checked={Boolean(confirm)} onCheckedChange={(c) => setConfirm(c)} />
        <Label htmlFor="confirm">The details above are correct.</Label>
      </div>
      <FieldError name="confirm" />
    </div>
  );
}

/**
 * Programme-create wizard. Collects the Programme details and its first Intake,
 * then writes both through the data layer as the acting IO Admin. Models the v6
 * Programme entity and references the Vercel mockup's stepper flow.
 */
export function ProgrammeCreateWizard() {
  const { actor } = useActor();
  const navigate = useNavigate();

  async function handleComplete(values: FormValues) {
    const now = new Date().toISOString();
    const year = new Date().getFullYear();
    const repo = programmesRepository.as(actor);

    const programme = makeProgramme({
      educationLevel: values.educationLevel as (typeof EDUCATION_LEVELS)[number],
      year,
      title: String(values.title ?? "").trim(),
      description: String(values.description ?? "").trim(),
      createdBy: actor.id,
      createdAt: now,
    });

    const created = await repo.create(programme);
    if (!created.ok) {
      throw new Error(`Could not create programme — [${created.error.code}] ${created.error.message}`);
    }

    const intake = makeIntake({
      programmeId: created.data.id,
      applicationOpen: String(values.applicationOpen),
      applicationClose: String(values.applicationClose),
      internshipStart: String(values.internshipStart),
      internshipEnd: String(values.internshipEnd),
      createdBy: actor.id,
      createdAt: now,
    });
    const intakeRes = await intakesRepository.as(actor).create(intake);
    if (!intakeRes.ok) {
      // The programme exists; surface the intake failure but don't strand the user.
      throw new Error(`Programme created, but its intake failed — [${intakeRes.error.code}] ${intakeRes.error.message}`);
    }

    navigate(`/programmes/${created.data.id}`);
  }

  return (
    <MultiStepForm
      title="New programme"
      description="Set up an internship cohort and its first intake."
      submitLabel="Create programme"
      allowStepNavigation
      initialValues={{
        educationLevel: "",
        title: "",
        description: "",
        applicationOpen: "",
        applicationClose: "",
        internshipStart: "",
        internshipEnd: "",
        confirm: false,
      }}
      onComplete={handleComplete}
    >
      <MultiStepForm.Step id="details" title="Details" description="Cohort basics" schema={detailsSchema}>
        <DetailsStep />
      </MultiStepForm.Step>

      <MultiStepForm.Step
        id="intake"
        title="First intake"
        description="Window & period"
        schema={intakeSchema}
        validate={validateIntakeDates}
      >
        <IntakeStep />
      </MultiStepForm.Step>

      <MultiStepForm.Step id="review" title="Review" description="Confirm & create" schema={reviewSchema}>
        <ReviewStep />
      </MultiStepForm.Step>
    </MultiStepForm>
  );
}
