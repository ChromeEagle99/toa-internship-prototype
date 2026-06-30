import type { MonthValue } from "~/components/month-picker";

/**
 * Upload Projects — the per-project row model, validation, and pick-lists.
 *
 * Option sets are provisional, mirroring `projects.new`. Swap for the real
 * taxonomies (and a PC repository) once they're defined.
 */

// ── Option sets ──────────────────────────────────────────────────────────────

export const EDUCATION_LEVELS = [
  "Junior College",
  "Polytechnic",
  "University (Undergraduate)",
  "University (Postgraduate)",
] as const;

export const PROGRAMME_CENTRES = [
  "C4I Development",
  "Cybersecurity Programme Centre",
  "Digital Hub",
  "Enterprise IT",
  "Guided Systems",
  "Sensors Programme Centre",
] as const;

export const TECH_DOMAINS = [
  "Artificial Intelligence",
  "Cybersecurity",
  "Data Science & Analytics",
  "Software Engineering",
  "Systems Engineering",
  "Robotics & Autonomous Systems",
] as const;

export const EMERGING_AREAS = [
  "Generative AI",
  "Quantum Technologies",
  "Edge Computing",
  "Digital Twins",
  "Zero Trust Architecture",
] as const;

export const DISCIPLINES = [
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

export const DURATIONS = ["3 Months", "6 Months", "12 Months"] as const;

// ── Per-project row model ────────────────────────────────────────────────────

export interface ProjectRow {
  /** Stable client id for keys and tab state. */
  id: string;
  educationLevel: string;
  title: string;
  scope: string;
  disciplines: string[];
  skills: string;
  pc: string;
  techDomain: string;
  emergingArea: string;
  mentorName: string;
  mentorAppointment: string;
  mentorWriteup: string;
  duration: string;
  startMonth?: MonthValue;
  endMonth?: MonthValue;
  placements: string;
}

let rowSeq = 0;
export function emptyRow(): ProjectRow {
  rowSeq += 1;
  return {
    id: `row-${rowSeq}`,
    educationLevel: "",
    title: "",
    scope: "",
    disciplines: [],
    skills: "",
    pc: "",
    techDomain: "",
    emergingArea: "",
    mentorName: "",
    mentorAppointment: "",
    mentorWriteup: "",
    duration: "3 Months",
    startMonth: undefined,
    endMonth: undefined,
    placements: "1",
  };
}

/** The required fields still blank on a row. Drives the validation summary. */
export function missingFields(row: ProjectRow): number {
  let missing = 0;
  if (!row.educationLevel) missing += 1;
  if (!row.title.trim()) missing += 1;
  if (!row.scope.trim()) missing += 1;
  if (row.disciplines.length === 0) missing += 1;
  if (!row.skills.trim()) missing += 1;
  if (!row.pc) missing += 1;
  if (!row.techDomain) missing += 1;
  if (!row.emergingArea) missing += 1;
  if (!row.mentorName.trim()) missing += 1;
  if (!row.mentorAppointment.trim()) missing += 1;
  if (!row.mentorWriteup.trim()) missing += 1;
  if (!row.duration) missing += 1;
  if (!row.startMonth) missing += 1;
  if (!row.endMonth) missing += 1;
  if (!row.placements.trim() || Number(row.placements) < 1) missing += 1;
  return missing;
}
