import { Fragment, useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Plus,
  Save,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

import { StepIndicator } from "~/components/multi-step-form";
import { formatMonth, type MonthValue } from "~/components/month-picker";
import { MonthRangePicker, type MonthRange } from "~/components/month-range-picker";
import { MultiSelect } from "~/components/multi-select";
import { Shell, type ShellUser } from "~/components/shell";
import { Required } from "~/components/required";
import { EDUCATION_LEVELS, type Actor } from "~/data";

/**
 * Create Project (individually) — the guided, multi-step form the AD (P&C)
 * reaches from the "Respond to a Request" landing after choosing "Create
 * individually". A self-contained view that owns its Shell chrome, like every
 * other page in this codebase.
 *
 * Prototype scope: only Step 1 (Project Details) is built out to the design.
 * Steps 2–4 are placeholders. Nothing persists yet — "Save Draft" and the final
 * submit toast and (for submit) return the AD (P&C) to the request. The AI
 * "Suggest with AI" affordances are deterministic stand-ins for a future model
 * call — enough to demonstrate the accept/edit/re-assess interaction.
 */

// ── Provisional pick-lists ───────────────────────────────────────────────────
// Mirror the design's Classification dropdowns. Swap for the real taxonomies
// (and a PC repository) once they're defined. Education levels come from `~/data`.

const PROGRAMME_CENTRES = [
  "AS",
  "CIO",
  "Cyber",
  "DH",
  "EDS",
  "Info",
  "MDS",
  "PC3",
  "PC4",
  "PC5",
  "PC6",
  "PC8",
  "PC9",
  "PC10",
  "PC11",
  "SECC",
  "STSH",
] as const;

const TECH_DOMAINS = [
  "Aerospace Engineering",
  "Application Development",
  "Armoured Vehicles and Armament Engineering",
  "Artificial Intelligence and Data Analytics",
  "Building and Protective Infrastructure",
  "Command, Control, and Communication (C3) Systems",
  "Cybersecurity",
  "Information Intelligence Systems",
  "Naval and Maritime Engineering",
  "Network and Connectivity",
  "Robotics and Autonomous Systems",
  "Sensors and Guided Weapon Systems",
  "Simulation and Immersive Technologies",
  "Sustainable Technologies and Energy Systems",
] as const;

const EMERGING_AREAS = [
  "Artificial Intelligence",
  "Cellular Networks",
  "Environmental Sustainability",
  "Extended Reality",
  "Internet of Things",
  "New Space",
  "Unmanned Aircraft Systems",
  "Unmanned Ground Vehicles",
  "Unmanned Maritime Systems",
] as const;

const DISCIPLINES = [
  "Computer Science",
  "Computer Engineering",
  "Software Engineering",
  "Information Technology",
  "Information Systems",
  "Cybersecurity",
  "Human-Computer Interaction",
  "Artificial Intelligence",
  "Data Science",
  "Electrical Engineering",
  "Electronic Engineering",
  "Mechanical Engineering",
  "Aerospace Engineering",
  "Mathematics & Statistics",
  "Physics",
] as const;

const DURATIONS = [
  "1 Month",
  "2 Months",
  "3 Months",
  "4 Months",
  "6 Months",
  "12 Months",
] as const;

const STEPS = [
  "Project Details",
  "Project Requirements",
  "Mentor Information",
  "Review and Confirm",
] as const;

/** Step metadata for the shared indicator, derived from the ordered {@link STEPS}. */
const STEP_META = STEPS.map((title) => ({ id: title, title }));

const SCOPE_LIMIT = 500;
const MENTOR_WRITEUP_LIMIT = 300;

// ── Small presentational helpers ─────────────────────────────────────────────

/** An uppercase micro-heading trailed by a rule, e.g. "OVERVIEW ————". */
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <Text
        as="p"
        size="xs"
        weight="semibold"
        variant="subtle"
        className="uppercase tracking-wide"
      >
        {children}
      </Text>
      <Separator className="flex-1" />
    </div>
  );
}

/** A tiny uppercase field-level label, e.g. "CURRENT". */
function MicroLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-[11px] font-semibold uppercase tracking-wide text-fg-subtle",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A native select styled to match the PRIZM {@link Input}. */
function NativeSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: readonly string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 w-full rounded-md border border-border bg-surface px-3 text-sm shadow-sm",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        value ? "text-fg" : "text-fg-subtle",
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option} className="text-fg">
          {option}
        </option>
      ))}
    </select>
  );
}

/** A labelled classification select with helper text. */
function ClassificationField({
  label,
  value,
  onChange,
  placeholder,
  options,
  hint,
  warning,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: readonly string[];
  hint: string;
  /** An optional notice rendered between the select and the hint. */
  warning?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label} <Required />
      </Label>
      <NativeSelect
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        options={options}
      />
      {warning}
      <Text size="xs" variant="muted">
        {hint}
      </Text>
    </div>
  );
}

/** A read-only label/value pair for the Review step. */
function ReviewItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Text size="xs" variant="muted">
        {label}
      </Text>
      <Text size="sm" className="mt-0.5 whitespace-pre-wrap text-fg">
        {value.trim() || "—"}
      </Text>
    </div>
  );
}

// ── The AI-assisted text field ───────────────────────────────────────────────

/**
 * A text field with a "Suggest with AI" affordance. Idle, it's a plain field
 * with a suggest button. Once suggested, it splits into the current value beside
 * an editable AI suggestion the user can re-assess, dismiss, or apply.
 */
function AiAssistField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  multiline,
  generate,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  hint: string;
  multiline?: boolean;
  generate: () => string;
  maxLength?: number;
}) {
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const currentField = multiline ? (
    <Textarea
      rows={5}
      value={value}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ) : (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );

  const suggestionField = multiline ? (
    <Textarea
      rows={5}
      value={suggestion ?? ""}
      onChange={(e) => setSuggestion(e.target.value)}
      className="bg-accent-subtle/40"
    />
  ) : (
    <Input
      value={suggestion ?? ""}
      onChange={(e) => setSuggestion(e.target.value)}
      className="bg-accent-subtle/40"
    />
  );

  return (
    <div className="space-y-2">
      <Label>
        {label} <Required />
      </Label>

      {suggestion === null ? (
        <>
          {currentField}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSuggestion(generate())}
          >
            <Sparkles className="size-4 text-accent" />
            Suggest with AI
          </Button>
          <Text size="xs" variant="muted">
            {hint}
          </Text>
        </>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-1.5">
              <MicroLabel>Current</MicroLabel>
              {currentField}
            </div>

            <div className="space-y-2 lg:border-l lg:border-border lg:pl-6">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-accent" />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                  AI Suggestion
                </span>
                <Text size="xs" variant="muted">
                  · edit as needed
                </Text>
              </div>
              {suggestionField}
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-accent"
                  onClick={() => setSuggestion(generate())}
                >
                  <Sparkles className="size-4" />
                  Re-assess
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSuggestion(null)}
                  >
                    Dismiss
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onChange(suggestion ?? "");
                      setSuggestion(null);
                    }}
                  >
                    <Check className="size-4" />
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <Text size="xs" variant="muted">
            {hint}
          </Text>
        </>
      )}
    </div>
  );
}

// ── The wizard ───────────────────────────────────────────────────────────────

export interface CreateProjectWizardViewProps {
  actor: Actor;
  user: ShellUser;
  /**
   * The education level(s) this request asked for. Used to warn when the project
   * being created targets a different level — a soft check, not a block.
   */
  requestedLevels: string[];
  /** Return to the "Respond to a Request" landing (the choose-a-method screen). */
  onCancel: () => void;
}

/** "Junior College", "Junior College or University", "A, B, or C" — each bold. */
function levelList(levels: string[]): React.ReactNode {
  return levels.map((level, i) => (
    <Fragment key={level}>
      {i > 0 ? (i === levels.length - 1 ? " or " : ", ") : null}
      <span className="font-semibold">{level}</span>
    </Fragment>
  ));
}

/** Title-cases a raw phrase, e.g. "smart drone" → "Smart Drone". */
function titleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** A {@link MonthValue} as the schema's YYYY-MM string, e.g. `{2027, 10}` → "2027-11". */
function monthKey(value: MonthValue): string {
  return `${value.year}-${String(value.month + 1).padStart(2, "0")}`;
}

export function CreateProjectWizardView({
  actor,
  user,
  requestedLevels,
  onCancel,
}: CreateProjectWizardViewProps) {
  const [step, setStep] = useState(0);

  // Submission goes through the route's server `action` (a fetcher, so the page
  // isn't navigated away). `fetcher.data` is scoped to this wizard instance, so a
  // fresh "Create individually" never sees a stale result.
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const submitting = fetcher.state !== "idle";

  // Step 1 — Project Details
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("");
  const [pc, setPc] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [techDomain, setTechDomain] = useState("");
  const [emergingArea, setEmergingArea] = useState("");

  // Step 2 — Project Requirements
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillDraft, setSkillDraft] = useState("");
  const [slots, setSlots] = useState("1");
  const [duration, setDuration] = useState("");
  const [period, setPeriod] = useState<MonthRange>({});

  // Step 3 — Mentor Information
  const [mentorName, setMentorName] = useState("");
  const [mentorAppointment, setMentorAppointment] = useState("");
  const [mentorEmail, setMentorEmail] = useState("");
  const [mentorWriteup, setMentorWriteup] = useState("");

  // Step 4 — Review and Confirm
  const [declared, setDeclared] = useState(false);

  const isLastStep = step === STEPS.length - 1;

  const periodText =
    period.start && period.end
      ? `${formatMonth(period.start)} – ${formatMonth(period.end)}`
      : "";

  // Soft check: the chosen level isn't one the request asked for. Never blocks
  // submission — the IO is told the level differs from what was requested.
  const levelMismatch =
    educationLevel !== "" &&
    requestedLevels.length > 0 &&
    !requestedLevels.includes(educationLevel);

  // Hard gate: every `<Required />` field on the current step must be complete
  // before the AD (P&C) can advance. Mirrors the required markers in the UI —
  // the matching-tag optionality in the data schema doesn't apply here, the form
  // asks for all of them. The mentor email must also be a valid address.
  const mentorEmailValid = z.string().email().safeParse(mentorEmail.trim()).success;
  const stepComplete: boolean[] = [
    // Step 1 — Project Details
    title.trim() !== "" &&
      scope.trim() !== "" &&
      pc !== "" &&
      educationLevel !== "" &&
      techDomain !== "" &&
      emergingArea !== "",
    // Step 2 — Project Requirements
    disciplines.length > 0 &&
      skills.length > 0 &&
      Number(slots) >= 1 &&
      duration !== "" &&
      Boolean(period.start && period.end),
    // Step 3 — Mentor Information
    mentorName.trim() !== "" &&
      mentorAppointment.trim() !== "" &&
      mentorEmailValid &&
      mentorWriteup.trim() !== "",
    // Step 4 — Review and Confirm: the declaration is the only gate.
    declared,
  ];
  const canProceed = stepComplete[step];

  // React to the server action's result: a success toast then back to the
  // "Respond" landing, or a failure toast that keeps the form as-is. Scoped to
  // this fetcher, so re-entering the wizard never re-fires a stale result.
  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.ok) {
      toast.add({
        title: "Project submitted",
        description: "Your project has been added and is pending review.",
        type: "success",
      });
      onCancel();
    } else if (fetcher.data.error) {
      toast.add({
        title: "Couldn't submit project",
        description: fetcher.data.error,
        type: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data]);

  function addSkill() {
    const next = skillDraft.trim();
    if (!next || skills.includes(next)) {
      setSkillDraft("");
      return;
    }
    setSkills((prev) => [...prev, next]);
    setSkillDraft("");
  }

  function handleSaveDraft() {
    toast.add({
      title: "Draft saved",
      description: "This is a placeholder — nothing was persisted yet.",
      type: "info",
    });
  }

  /** Serialise the form and POST it to the route action, which persists it. */
  function handleSubmit() {
    const payload = {
      projectTitle: title.trim(),
      projectScope: scope.trim(),
      pcCode: pc,
      educationLevel,
      placement: Number(slots),
      disciplineOfStudy: disciplines,
      skills,
      techDomain,
      emergingAreas: emergingArea,
      internshipStart: period.start ? monthKey(period.start) : "",
      internshipEnd: period.end ? monthKey(period.end) : "",
      durationMonths: parseInt(duration, 10) || 0,
      mentorName: mentorName.trim(),
      mentorEmail: mentorEmail.trim(),
      mentorDesignation: mentorAppointment.trim(),
      mentorWriteup: mentorWriteup.trim(),
    };
    fetcher.submit(
      { payload: JSON.stringify(payload) },
      { method: "post" },
    );
  }

  function handleNext() {
    if (isLastStep) {
      handleSubmit();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  return (
    <Shell actor={actor} user={user} workstream="Internship">
      {/* Breadcrumb */}
      <div className="mb-5">
        <Text size="sm" variant="muted">
          <button
            type="button"
            onClick={onCancel}
            className="font-medium text-accent transition-colors hover:text-accent/80"
          >
            Project Requests
          </button>{" "}
          / <span className="font-semibold text-fg">Create Project</span>
        </Text>
      </div>

      {/* Stepper */}
      <StepIndicator steps={STEP_META} current={step} className="mb-8" />

      {/* Step content */}
      {step === 0 ? (
        <Card>
          <CardContent className="space-y-8 p-6 sm:p-8">
            {/* Overview */}
            <section className="space-y-6">
              <SectionHeader>Overview</SectionHeader>

              <AiAssistField
                label="Project Title"
                value={title}
                onChange={setTitle}
                placeholder="Type a project name, e.g. AI-Driven Threat Detection System"
                hint="A short, clear project name."
                generate={() =>
                  `Design and Development of ${titleCase(
                    title.trim() || "the Proposed System",
                  )}`
                }
              />

              <AiAssistField
                label="Project Scope"
                value={scope}
                onChange={setScope}
                placeholder="Interns will work on…"
                hint="What the intern will do, learn, and produce. Up to 500 characters."
                multiline
                maxLength={SCOPE_LIMIT}
                generate={() =>
                  `Overview\nThis internship involves research and development in ${
                    title.trim() || "the chosen domain"
                  }. Interns will contribute to substantive work within the technology domain, applying advanced knowledge of relevant tools and technologies to address real technical challenges faced by the organisation.`
                }
              />
            </section>

            {/* Classification */}
            <section className="space-y-5">
              <SectionHeader>Classification</SectionHeader>

              <div className="grid gap-5 sm:grid-cols-2">
                <ClassificationField
                  label="PC"
                  value={pc}
                  onChange={setPc}
                  placeholder="Select PC…"
                  options={PROGRAMME_CENTRES}
                  hint="The Programme Centre that runs this project."
                />
                <ClassificationField
                  label="Education Level"
                  value={educationLevel}
                  onChange={setEducationLevel}
                  placeholder="Select category…"
                  options={EDUCATION_LEVELS}
                  hint="The level of student this project suits."
                  warning={
                    levelMismatch ? (
                      <Alert variant="warning">
                        <TriangleAlert />
                        <AlertDescription className="text-fg">
                          This request asked for {levelList(requestedLevels)}, but
                          you&rsquo;ve selected{" "}
                          <span className="font-semibold">{educationLevel}</span>.
                          You can still submit — the IO will be shown that the
                          level differs from what was requested.
                        </AlertDescription>
                      </Alert>
                    ) : null
                  }
                />
                <ClassificationField
                  label="Tech Domain"
                  value={techDomain}
                  onChange={setTechDomain}
                  placeholder="Select domain…"
                  options={TECH_DOMAINS}
                  hint="The main technology area for this project."
                />
                <ClassificationField
                  label="Emerging Area"
                  value={emergingArea}
                  onChange={setEmergingArea}
                  placeholder="Select area…"
                  options={EMERGING_AREAS}
                  hint="The new tech area this project supports."
                />
              </div>
            </section>
          </CardContent>
        </Card>
      ) : step === 1 ? (
        <Card>
          <CardContent className="space-y-8 p-6 sm:p-8">
            {/* Academic requirements */}
            <section className="space-y-6">
              <SectionHeader>Academic Requirements</SectionHeader>

              <div className="space-y-1.5">
                <Label>
                  Discipline of Study <Required />
                </Label>
                <MultiSelect
                  options={DISCIPLINES}
                  value={disciplines}
                  onChange={setDisciplines}
                  placeholder="Select disciplines…"
                  searchPlaceholder="Search…"
                />
                <Text size="xs" variant="muted">
                  Fields of study an intern should come from.
                </Text>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="skill-input">
                  Skills / Knowledge Required <Required />
                </Label>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="info" className="gap-1 pr-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() =>
                            setSkills((prev) => prev.filter((s) => s !== skill))
                          }
                          aria-label={`Remove ${skill}`}
                          className="rounded-full p-0.5 text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <Input
                    id="skill-input"
                    value={skillDraft}
                    onChange={(e) => setSkillDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="Type a skill and press Add…"
                  />
                  <Button
                    type="button"
                    variant="subtle"
                    onClick={addSkill}
                    className="shrink-0"
                  >
                    <Plus className="size-4" />
                    Add
                  </Button>
                </div>
                <Text size="xs" variant="muted">
                  Skills an intern needs. Type each one and press Add.
                </Text>
              </div>
            </section>

            {/* Logistics */}
            <section className="space-y-5">
              <SectionHeader>Logistics</SectionHeader>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="slots">
                    Number of Slots <Required />
                  </Label>
                  <Input
                    id="slots"
                    type="number"
                    min={1}
                    value={slots}
                    onChange={(e) => setSlots(e.target.value)}
                  />
                  <Text size="xs" variant="muted">
                    How many interns you can take.
                  </Text>
                </div>

                <ClassificationField
                  label="Project Duration"
                  value={duration}
                  onChange={setDuration}
                  placeholder="Select duration…"
                  options={DURATIONS}
                  hint="How long the internship runs."
                />

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="period">
                    Internship Period <Required />
                  </Label>
                  <MonthRangePicker
                    id="period"
                    value={period}
                    onChange={setPeriod}
                  />
                  <Text size="xs" variant="muted">
                    The window the project can be hosted. A range covers whole
                    months — Nov 2027 to Dec 2027 means 1 Nov through 31 Dec. (How
                    long an intern actually runs is the Project Duration.)
                  </Text>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      ) : step === 2 ? (
        <Card>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <SectionHeader>Mentor Information</SectionHeader>

            <div className="space-y-1.5">
              <Label htmlFor="mentor-name">
                Full Name of Main Mentor <Required />
              </Label>
              <Input
                id="mentor-name"
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                placeholder="e.g. Dr James Tan"
              />
              <Text size="xs" variant="muted">
                Who will guide the intern day to day.
              </Text>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mentor-appointment">
                Main Mentor Appointment <Required />
              </Label>
              <Input
                id="mentor-appointment"
                value={mentorAppointment}
                onChange={(e) => setMentorAppointment(e.target.value)}
                placeholder="e.g. Principal Engineer"
              />
              <Text size="xs" variant="muted">
                The mentor&rsquo;s job title.
              </Text>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mentor-email">
                Main Mentor Email <Required />
              </Label>
              <Input
                id="mentor-email"
                type="email"
                value={mentorEmail}
                onChange={(e) => setMentorEmail(e.target.value)}
                placeholder="e.g. james_tan@dsta.gov.sg"
              />
              <Text size="xs" variant="muted">
                The mentor&rsquo;s DSTA email address.
              </Text>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mentor-writeup">
                Main Mentor Write-up <Required />
              </Label>
              <Textarea
                id="mentor-writeup"
                rows={4}
                maxLength={MENTOR_WRITEUP_LIMIT}
                value={mentorWriteup}
                onChange={(e) => setMentorWriteup(e.target.value)}
                placeholder="Senior Engineer with 10 years in cybersecurity…"
              />
              <div className="flex items-start justify-between gap-3">
                <Text size="xs" variant="muted">
                  A short background of the mentor. Up to {MENTOR_WRITEUP_LIMIT}{" "}
                  characters.
                </Text>
                <Text
                  size="xs"
                  variant="muted"
                  className="shrink-0 tabular-nums"
                >
                  {mentorWriteup.length}/{MENTOR_WRITEUP_LIMIT}
                </Text>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-8 p-6 sm:p-8">
            {/* Review — a read-only summary of every field. */}
            <section className="space-y-5">
              <SectionHeader>Review</SectionHeader>

              <ReviewItem label="Project Title" value={title} />
              <ReviewItem label="Project Scope" value={scope} />

              <div className="grid gap-5 sm:grid-cols-2">
                <ReviewItem label="PC" value={pc} />
                <ReviewItem label="Education Level" value={educationLevel} />
                <ReviewItem label="Tech Domain" value={techDomain} />
                <ReviewItem label="Emerging Area" value={emergingArea} />
                <ReviewItem
                  label="Discipline of Study"
                  value={disciplines.join(", ")}
                />
                <ReviewItem label="Skills / Knowledge" value={skills.join(", ")} />
                <ReviewItem label="Number of Slots" value={slots} />
                <ReviewItem label="Project Duration" value={duration} />
                <ReviewItem label="Internship Period" value={periodText} />
                <ReviewItem label="Main Mentor" value={mentorName} />
                <ReviewItem
                  label="Mentor Appointment"
                  value={mentorAppointment}
                />
                <ReviewItem label="Mentor Email" value={mentorEmail} />
                <ReviewItem
                  label="Mentor Write-up"
                  value={mentorWriteup}
                  className="sm:col-span-2"
                />
              </div>
            </section>

            {/* Declaration */}
            <section className="space-y-4">
              <SectionHeader>Declaration</SectionHeader>

              <div className="rounded-lg border border-border bg-bg-subtle p-4">
                <label className="flex items-start gap-3">
                  <Checkbox
                    checked={declared}
                    onCheckedChange={(checked) => setDeclared(checked === true)}
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
                    <Text size="sm" weight="medium">
                      I confirm that:
                    </Text>
                    <ul className="list-disc space-y-1 pl-5">
                      <li>
                        <Text as="span" size="sm" variant="muted">
                          Necessary security clearance has been obtained for this
                          project
                        </Text>
                      </li>
                      <li>
                        <Text as="span" size="sm" variant="muted">
                          This project has received endorsement from the respective
                          PC Head(s) prior to creation
                        </Text>
                      </li>
                    </ul>
                  </div>
                </label>
              </div>
            </section>
          </CardContent>
        </Card>
      )}

      {/* Sticky action bar */}
      <Shell.Footer>
        <div className="flex items-center justify-between gap-3">
          {step === 0 ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handleSaveDraft}>
              <Save className="size-4" />
              Save Draft
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed || submitting}
            >
              {isLastStep ? (
                <>
                  <CircleCheck className="size-4" />
                  {submitting ? "Submitting…" : "Submit Project"}
                </>
              ) : (
                <>
                  Next: {STEPS[step + 1]}
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Shell.Footer>
    </Shell>
  );
}
