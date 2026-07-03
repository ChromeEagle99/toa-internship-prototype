import {
  newId,
  type AttachedProject,
  type CriteriaGroup,
  type IntakeWindow,
  type Programme,
  type ProgStatus,
  type Project,
} from "~/data";
import type { DateRange } from "~/components/date-range-picker";
import { monthOrdinal, type MonthValue } from "~/components/month-picker";

import { matchProject } from "./matching";

/**
 * The Create Programme wizard's client-side state, and the mapping down to a
 * persistable {@link Programme}.
 *
 * The wizard holds rich UI values (real `Date`s, `{year, month}` months). Before
 * posting we flatten those to the schema's string shapes in {@link buildPayload}
 * so the payload is plain JSON; the server action then stamps the system fields
 * in {@link finalizeProgramme}. Splitting it this way keeps date parsing off the
 * server and out of the wire format.
 */

/** One intake being edited: an application window and an internship month span. */
export interface IntakeDraft {
  /** Client-only id (stable list key + assignment target). */
  id: string;
  applicationWindow: DateRange;
  internshipStart?: MonthValue;
  internshipEnd?: MonthValue;
}

export interface WizardState {
  title: string;
  educationLevel: string;
  description: string;
  /** Auto-configured from the education level; see `eligibility.defaultCriteriaFor`. */
  eligibilityCriteria: CriteriaGroup[];
  intakes: IntakeDraft[];
  /** projectId → intakeId. A project belongs to at most one intake. */
  assignments: Record<string, string>;
}

export const emptyIntake = (): IntakeDraft => ({
  id: newId(),
  applicationWindow: {},
});

/** Everything needed to build a Programme, minus the server-stamped fields. */
export interface ProgrammeDraftPayload {
  programmeTitle: string;
  educationLevel: string;
  programmeDesc?: string;
  formTemplate?: string;
  intakeWindows: IntakeWindow[];
  eligibilityCriteria: CriteriaGroup[];
  attachedProjects: AttachedProject[];
  placements: number;
}

/** A `Date` → `YYYY-MM-DD` in local time (no UTC day-slip). */
function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** A `{year, month}` → `YYYY-MM`. */
function toYearMonth(value: MonthValue): string {
  return `${value.year}-${String(value.month + 1).padStart(2, "0")}`;
}

function durationMonths(start?: MonthValue, end?: MonthValue): number | undefined {
  if (!start || !end) return undefined;
  return Math.max(0, monthOrdinal(end) - monthOrdinal(start)) + 1;
}

/** Map an intake draft to a schema {@link IntakeWindow}. Assumes a valid window. */
function toIntakeWindow(intake: IntakeDraft, index: number): IntakeWindow {
  return {
    intakeId: intake.id,
    intakeTitle: `Intake ${index + 1}`,
    applicationOpen: intake.applicationWindow.from ? toIsoDate(intake.applicationWindow.from) : "",
    applicationClose: intake.applicationWindow.to ? toIsoDate(intake.applicationWindow.to) : "",
    internshipStart: intake.internshipStart ? toYearMonth(intake.internshipStart) : undefined,
    internshipEnd: intake.internshipEnd ? toYearMonth(intake.internshipEnd) : undefined,
    durationMonths: durationMonths(intake.internshipStart, intake.internshipEnd),
  };
}

/**
 * Flatten the wizard state (plus the project pool, for match state + placement
 * totals) into a JSON-serialisable payload. Called on the client just before the
 * form is posted.
 */
export function buildPayload(
  state: WizardState,
  projects: Project[],
  formTemplate: string,
): ProgrammeDraftPayload {
  const byId = new Map(projects.map((p) => [p.projectId, p]));
  const intakeById = new Map(state.intakes.map((it) => [it.id, it]));

  const attachedProjects: AttachedProject[] = [];
  let placements = 0;

  for (const [projectId, intakeId] of Object.entries(state.assignments)) {
    const project = byId.get(projectId);
    const intake = intakeById.get(intakeId);
    if (!project || !intake) continue;

    const match = matchProject(
      project,
      state.educationLevel,
      intake.internshipStart,
      intake.internshipEnd,
    );
    attachedProjects.push({
      projectId,
      projectIntakeId: intakeId,
      attachSelected: true,
      educationLevelMatch: match.educationLevelMatch,
      periodWithinIntake: match.periodWithinIntake,
    });
    placements += project.placement;
  }

  return {
    programmeTitle: state.title.trim(),
    educationLevel: state.educationLevel,
    programmeDesc: state.description.trim() || undefined,
    formTemplate,
    intakeWindows: state.intakes.map(toIntakeWindow),
    eligibilityCriteria: state.eligibilityCriteria,
    attachedProjects,
    placements,
  };
}

/** Stamp the system fields on a payload to make a full {@link Programme}. */
export function finalizeProgramme(
  payload: ProgrammeDraftPayload,
  actorId: string,
  status: ProgStatus,
  nowIso: string,
): Programme {
  return {
    ...payload,
    programmeId: newId(),
    status,
    applicationsCount: 0,
    createdBy: actorId,
    createdAt: nowIso,
  };
}
