import { useMemo, useState } from "react";
import { ChevronsUpDown, Plus, Save, X } from "lucide-react";
import {
  isRouteErrorResponse,
  Link,
  useNavigate,
  useRouteError,
} from "react-router";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { ToastProvider, toast } from "@/components/ui/toast";

import {
  MonthPicker,
  formatMonth,
  monthOrdinal,
  type MonthValue,
} from "~/components/month-picker";
import { MultiSelect } from "~/components/multi-select";
import { Shell } from "~/components/shell";
import { requireCan } from "~/auth/current-user.server";
import { ROLE_LABELS, programmesRepository, resolveUser } from "~/data";

import type { Route } from "./+types/projects.new";

/**
 * Create Project — the single-page form for `/projects/new`, as used by IOs and
 * IO Admins (both hold the `create` grant on `projects`). A separate variant for
 * the ADPnC role will follow; this one focuses on the IO/IO-Admin flow.
 *
 * Like `programmes.new`, this is a prototype: the form is fully wired client-side
 * but "Create Project" does not persist yet — it toasts and returns to the list.
 * The field set mirrors the design (Overview, Classification, Academic
 * Requirements, Logistics, Mentor) with the Programme and Placements cards in a
 * sticky sidebar.
 */

export function meta() {
  return [{ title: "Create Project — Talent Outreach & Acquisition" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const actor = await requireCan(request, "create", "projects");
  const [user, programmesRes] = await Promise.all([
    resolveUser(actor.id),
    programmesRepository.as(actor).list(),
  ]);

  return {
    actor,
    user: {
      name: user?.name ?? ROLE_LABELS[actor.role],
      email: user?.email,
    },
    programmes: programmesRes.ok
      ? programmesRes.data.map((p) => ({ id: p.id, title: p.title }))
      : [],
  };
}

// ── Option sets ──────────────────────────────────────────────────────────────
// Provisional pick-lists for the prototype. Swap for the real taxonomies (and a
// PC repository) once they're defined.

const PROGRAMME_CENTRES = [
  "C4I Development",
  "Cybersecurity Programme Centre",
  "Digital Hub",
  "Enterprise IT",
  "Guided Systems",
  "Sensors Programme Centre",
] as const;

const EDUCATION_LEVELS = [
  "Junior College",
  "Polytechnic",
  "University (Undergraduate)",
  "University (Postgraduate)",
] as const;

const TECH_DOMAINS = [
  "Artificial Intelligence",
  "Cybersecurity",
  "Data Science & Analytics",
  "Software Engineering",
  "Systems Engineering",
  "Robotics & Autonomous Systems",
] as const;

const EMERGING_AREAS = [
  "Generative AI",
  "Quantum Technologies",
  "Edge Computing",
  "Digital Twins",
  "Zero Trust Architecture",
] as const;

const DISCIPLINES = [
  "Computer Science",
  "Computer Engineering",
  "Electrical Engineering",
  "Electronic Engineering",
  "Mechanical Engineering",
  "Aerospace Engineering",
  "Mathematics & Statistics",
  "Physics",
  "Information Systems",
  "Data Science",
] as const;

const DURATIONS = [
  "8 weeks",
  "10 weeks",
  "12 weeks",
  "6 months",
  "12 months",
] as const;

const LOCATIONS = [
  "DSTA Depot Road",
  "DSTA Kent Ridge",
  "DSTA Bukit Gombak",
  "Hybrid",
] as const;

const MENTOR_WRITEUP_LIMIT = 300;

/** A uppercase micro-heading for a form section, matching the design. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      as="p"
      size="xs"
      weight="semibold"
      variant="subtle"
      className="uppercase tracking-wide"
    >
      {children}
    </Text>
  );
}

/** A card-wrapped form section: micro-heading, divider, then fields. */
function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <SectionLabel>{title}</SectionLabel>
        <Separator className="my-4" />
        <div className="space-y-5">{children}</div>
      </CardContent>
    </Card>
  );
}

/** Red asterisk for required-field labels. */
function Required() {
  return <span className="text-danger"> *</span>;
}

/** A labelled PRIZM Select wired to a controlled string value. */
function SelectField({
  label,
  value,
  onValueChange,
  placeholder,
  options,
}: {
  label: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: readonly string[];
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(v) => onValueChange((v as string) ?? "")}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ── The form ─────────────────────────────────────────────────────────────────

function CreateProjectForm({
  actor,
  user,
  programmes,
}: {
  actor: Route.ComponentProps["loaderData"]["actor"];
  user: Route.ComponentProps["loaderData"]["user"];
  programmes: { id: string; title: string }[];
}) {
  const navigate = useNavigate();

  // Overview
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("");
  // Classification
  const [pc, setPc] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [techDomain, setTechDomain] = useState("");
  const [emergingArea, setEmergingArea] = useState("");
  // Academic requirements
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillDraft, setSkillDraft] = useState("");
  // Logistics
  const [startMonth, setStartMonth] = useState<MonthValue | undefined>();
  const [endMonth, setEndMonth] = useState<MonthValue | undefined>();
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState("");
  // Mentor
  const [mentorName, setMentorName] = useState("");
  const [mentorEmail, setMentorEmail] = useState("");
  const [mentorWriteup, setMentorWriteup] = useState("");
  // Sidebar
  const [programmeTitle, setProgrammeTitle] = useState<string | null>(null);
  const [slots, setSlots] = useState("1");
  const [requiresDce, setRequiresDce] = useState(true);

  // Validation surfaced only after a submit attempt, to keep the form calm.
  const [showErrors, setShowErrors] = useState(false);

  const programmeTitles = useMemo(() => programmes.map((p) => p.title), [programmes]);

  const endBeforeStart =
    startMonth !== undefined &&
    endMonth !== undefined &&
    monthOrdinal(endMonth) < monthOrdinal(startMonth);

  function addSkill() {
    const next = skillDraft.trim();
    if (!next || skills.includes(next)) {
      setSkillDraft("");
      return;
    }
    setSkills([...skills, next]);
    setSkillDraft("");
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  function handleCreate() {
    const valid =
      title.trim() &&
      scope.trim() &&
      startMonth &&
      endMonth &&
      !endBeforeStart &&
      duration &&
      mentorName.trim() &&
      programmeTitle &&
      Number(slots) >= 1;

    if (!valid) {
      setShowErrors(true);
      toast.add({
        title: "Missing details",
        description: "Please complete the required fields before creating.",
        type: "error",
      });
      return;
    }

    const programmeId = programmes.find((p) => p.title === programmeTitle)?.id;
    const payload = {
      title: title.trim(),
      scope: scope.trim(),
      pc,
      educationLevel,
      techDomain,
      emergingArea,
      disciplines,
      skills,
      startMonth: startMonth && formatMonth(startMonth),
      endMonth: endMonth && formatMonth(endMonth),
      duration,
      location,
      mentor: { name: mentorName.trim(), email: mentorEmail.trim(), writeup: mentorWriteup.trim() },
      programmeId,
      slots: Number(slots),
      requiresDce,
    };

    // Placeholder: persistence isn't wired up yet — log and return to the list.
    // eslint-disable-next-line no-console
    console.log("Create project (placeholder):", payload);
    toast.add({
      title: "Project created",
      description: "This is a placeholder — nothing was persisted yet.",
      type: "success",
    });
    setTimeout(() => navigate("/projects"), 600);
  }

  return (
    <Shell
      actor={actor}
      user={user}
      workstream="Internship"
      title="Create Project"
      actions={
        <>
          <Button onClick={handleCreate}>
            <Save className="size-4" />
            Create Project
          </Button>
          <Link to="/projects" className={buttonVariants({ variant: "outline" })}>
            Cancel
          </Link>
        </>
      }
    >
      <div className="mb-5">
        <Text size="sm" variant="muted">
          <Link to="/projects" className="transition-colors hover:text-fg">
            Projects
          </Link>{" "}
          / <span className="text-fg">Create Project</span>
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      {/* ── Main column ───────────────────────────────────────────────── */}
      <div className="space-y-6">
        <FormSection title="Overview">
          <Field>
            <FieldLabel>
              Project Title <Required />
            </FieldLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI-Driven Threat Detection System"
            />
            {showErrors && !title.trim() ? (
              <FieldError match>Please enter a project title.</FieldError>
            ) : null}
          </Field>

          <Field>
            <FieldLabel>
              Project Scope <Required />
            </FieldLabel>
            <Textarea
              rows={5}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="Interns will work on…"
            />
            <FieldDescription>
              Include overview, learning outcomes, and expected deliverables (min 30 words).
            </FieldDescription>
            {showErrors && !scope.trim() ? (
              <FieldError match>Please describe the project scope.</FieldError>
            ) : null}
          </Field>
        </FormSection>

        <FormSection title="Classification">
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="PC"
              value={pc}
              onValueChange={setPc}
              placeholder="Select PC…"
              options={PROGRAMME_CENTRES}
            />
            <SelectField
              label="Education Level"
              value={educationLevel}
              onValueChange={setEducationLevel}
              placeholder="Select category…"
              options={EDUCATION_LEVELS}
            />
            <SelectField
              label="Tech Domain"
              value={techDomain}
              onValueChange={setTechDomain}
              placeholder="Select domain…"
              options={TECH_DOMAINS}
            />
            <SelectField
              label="Emerging Area"
              value={emergingArea}
              onValueChange={setEmergingArea}
              placeholder="Select area…"
              options={EMERGING_AREAS}
            />
          </div>
        </FormSection>

        <FormSection title="Academic Requirements">
          <div className="space-y-1.5">
            <Label htmlFor="disciplines">Discipline of Study</Label>
            <MultiSelect
              id="disciplines"
              options={DISCIPLINES}
              value={disciplines}
              onChange={setDisciplines}
              placeholder="Select disciplines…"
              searchPlaceholder="Search disciplines…"
            />
            <Text size="xs" variant="muted">
              e.g. Computer Science / Electrical Engineering
            </Text>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="skill-input">Skills / Knowledge Required</Label>
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
              <Button variant="subtle" onClick={addSkill} className="shrink-0">
                <Plus className="size-4" />
                Add
              </Button>
            </div>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((skill) => (
                  <Badge key={skill} variant="subtle" className="gap-1 pr-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      aria-label={`Remove ${skill}`}
                      className="rounded-full p-0.5 text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </FormSection>

        <FormSection title="Logistics">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="start-month">
                Internship Start Month <Required />
              </Label>
              <MonthPicker
                id="start-month"
                value={startMonth}
                onChange={(m) => {
                  setStartMonth(m);
                  if (endMonth && monthOrdinal(endMonth) < monthOrdinal(m)) {
                    setEndMonth(undefined);
                  }
                }}
                placeholder="Select start month"
              />
              {showErrors && !startMonth ? (
                <Text size="xs" className="text-danger">
                  Please choose a start month.
                </Text>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="end-month">
                Internship End Month <Required />
              </Label>
              <MonthPicker
                id="end-month"
                value={endMonth}
                onChange={setEndMonth}
                placeholder="Select end month"
                min={startMonth}
              />
              {showErrors && !endMonth ? (
                <Text size="xs" className="text-danger">
                  Please choose an end month.
                </Text>
              ) : null}
            </div>

            <SelectField
              label={<>Internship Duration <Required /></>}
              value={duration}
              onValueChange={setDuration}
              placeholder="Select duration…"
              options={DURATIONS}
            />
            <SelectField
              label="Working Location"
              value={location}
              onValueChange={setLocation}
              placeholder="Select location…"
              options={LOCATIONS}
            />
          </div>
          {showErrors && !duration ? (
            <Text size="xs" className="text-danger">
              Please choose an internship duration.
            </Text>
          ) : null}
        </FormSection>

        <FormSection title="Mentor Information">
          <Field>
            <FieldLabel>
              Full Name of Main Mentor <Required />
            </FieldLabel>
            <Input
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
              placeholder="e.g. Dr James Tan"
            />
            {showErrors && !mentorName.trim() ? (
              <FieldError match>Please enter the main mentor&apos;s name.</FieldError>
            ) : null}
          </Field>

          <Field>
            <FieldLabel>Main Mentor Email</FieldLabel>
            <Input
              type="email"
              value={mentorEmail}
              onChange={(e) => setMentorEmail(e.target.value)}
              placeholder="e.g. james_tan@dsta.gov.sg"
            />
            <FieldDescription>DSTA email address of the main mentor.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel>Main Mentor Write-up</FieldLabel>
            <Textarea
              rows={4}
              maxLength={MENTOR_WRITEUP_LIMIT}
              value={mentorWriteup}
              onChange={(e) => setMentorWriteup(e.target.value)}
              placeholder="Senior Engineer with 10 years in cybersecurity…"
            />
            <div className="flex items-center justify-between">
              <FieldDescription>
                Brief professional background of the main mentor (max {MENTOR_WRITEUP_LIMIT}{" "}
                characters).
              </FieldDescription>
              <Text size="xs" variant="muted" className="tabular-nums">
                {mentorWriteup.length}/{MENTOR_WRITEUP_LIMIT}
              </Text>
            </div>
          </Field>
        </FormSection>
      </div>

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <div className="space-y-6 lg:sticky lg:top-[calc(var(--shell-header-h)+1.5rem)] lg:self-start">
        <Card>
          <CardContent className="space-y-4 p-6">
            <Heading as="h2" size="xl">
              Programme
            </Heading>
            <div className="space-y-1.5">
              <Label htmlFor="programme">
                Programme <Required />
              </Label>
              <Combobox
                items={programmeTitles}
                value={programmeTitle}
                onValueChange={(v: string | null) => setProgrammeTitle(v)}
              >
                <ComboboxTrigger id="programme" className="w-full">
                  <span className={programmeTitle ? "truncate" : "truncate text-fg-subtle"}>
                    {programmeTitle ?? "Search programme…"}
                  </span>
                  <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </ComboboxTrigger>
                <ComboboxContent>
                  <div className="border-b border-border p-1">
                    <ComboboxInput
                      placeholder="Search programme…"
                      className="border-0 shadow-none focus-visible:outline-0"
                    />
                  </div>
                  <ComboboxEmpty>No programmes found.</ComboboxEmpty>
                  <ComboboxList>
                    {(programme: string) => (
                      <ComboboxItem key={programme} value={programme}>
                        {programme}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {showErrors && !programmeTitle ? (
                <Text size="xs" className="text-danger">
                  Please choose a programme.
                </Text>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <Heading as="h2" size="xl">
              Placements
            </Heading>
            <Field>
              <FieldLabel>
                Number of Slots <Required />
              </FieldLabel>
              <Input
                type="number"
                min={1}
                value={slots}
                onChange={(e) => setSlots(e.target.value)}
              />
            </Field>

            <div className="space-y-2">
              <Text size="sm" weight="medium">
                Approval workflow
              </Text>
              <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                <Switch
                  checked={requiresDce}
                  onCheckedChange={(checked) => setRequiresDce(checked)}
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <Text size="sm" weight="medium">
                    Requires DCE approval{" "}
                    <span className="font-normal text-fg-muted">(include SCI cycle)</span>
                  </Text>
                  <Text size="xs" variant="muted">
                    This project requires DCE sign-off before publishing for matching.
                  </Text>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </Shell>
  );
}

export default function NewProject({ loaderData }: Route.ComponentProps) {
  const { actor, user, programmes } = loaderData;

  return (
    <ToastProvider>
      <CreateProjectForm actor={actor} user={user} programmes={programmes} />
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
            ? "Your current role isn't permitted to create projects. Switch to a role that can (e.g. Internship Officer or IO Admin)."
            : "An unexpected error occurred loading this page."}
        </AlertDescription>
      </Alert>
      <Link to="/act-as" className={buttonVariants({ variant: "solid", size: "sm" })}>
        Switch identity
      </Link>
    </div>
  );
}
