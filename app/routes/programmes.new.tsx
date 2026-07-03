import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CircleCheck, Save } from "lucide-react";
import {
  Link,
  redirect,
  useActionData,
  useNavigation,
  useSubmit,
} from "react-router";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { ToastProvider } from "@/components/ui/toast";

import { AccessDeniedBoundary } from "~/components/access-denied";
import { Shell } from "~/components/shell";
import { requireCan } from "~/auth/current-user.server";
import {
  ROLE_LABELS,
  programmesRepository,
  projectsRepository,
  resolveUser,
  type Project,
} from "~/data";

import {
  applicationFormFor,
  criteriaRuleCount,
  defaultCriteriaFor,
} from "~/features/programmes/create/eligibility";
import { DetailsStep } from "~/features/programmes/create/details-step";
import { EligibilitySheet } from "~/features/programmes/create/eligibility-sheet";
import { IntakesStep } from "~/features/programmes/create/intakes-step";
import { ReviewStep } from "~/features/programmes/create/review-step";
import { StepBar, STEPS } from "~/features/programmes/create/ui";
import {
  buildPayload,
  emptyIntake,
  finalizeProgramme,
  type IntakeDraft,
  type ProgrammeDraftPayload,
  type WizardState,
} from "~/features/programmes/create/types";

import type { Route } from "./+types/programmes.new";

/**
 * Create Programme — a three-step wizard (Details → Intakes → Review).
 *
 * Details sets the title, education level (which auto-configures the eligibility
 * criteria and application form) and description. Intakes lets an officer set
 * each intake's application window + internship period and attach matching
 * projects from the pool. Review shows a summary and a programme timeline before
 * the programme is created (or saved as a draft) through the server `action`.
 *
 * Each step's UI lives in `~/features/programmes/create/{details,intakes,review}-step`;
 * this file owns the wizard state, validation, step navigation, and submission.
 */

export function meta() {
  return [{ title: "Create Programme — Talent Outreach & Acquisition" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const actor = await requireCan(request, "create", "programmes");
  const [user, projectsRes] = await Promise.all([
    resolveUser(actor.id),
    projectsRepository.as(actor).list(),
  ]);

  return {
    actor,
    user: {
      name: user?.name ?? ROLE_LABELS[actor.role],
      email: user?.email,
    },
    projects: projectsRes.ok ? projectsRes.data : [],
  };
}

export async function action({ request }: Route.ActionArgs) {
  const actor = await requireCan(request, "create", "programmes");
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "create");

  let payload: ProgrammeDraftPayload;
  try {
    payload = JSON.parse(String(form.get("payload") ?? ""));
  } catch {
    return { error: "Could not read the submitted programme data." };
  }

  const status = intent === "draft" ? "Draft" : "Active";
  const programme = finalizeProgramme(payload, actor.id, status, new Date().toISOString());

  const res = await programmesRepository.as(actor).create(programme);
  if (!res.ok) return { error: res.error.message };

  return redirect("/programmes");
}

// ── Wizard ────────────────────────────────────────────────────────────────────

function CreateProgrammeWizard({ projects }: { projects: Project[] }) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const busy = navigation.state !== "idle";

  const [state, setState] = useState<WizardState>(() => {
    const first = emptyIntake();
    return {
      title: "",
      educationLevel: "",
      description: "",
      eligibilityCriteria: [],
      intakes: [first],
      assignments: {},
    };
  });
  const [step, setStep] = useState(0);
  const [visited, setVisited] = useState(0);
  const [selectedIntakeId, setSelectedIntakeId] = useState(state.intakes[0].id);
  const [sheetOpen, setSheetOpen] = useState(false);

  // ── Derived ──
  const detailsValid = state.title.trim().length > 0 && state.educationLevel.length > 0;
  const intakesValid =
    state.intakes.length > 0 &&
    state.intakes.every((it) => it.applicationWindow.from && it.applicationWindow.to);

  const ruleCount = criteriaRuleCount(state.eligibilityCriteria);
  const formTemplate = state.educationLevel ? applicationFormFor(state.educationLevel) : "";

  const selectedIndex = Math.max(
    0,
    state.intakes.findIndex((it) => it.id === selectedIntakeId),
  );
  const selectedIntake = state.intakes[selectedIndex] ?? null;

  // ── Mutations ──
  function setEducationLevel(level: string) {
    setState((s) => ({
      ...s,
      educationLevel: level,
      eligibilityCriteria: defaultCriteriaFor(level),
    }));
  }

  function patchIntake(id: string, patch: Partial<IntakeDraft>) {
    setState((s) => ({
      ...s,
      intakes: s.intakes.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  }

  function addIntake() {
    const next = emptyIntake();
    setState((s) => ({ ...s, intakes: [...s.intakes, next] }));
    setSelectedIntakeId(next.id);
  }

  function removeIntake(id: string) {
    setState((s) => {
      const intakes = s.intakes.filter((it) => it.id !== id);
      // Drop any assignments pointing at the removed intake.
      const assignments = Object.fromEntries(
        Object.entries(s.assignments).filter(([, intakeId]) => intakeId !== id),
      );
      return { ...s, intakes, assignments };
    });
    if (selectedIntakeId === id) {
      setSelectedIntakeId(state.intakes.find((it) => it.id !== id)?.id ?? "");
    }
  }

  function assignProject(projectId: string) {
    if (!selectedIntake) return;
    setState((s) => ({
      ...s,
      assignments: { ...s.assignments, [projectId]: selectedIntake.id },
    }));
  }

  function unassignProject(projectId: string) {
    setState((s) => {
      const assignments = { ...s.assignments };
      delete assignments[projectId];
      return { ...s, assignments };
    });
  }

  // ── Navigation ──
  function goTo(index: number) {
    if (index <= visited) setStep(index);
  }

  function goNext() {
    if (step === 0 && !detailsValid) return;
    if (step === 1 && !intakesValid) return;
    const next = Math.min(step + 1, STEPS.length - 1);
    setStep(next);
    setVisited((v) => Math.max(v, next));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function persist(intent: "draft" | "create") {
    const payload = buildPayload(state, projects, formTemplate);
    const data = new FormData();
    data.set("intent", intent);
    data.set("payload", JSON.stringify(payload));
    submit(data, { method: "post" });
  }

  // ── Review payload (also used for the timeline) ──
  const reviewPayload = useMemo(
    () => buildPayload(state, projects, formTemplate),
    [state, projects, formTemplate],
  );
  const projectById = useMemo(
    () => new Map(projects.map((p) => [p.projectId, p])),
    [projects],
  );
  const timelineProjects = reviewPayload.attachedProjects
    .map((ap) => {
      const project = projectById.get(ap.projectId);
      return project
        ? {
            projectId: project.projectId,
            title: project.projectTitle,
            durationMonths: project.durationMonths,
          }
        : null;
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return (
    <div className="space-y-6 pb-24">
      {/* Step bar */}
      <div className="rounded-lg border border-border bg-surface px-6 py-4">
        <StepBar current={step} visited={visited} onStepClick={goTo} />
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 0 ? (
            <DetailsStep
              title={state.title}
              educationLevel={state.educationLevel}
              description={state.description}
              ruleCount={ruleCount}
              formTemplate={formTemplate}
              onTitleChange={(value) => setState((s) => ({ ...s, title: value }))}
              onEducationLevelChange={setEducationLevel}
              onDescriptionChange={(value) => setState((s) => ({ ...s, description: value }))}
              onOpenEligibility={() => setSheetOpen(true)}
            />
          ) : null}

          {step === 1 ? (
            <IntakesStep
              intakes={state.intakes}
              assignments={state.assignments}
              selectedIntakeId={selectedIntakeId}
              selectedIntake={selectedIntake}
              selectedIndex={selectedIndex}
              projects={projects}
              educationLevel={state.educationLevel}
              onSelectIntake={setSelectedIntakeId}
              onAddIntake={addIntake}
              onRemoveIntake={removeIntake}
              onPatchIntake={patchIntake}
              onAssign={assignProject}
              onUnassign={unassignProject}
            />
          ) : null}

          {step === 2 ? (
            <ReviewStep
              title={state.title}
              educationLevel={state.educationLevel}
              formTemplate={formTemplate}
              intakes={state.intakes}
              eligibilityCriteria={state.eligibilityCriteria}
              intakeWindows={reviewPayload.intakeWindows}
              timelineProjects={timelineProjects}
              onOpenEligibility={() => setSheetOpen(true)}
            />
          ) : null}

          {actionData?.error ? (
            <p className="mt-6 text-sm text-danger">{actionData.error}</p>
          ) : null}
        </CardContent>
      </Card>

      {/* Sticky footer */}
      <div className="sticky bottom-0 z-20 flex items-center justify-between gap-3 border-t border-border bg-bg/95 py-4 backdrop-blur">
        {step === 0 ? (
          <Link to="/programmes" className={buttonVariants({ variant: "outline" })}>
            Cancel
          </Link>
        ) : (
          <Button variant="outline" onClick={goBack} disabled={busy}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        )}

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => persist("draft")} disabled={busy || !detailsValid}>
            <Save className="size-4" />
            Save as Draft
          </Button>
          {step < 2 ? (
            <Button
              onClick={goNext}
              disabled={(step === 0 && !detailsValid) || (step === 1 && !intakesValid)}
            >
              Next: {STEPS[step + 1]}
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={() => persist("create")} disabled={busy || !detailsValid || !intakesValid}>
              <CircleCheck className="size-4" />
              Create Programme
            </Button>
          )}
        </div>
      </div>

      <EligibilitySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        educationLevel={state.educationLevel}
        criteria={state.eligibilityCriteria}
      />
    </div>
  );
}

export default function NewProgramme({ loaderData }: Route.ComponentProps) {
  const { actor, user, projects } = loaderData;

  return (
    <ToastProvider>
      <Shell actor={actor} user={user} workstream="Internship">
        <div className="mb-5">
          <Text size="sm" variant="muted">
            <Link to="/programmes" className="transition-colors hover:text-fg">
              Programmes
            </Link>{" "}
            <span className="px-1">›</span> <span className="text-fg">Create Programme</span>
          </Text>
        </div>
        <CreateProgrammeWizard projects={projects} />
      </Shell>
    </ToastProvider>
  );
}

/** Renders the 403 from `requireCan` as a clear "access denied" screen. */
export function ErrorBoundary() {
  return (
    <AccessDeniedBoundary message="Your current role isn't permitted to create programmes. Switch to a role that can (e.g. Internship Officer, IO Admin, or Director)." />
  );
}
