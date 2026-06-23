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
export { type Action, type Rule, type Policy, POLICY, owns } from "./access/permissions";
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
// Note: the file backend lives in `adapters/file.server.ts` and is server-only;
// import `getFileAdapter` / `usePersistentBackend` directly from there.

// Repositories (example — replace with real ones)
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
  PROG_CATEGORIES,
  PROG_STATUSES,
  exampleProgramme,
  type Programme,
  type ProgCategory,
  type ProgStatus,
  type CriteriaGroup,
  type CriteriaPathway,
  type CriteriaRule,
  type IntakeWindow,
} from "./repositories/programmes";

export {
  projectsRepository,
  ProjectEntrySchema,
  PROJECT_STATUSES,
  exampleProject,
  type ProjectEntry,
  type ProjectStatus,
  type BlackoutPeriod,
} from "./repositories/projects";

export {
  usersRepository,
  UserSchema,
  exampleUsers,
  ensureUsersSeeded,
  resolveUser,
  listUsers,
  type User,
} from "./repositories/users";
