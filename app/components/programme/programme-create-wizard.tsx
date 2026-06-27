import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
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
import {
  MonthYearPicker,
  firstDayOfMonth,
  isMonthValue,
  lastDayOfMonth,
} from "~/components/month-year-picker";
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
   description; year is auto-filled). Step 2 configures the programme's intakes —
   one or more application-window + internship-period pairs. */

const detailsSchema = z.object({
  educationLevel: z.enum(EDUCATION_LEVELS, { message: "Choose an education level." }),
  title: z.string().trim().min(1, "Give the programme a title."),
});

const reviewSchema = z.object({
  confirm: z.literal(true, "Please confirm the details are correct."),
});

/** One row in the intakes step. Created through the DAL once the form submits.
   The internship period is MONTH/YEAR ("YYYY-MM"); the application window is a
   day-level date range, matching the v6 entity fields. */
type IntakeDraft = {
  applicationOpen: string;
  applicationClose: string;
  internshipStartMonth: string;
  internshipEndMonth: string;
};

const emptyIntake = (): IntakeDraft => ({
  applicationOpen: "",
  applicationClose: "",
  internshipStartMonth: "",
  internshipEndMonth: "",
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

/** Presence + ordering across every intake — an array the schema can't express. */
function validateIntakes(values: FormValues): true | string {
  const intakes = (values.intakes ?? []) as IntakeDraft[];
  if (intakes.length === 0) return "Add at least one intake.";
  for (let i = 0; i < intakes.length; i++) {
    const it = intakes[i];
    const where = intakes.length > 1 ? ` for intake ${i + 1}` : "";
    if (!it.applicationOpen || !it.applicationClose) return `Set the application window${where}.`;
    if (!isMonthValue(it.internshipStartMonth) || !isMonthValue(it.internshipEndMonth))
      return `Set the internship period${where}.`;
    if (it.applicationClose < it.applicationOpen)
      return `Applications must close on or after they open${where}.`;
    if (it.internshipEndMonth < it.internshipStartMonth)
      return `The internship must end on or after it starts${where}.`;
  }
  return true;
}

/* --------------------------------------------------------------------- Step bodies */

function DetailsStep() {
  const [educationLevel, setEducationLevel] = useFormField<string>("educationLevel");
  const [title, setTitle] = useFormField<string>("title");
  const [description, setDescription] = useFormField<string>("description");

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
        />
      </Field>
    </div>
  );
}

function IntakesStep() {
  const [intakes, setIntakes] = useFormField<IntakeDraft[]>("intakes");
  const list = intakes && intakes.length > 0 ? intakes : [emptyIntake()];

  const update = (i: number, patch: Partial<IntakeDraft>) =>
    setIntakes(list.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const add = () => setIntakes([...list, emptyIntake()]);
  const remove = (i: number) => setIntakes(list.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      {list.map((it, i) => (
        <div key={i} className="space-y-5 rounded-md border border-border p-4">
          <div className="flex items-center justify-between">
            <Text size="sm" className="font-medium">
              Intake {i + 1}
            </Text>
            {list.length > 1 ? (
              <Button variant="ghost" size="sm" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            ) : null}
          </div>

          <Field>
            <FieldLabel>Application window</FieldLabel>
            <DateRangePicker
              className="w-full"
              placeholder="Select when applications open and close"
              value={{ from: fromISO(it.applicationOpen), to: fromISO(it.applicationClose) }}
              onChange={(r) =>
                update(i, { applicationOpen: toISO(r.from), applicationClose: toISO(r.to) })
              }
            />
          </Field>

          <Field>
            <FieldLabel>Internship period</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <MonthYearPicker
                value={it.internshipStartMonth}
                onChange={(v) => update(i, { internshipStartMonth: v })}
              />
              <MonthYearPicker
                value={it.internshipEndMonth}
                onChange={(v) => update(i, { internshipEndMonth: v })}
              />
            </div>
          </Field>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4" />
        Add intake
      </Button>
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
  const intakes = (values.intakes ?? []) as IntakeDraft[];

  return (
    <div className="space-y-4">
      <dl className="divide-y divide-border rounded-md border border-border">
        <SummaryRow label="Education level" value={String(values.educationLevel ?? "")} />
        <SummaryRow label="Title" value={String(values.title ?? "")} />
        <SummaryRow label="Year" value={String(year)} />
        <SummaryRow label="Description" value={String(values.description ?? "")} />
      </dl>

      <div className="space-y-3">
        {intakes.map((it, i) => (
          <dl key={i} className="divide-y divide-border rounded-md border border-border">
            <SummaryRow
              label={`Intake ${i + 1} — applications`}
              value={`${it.applicationOpen} → ${it.applicationClose}`}
            />
            <SummaryRow
              label="Internship period"
              value={`${it.internshipStartMonth} → ${it.internshipEndMonth}`}
            />
          </dl>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="confirm" checked={Boolean(confirm)} onCheckedChange={(c) => setConfirm(c)} />
        <Label htmlFor="confirm">The details above are correct.</Label>
      </div>
      <FieldError name="confirm" />
    </div>
  );
}

/**
 * Programme-create wizard. Collects the Programme details and one or more
 * Intakes, then writes them through the data layer as the acting IO Admin.
 * Models the v6 Programme entity and references the Vercel mockup's stepper flow.
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

    const intakes = (values.intakes ?? []) as IntakeDraft[];
    for (let i = 0; i < intakes.length; i++) {
      const draft = intakes[i];
      const intake = makeIntake({
        programmeId: created.data.id,
        applicationOpen: draft.applicationOpen,
        applicationClose: draft.applicationClose,
        // Month/Year → first & last day of month (v6 storage rule).
        internshipStart: firstDayOfMonth(draft.internshipStartMonth),
        internshipEnd: lastDayOfMonth(draft.internshipEndMonth),
        createdBy: actor.id,
        createdAt: now,
      });
      const res = await intakesRepository.as(actor).create(intake);
      if (!res.ok) {
        // The programme exists; surface the intake failure but don't strand the user.
        throw new Error(
          `Programme created, but intake ${i + 1} failed — [${res.error.code}] ${res.error.message}`,
        );
      }
    }

    navigate(`/programmes/${created.data.id}`);
  }

  return (
    <MultiStepForm
      title="New programme"
      submitLabel="Create programme"
      allowStepNavigation
      initialValues={{
        educationLevel: "",
        title: "",
        description: "",
        intakes: [emptyIntake()],
        confirm: false,
      }}
      onComplete={handleComplete}
    >
      <MultiStepForm.Step id="details" title="Details" schema={detailsSchema}>
        <DetailsStep />
      </MultiStepForm.Step>

      <MultiStepForm.Step id="intakes" title="Intakes" validate={validateIntakes}>
        <IntakesStep />
      </MultiStepForm.Step>

      <MultiStepForm.Step id="review" title="Review" schema={reviewSchema}>
        <ReviewStep />
      </MultiStepForm.Step>
    </MultiStepForm>
  );
}
