/**
 * Public entry point for the data access layer.
 *
 * Import from here (`~/data`) rather than reaching into submodules, so the
 * internal layout can change without churning call sites.
 *
 * See `llms.txt` in this folder for the rules and how-tos before extending it.
 */

// Result / error model
export {
  type Result,
  type DataError,
  type DataErrorCode,
  ok,
  err,
  isOk,
} from "./types";

// Access control
export { ROLES, ALL_ROLES, ROLE_LABELS, isRole, type Role } from "./access/roles";
export { type Actor, type MaybeActor, ANONYMOUS, isAuthenticated } from "./access/actor";
export { type Action, type Rule, type Policy, POLICY, owns, createdByOwns } from "./access/permissions";
export { can, authorize } from "./access/guard";

// Repository factory + storage seam
export {
  createRepository,
  newId,
  type Repository,
  type BoundRepository,
  type RepositoryConfig,
} from "./repository";
export { getAdapter, setAdapter } from "./config";
export { type StorageAdapter } from "./adapters/adapter";
export { createMemoryAdapter } from "./adapters/memory";
export { createLocalStorageAdapter } from "./adapters/local-storage";

// Repositories
export {
  applicationsRepository,
  ApplicationSchema,
  APPLICATION_STATUSES,
  draftApplication,
  type Application,
} from "./repositories/applications";
export {
  programmesRepository,
  ProgrammeSchema,
  EDUCATION_LEVELS,
  makeProgramme,
  type Programme,
  type EducationLevel,
} from "./repositories/programmes";
export {
  intakesRepository,
  IntakeSchema,
  INTAKE_STATUSES,
  makeIntake,
  intakeDurationMonths,
  intakeTitleFromPeriod,
  type Intake,
  type IntakeStatus,
} from "./repositories/intakes";
export {
  projectsRepository,
  ProjectSchema,
  PROJECT_REVIEW_STATUSES,
  DISCIPLINES,
  SKILLS,
  TECH_DOMAINS,
  EMERGING_AREAS,
  attachableToIntake,
  makeProject,
  type Project,
  type ProjectReviewStatus,
  type Discipline,
  type Skill,
  type TechDomain,
  type EmergingArea,
} from "./repositories/projects";
export {
  projectRequestsRepository,
  ProjectRequestSchema,
  ProjectRequestLineSchema,
  fulfilmentFor,
  makeProjectRequest,
  type ProjectRequest,
  type ProjectRequestLine,
  type LineFulfilment,
} from "./repositories/project-requests";

// Seeding (client-only — calls repositories, which touch localStorage)
export { seedIfEmpty, SEED_ACTOR } from "./seed/seed";
