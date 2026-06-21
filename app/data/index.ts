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

// Repositories (example — replace with real ones)
export {
  applicationsRepository,
  ApplicationSchema,
  APPLICATION_STATUSES,
  draftApplication,
  type Application,
} from "./repositories/applications";
