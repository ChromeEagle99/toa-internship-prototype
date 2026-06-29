import { FolderGit2, ListChecks, Plus, Trash2 } from "lucide-react";
import { isRouteErrorResponse, Link, useNavigate, useRouteError } from "react-router";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { ToastProvider, toast } from "@/components/ui/toast";

import {
  FieldError,
  MultiStepForm,
  useFormData,
  useFormField,
  useStepper,
  type FormValues,
} from "~/components/multi-step-form";
import { DateRangePicker, formatRange, type DateRange } from "~/components/date-range-picker";
import { Shell } from "~/components/shell";
import { requireCan } from "~/auth/current-user.server";
import { ROLE_LABELS, resolveUser } from "~/data";

import type { Route } from "./+types/programmes.new";

/**
 * Create Programme — a placeholder multi-step wizard for `/programmes/new`.
 *
 * Mirrors the five-step flow from the design (Details → Eligibility → Intake →
 * Projects → Review). The complex builders (eligibility criteria, project
 * assignment) are stubbed as empty-states for now; the Details and Intake steps
 * are wired to the shared `MultiStepForm`. The Intake window deliberately uses a
 * simple `DateRangePicker` rather than the programme schema's per-intake dates —
 * the model isn't final, so this keeps the prototype honest about being a draft.
 */

export function meta() {
  return [{ title: "Create Programme — Talent Outreach & Acquisition" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const actor = await requireCan(request, "create", "programmes");
  const user = await resolveUser(actor.id);

  return {
    actor,
    user: {
      name: user?.name ?? ROLE_LABELS[actor.role],
      email: user?.email,
    },
  };
}

/** The education levels offered, as shown in the design. */
const EDUCATION_LEVELS = [
  "Junior College",
  "Post Junior College / Post Polytechnic",
  "Polytechnic",
  "University",
  "Young Defence Scientists Programme (YDSP)",
] as const;

const detailsSchema = z.object({
  title: z.string().trim().min(1, "Please enter a programme title."),
  educationLevel: z.string().min(1, "Please choose an education level."),
});

/** One intake: an application window and the internship period it feeds. */
interface Intake {
  applicationWindow: DateRange;
  internshipPeriod: DateRange;
}

const emptyIntake = (): Intake => ({ applicationWindow: {}, internshipPeriod: {} });

const dateRangeSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
});

const intakeSchema = z.object({
  intakes: z
    .array(z.object({ applicationWindow: dateRangeSchema, internshipPeriod: dateRangeSchema }))
    .min(1)
    .refine(
      (arr) => arr.every((it) => it.applicationWindow.from && it.applicationWindow.to),
      "Please set an application open and close date for every intake.",
    ),
});

/** The active step's title rendered as a large heading inside the card body. */
function StepHeading() {
  const { steps, current } = useStepper();
  return (
    <Heading as="h2" size="2xl" className="mb-6">
      {steps[current]?.title}
    </Heading>
  );
}

// ── Step 1: Programme Details ────────────────────────────────────────────────

function DetailsStep() {
  const [title, setTitle] = useFormField<string>("title");
  const [educationLevel, setEducationLevel] = useFormField<string>("educationLevel");
  const [description, setDescription] = useFormField<string>("description");

  return (
    <div className="space-y-6">
      <StepHeading />
      <Field>
        <FieldLabel>
          Programme Title <span className="text-danger">*</span>
        </FieldLabel>
        <Input
          value={title ?? ""}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. UG Intern 2027"
        />
        <FieldError name="title" />
      </Field>

      <div className="space-y-2">
        <Label>
          Education Level <span className="text-danger">*</span>
        </Label>
        <RadioGroup
          value={educationLevel ?? ""}
          onValueChange={(v) => setEducationLevel(v as string)}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {EDUCATION_LEVELS.map((level) => (
            <div key={level} className="flex items-center gap-2">
              <RadioGroupItem id={`edu-${level}`} value={level} />
              <Label htmlFor={`edu-${level}`} className="font-normal">
                {level}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <FieldError name="educationLevel" />
      </div>

      <Field>
        <FieldLabel>Programme Description</FieldLabel>
        <Textarea
          rows={5}
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Briefly describe the programme…"
        />
        <FieldDescription>Optional. A short summary applicants will see.</FieldDescription>
      </Field>
    </div>
  );
}

// ── Step 2: Eligibility Criteria (placeholder) ───────────────────────────────

function EligibilityStep() {
  return (
    <div>
      <StepHeading />
      <EmptyState
        icon={<ListChecks className="size-6" />}
        title="Criteria builder coming soon"
        description="The eligibility rule builder (citizenship, education, subject grades, score thresholds) will live here. Skip ahead for now."
      />
    </div>
  );
}

// ── Step 3: Intake Windows ───────────────────────────────────────────────────

/** Small uppercase section label inside an intake card. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      as="p"
      size="xs"
      variant="subtle"
      weight="semibold"
      className="uppercase tracking-wide"
    >
      {children}
    </Text>
  );
}

function IntakeStep() {
  const [intakes, setIntakes] = useFormField<Intake[]>("intakes");
  const list = intakes ?? [];

  function patchIntake(index: number, patch: Partial<Intake>) {
    setIntakes(list.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function addIntake() {
    setIntakes([...list, emptyIntake()]);
  }

  function removeIntake(index: number) {
    setIntakes(list.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-5">
      <StepHeading />
      <Text size="sm" variant="muted">
        Each intake has its own application window and internship period. Add as many as the
        programme runs.
      </Text>

      {list.map((intake, index) => (
        <div key={index} className="space-y-5 rounded-lg border border-border p-5">
          <div className="flex items-center justify-between">
            <Heading as="h3" size="md">
              Intake {index + 1}
            </Heading>
            {list.length > 1 ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-fg-muted hover:text-danger"
                onClick={() => removeIntake(index)}
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <SectionLabel>Application window</SectionLabel>
              <Field>
                <FieldLabel>
                  Open &amp; close dates <span className="text-danger">*</span>
                </FieldLabel>
                <DateRangePicker
                  value={intake.applicationWindow}
                  onChange={(range) => patchIntake(index, { applicationWindow: range })}
                  placeholder="Pick open and close dates"
                  className="w-full"
                />
                <FieldDescription>When applicants can submit.</FieldDescription>
              </Field>
            </div>

            <div className="space-y-2">
              <SectionLabel>Internship period</SectionLabel>
              <Field>
                <FieldLabel>Start &amp; end dates</FieldLabel>
                <DateRangePicker
                  value={intake.internshipPeriod}
                  onChange={(range) => patchIntake(index, { internshipPeriod: range })}
                  placeholder="Pick start and end dates"
                  className="w-full"
                />
                <FieldDescription>When the internship runs.</FieldDescription>
              </Field>
            </div>
          </div>
        </div>
      ))}

      <Button variant="ghost" className="text-accent hover:text-accent" onClick={addIntake}>
        <Plus className="size-4" />
        Add another intake
      </Button>
    </div>
  );
}

// ── Step 4: Attach Projects (placeholder) ────────────────────────────────────

function ProjectsStep() {
  return (
    <div>
      <StepHeading />
      <EmptyState
        icon={<FolderGit2 className="size-6" />}
        title="Project assignment coming soon"
        description="Once intake periods are set, you'll allocate projects from the pool to each intake window here."
      />
    </div>
  );
}

// ── Step 5: Review and Confirm ───────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-4 px-4 py-3">
      <dt className="text-sm text-fg-muted">{label}</dt>
      <dd className="col-span-2 text-sm font-medium text-fg">{value || "—"}</dd>
    </div>
  );
}

/** "21 Jun 2026 – 28 Jun 2026" or "—" for an optional range. */
function rangeText(range?: DateRange) {
  return range?.from ? formatRange(range, "—") : "—";
}

function ReviewStep() {
  const values = useFormData((v) => v);
  const intakes = (values.intakes as Intake[] | undefined) ?? [];

  return (
    <div className="space-y-4">
      <StepHeading />
      <Text size="sm" variant="muted">
        Review the programme details before creating it.
      </Text>
      <dl className="divide-y divide-border rounded-md border border-border">
        <SummaryRow label="Programme Title" value={String(values.title ?? "")} />
        <SummaryRow label="Education Level" value={String(values.educationLevel ?? "")} />
        {intakes.map((intake, index) => (
          <SummaryRow
            key={index}
            label={`Intake ${index + 1}`}
            value={`Apply ${rangeText(intake.applicationWindow)} · Internship ${rangeText(
              intake.internshipPeriod,
            )}`}
          />
        ))}
        <SummaryRow label="Description" value={String(values.description ?? "")} />
      </dl>
    </div>
  );
}

// ── Wizard ───────────────────────────────────────────────────────────────────

function CreateProgrammeWizard() {
  const navigate = useNavigate();

  async function handleComplete(values: FormValues) {
    // Placeholder: persistence isn't wired up yet — log and return to the list.
    // eslint-disable-next-line no-console
    console.log("Create programme (placeholder):", values);
    toast.add({
      title: "Programme created",
      description: "This is a placeholder — nothing was persisted yet.",
      type: "success",
    });
    await new Promise((resolve) => setTimeout(resolve, 600));
    navigate("/programmes");
  }

  return (
    <MultiStepForm
      submitLabel="Create Programme"
      allowStepNavigation
      initialValues={{
        title: "",
        educationLevel: "",
        description: "",
        intakes: [emptyIntake()],
      }}
      onComplete={handleComplete}
    >
      <MultiStepForm.Step
        id="details"
        title="Programme Details"
        description="Title & level"
        schema={detailsSchema}
      >
        <DetailsStep />
      </MultiStepForm.Step>

      <MultiStepForm.Step
        id="eligibility"
        title="Eligibility Criteria"
        description="Who can apply"
      >
        <EligibilityStep />
      </MultiStepForm.Step>

      <MultiStepForm.Step
        id="intake"
        title="Intake Windows"
        description="Application dates"
        schema={intakeSchema}
      >
        <IntakeStep />
      </MultiStepForm.Step>

      <MultiStepForm.Step id="projects" title="Attach Projects" description="Allocate projects">
        <ProjectsStep />
      </MultiStepForm.Step>

      <MultiStepForm.Step id="review" title="Review and Confirm" description="Confirm">
        <ReviewStep />
      </MultiStepForm.Step>
    </MultiStepForm>
  );
}

export default function NewProgramme({ loaderData }: Route.ComponentProps) {
  const { actor, user } = loaderData;

  return (
    <ToastProvider>
      <Shell actor={actor} user={user} workstream="Internship">
        <div className="mb-5">
          <Text size="sm" variant="muted">
            <Link to="/programmes" className="transition-colors hover:text-fg">
              Programmes
            </Link>{" "}
            / <span className="text-fg">Create Programme</span>
          </Text>
        </div>
        <CreateProgrammeWizard />
      </Shell>
    </ToastProvider>
  );
}

/** Renders the 403 from `requireCan` as a clear "access denied" screen. */
export function ErrorBoundary() {
  const error = useRouteError();
  const is403 = isRouteErrorResponse(error) && error.status === 403;

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 px-6">
      <Alert variant="danger">
        <AlertTitle>{is403 ? "Access denied" : "Something went wrong"}</AlertTitle>
        <AlertDescription>
          {is403
            ? "Your current role isn't permitted to create programmes. Switch to a role that can (e.g. Internship Officer, IO Admin, or Director)."
            : "An unexpected error occurred loading this page."}
        </AlertDescription>
      </Alert>
      <Link to="/act-as" className={buttonVariants({ variant: "solid", size: "sm" })}>
        Switch identity
      </Link>
    </div>
  );
}
