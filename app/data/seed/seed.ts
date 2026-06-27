import type { Actor } from "../access/actor";
import { ROLES } from "../access/roles";
import type { Repository } from "../repository";
import { programmesRepository, type Programme } from "../repositories/programmes";
import { intakesRepository, type Intake } from "../repositories/intakes";
import { projectsRepository, type Project } from "../repositories/projects";
import {
  projectRequestsRepository,
  type ProjectRequest,
} from "../repositories/project-requests";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Demo seed — first-run mock data for the localStorage backend.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Idempotent: each resource is seeded only when its collection is empty, and
 *  everything goes through the repositories (so authorisation + zod validation
 *  still apply). Call `seedIfEmpty` from CLIENT code only (effects/handlers) —
 *  localStorage is browser-only. Ids are stable so cross-references (intake →
 *  programme, project → intake) hold and re-running is a no-op.
 */

/** The identity the seed acts as — an IO Admin may create every resource. */
export const SEED_ACTOR: Actor = { id: "ioadmin-tan", role: ROLES.ioAdmin };

/** Fixed stamp so seeded records are deterministic across runs. */
const STAMP = "2026-01-06T09:00:00.000Z";

const PROGRAMMES: Programme[] = [
  {
    id: "prog-uni-2026",
    educationLevel: "University",
    year: 2026,
    title: "University 2026",
    description: "Undergraduate internship cohort for AY2026.",
    createdBy: SEED_ACTOR.id,
    createdAt: STAMP,
  },
  {
    id: "prog-poly-2026",
    educationLevel: "Polytechnic",
    year: 2026,
    title: "Polytechnic 2026",
    description: "Polytechnic internship cohort for AY2026.",
    createdBy: SEED_ACTOR.id,
    createdAt: STAMP,
  },
];

const INTAKES: Intake[] = [
  {
    id: "intake-uni-jan",
    programmeId: "prog-uni-2026",
    intakeTitle: "Jan–Jun 2026",
    internshipStart: "2026-01-01",
    internshipEnd: "2026-06-30",
    applicationOpen: "2025-11-01",
    applicationClose: "2025-12-15",
    status: "open",
    durationMonths: 6,
    createdBy: SEED_ACTOR.id,
    createdAt: STAMP,
  },
  {
    id: "intake-uni-jun",
    programmeId: "prog-uni-2026",
    intakeTitle: "Jun–Dec 2026",
    internshipStart: "2026-06-01",
    internshipEnd: "2026-12-31",
    applicationOpen: "2026-03-01",
    applicationClose: "2026-04-15",
    status: "draft",
    durationMonths: 7,
    createdBy: SEED_ACTOR.id,
    createdAt: STAMP,
  },
];

const PROJECTS: Project[] = [
  {
    id: "proj-chatbot",
    intakeId: "intake-uni-jan",
    pcCode: "PC11",
    educationLevel: "University",
    title: "AI Customer Chatbot",
    scope: "Build a retrieval-augmented support assistant.",
    placements: 2,
    internshipStart: "2026-01-01",
    internshipEnd: "2026-06-30",
    durationMonths: 6,
    mentorName: "Dr Aisha Rahman",
    mentorEmail: "aisha@example.gov.sg",
    mentorDesignation: "Principal Engineer",
    mentorWriteup: "",
    disciplineOfStudy: ["Computer Science"],
    skills: ["Python", "Machine Learning"],
    techDomain: "Data & AI",
    emergingAreas: "Artificial Intelligence",
    reviewStatus: "approved",
    reviewedBy: "ioadmin-tan",
    createdBy: "adpnc-lee",
    createdAt: STAMP,
  },
  {
    id: "proj-pipeline",
    intakeId: null,
    pcCode: "PC11",
    educationLevel: "University",
    title: "Data Pipeline Automation",
    scope: "Automate ingestion and validation for analytics.",
    placements: 1,
    internshipStart: "2026-02-01",
    internshipEnd: "2026-07-31",
    durationMonths: 6,
    mentorName: "Marcus Tan",
    mentorEmail: "marcus@example.gov.sg",
    mentorDesignation: "Senior Data Engineer",
    mentorWriteup: "",
    disciplineOfStudy: ["Data Science"],
    skills: ["Data Engineering"],
    techDomain: "Data & AI",
    emergingAreas: null,
    reviewStatus: "pending",
    reviewedBy: null,
    createdBy: "adpnc-lee",
    createdAt: STAMP,
  },
  {
    id: "proj-robotics",
    intakeId: null,
    pcCode: "PC03",
    educationLevel: "University",
    title: "Robotics R&D",
    scope: "Prototype perception for an autonomous platform.",
    placements: 2,
    internshipStart: "2026-01-01",
    internshipEnd: "2026-05-31",
    durationMonths: 5,
    mentorName: "Wei Ling Koh",
    mentorEmail: "weiling@example.gov.sg",
    mentorDesignation: "Lead Roboticist",
    mentorWriteup: "",
    disciplineOfStudy: ["Computer Engineering"],
    skills: ["Robotics", "C++"],
    techDomain: "Robotics",
    emergingAreas: "Autonomy",
    reviewStatus: "approved",
    reviewedBy: "ioadmin-tan",
    createdBy: "adpnc-lee",
    createdAt: STAMP,
  },
];

const REQUESTS: ProjectRequest[] = [
  {
    id: "req-pc11-2026",
    pcCode: "PC11",
    toRecipients: ["pchead.pc11@example.gov.sg"],
    ccRecipients: ["adpnc-lee@example.gov.sg"],
    lines: [
      { educationLevel: "University", placementsRequested: 3 },
      { educationLevel: "Polytechnic", placementsRequested: 2 },
    ],
    year: 2026,
    createdBy: SEED_ACTOR.id,
    createdAt: STAMP,
  },
];

/** Seed one collection only if the actor currently sees nothing in it. */
async function seedCollection<T>(repo: Repository<T>, records: T[]): Promise<void> {
  const bound = repo.as(SEED_ACTOR);
  const existing = await bound.list();
  if (existing.ok && existing.data.length > 0) return;
  for (const record of records) await bound.create(record);
}

/**
 * Populate the demo data on first run. Safe to call on every mount — empty
 * checks make it a no-op once seeded.
 */
export async function seedIfEmpty(): Promise<void> {
  await seedCollection(programmesRepository, PROGRAMMES);
  await seedCollection(intakesRepository, INTAKES);
  await seedCollection(projectsRepository, PROJECTS);
  await seedCollection(projectRequestsRepository, REQUESTS);
}
