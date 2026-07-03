import type { Project } from "~/data";
import { monthOrdinal, type MonthValue } from "~/components/month-picker";

/**
 * Project ↔ intake matching for the Create Programme wizard.
 *
 * A project is a candidate for an intake when it targets the same education
 * level AND its internship period sits within the intake's internship months.
 * The wizard surfaces both signals (so an officer can see *why* something is
 * unmatched) and persists them onto the attached project.
 */

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** Parse a `YYYY-MM` string to a comparable ordinal, or `null` if malformed. */
export function yearMonthOrdinal(value?: string | null): number | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 12 + (Number(match[2]) - 1);
}

/** `MonthValue` → the same ordinal space as {@link yearMonthOrdinal}. */
export function monthValueOrdinal(value?: MonthValue): number | null {
  return value ? monthOrdinal(value) : null;
}

/** "2026-09" → "Sep26". Falls back to the raw value if it can't be parsed. */
export function formatYearMonth(value?: string | null): string {
  const ord = yearMonthOrdinal(value);
  if (ord === null) return value ?? "";
  const year = Math.floor(ord / 12);
  const month = ord % 12;
  return `${MONTHS_SHORT[month]}${String(year).slice(2)}`;
}

/** "Sep26 – Nov26" for a project's internship period. */
export function projectPeriodLabel(project: Project): string {
  const start = formatYearMonth(project.internshipStart);
  const end = formatYearMonth(project.internshipEnd);
  if (start && end) return `${start} – ${end}`;
  return start || end || "Dates TBC";
}

export interface MatchResult {
  educationLevelMatch: boolean;
  periodWithinIntake: boolean;
  matched: boolean;
}

/**
 * Score a project against a programme's level and an intake's internship months.
 * `periodWithinIntake` is `false` while the intake period is incomplete — we
 * can't confirm containment without both ends.
 */
export function matchProject(
  project: Project,
  programmeLevel: string,
  intakeStart?: MonthValue,
  intakeEnd?: MonthValue,
): MatchResult {
  const educationLevelMatch =
    !!programmeLevel && project.educationLevel === programmeLevel;

  const intakeFrom = monthValueOrdinal(intakeStart);
  const intakeTo = monthValueOrdinal(intakeEnd);
  const projFrom = yearMonthOrdinal(project.internshipStart);
  const projTo = yearMonthOrdinal(project.internshipEnd);

  const periodWithinIntake =
    intakeFrom !== null &&
    intakeTo !== null &&
    projFrom !== null &&
    projTo !== null &&
    projFrom >= intakeFrom &&
    projTo <= intakeTo;

  return {
    educationLevelMatch,
    periodWithinIntake,
    matched: educationLevelMatch && periodWithinIntake,
  };
}
