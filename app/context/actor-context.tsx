import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ROLES, isRole, type Actor, type Role } from "~/data";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Actor context — who the app is currently acting as.
 * ─────────────────────────────────────────────────────────────────────────────
 *  This is a MOCK auth seam. There is no sign-in yet, so a dev role-switcher in
 *  the top bar picks the acting role; the chosen role maps to a preset Actor that
 *  every data-layer call uses (`repo.as(actor)`). When real auth arrives, this
 *  provider is the single place that resolves the Actor.
 *
 *  Hydration-safe: it renders a deterministic default on the server and first
 *  client paint, then reads the persisted role from localStorage AFTER mount.
 */

const STORAGE_KEY = "toa:dev-actor-role";

/** Roles selectable in this phase, with a stable preset identity for each. */
export const ROLE_PRESETS: { role: Role; actor: Actor }[] = [
  { role: ROLES.ioAdmin, actor: { id: "ioadmin-tan", role: ROLES.ioAdmin } },
  { role: ROLES.adPnc, actor: { id: "adpnc-lee", role: ROLES.adPnc } },
];

/** Display names for the preset identities (top-bar avatar / menu). */
export const ACTOR_NAMES: Record<string, string> = {
  "ioadmin-tan": "Celine Tan",
  "adpnc-lee": "David Lee",
};

const DEFAULT_ROLE: Role = ROLES.ioAdmin;

function actorFor(role: Role): Actor {
  return ROLE_PRESETS.find((p) => p.role === role)?.actor ?? ROLE_PRESETS[0].actor;
}

interface ActorContextValue {
  actor: Actor;
  role: Role;
  /** Switch the acting role (persisted to localStorage). */
  setRole: (role: Role) => void;
  /** False until the persisted role has been read on the client. */
  ready: boolean;
}

const ActorContext = createContext<ActorContextValue | null>(null);

export function ActorProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(DEFAULT_ROLE);
  const [ready, setReady] = useState(false);

  // Read the persisted role once, after mount — never during SSR.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isRole(stored)) setRoleState(stored);
    } catch {
      /* ignore unavailable storage */
    }
    setReady(true);
  }, []);

  const setRole = useCallback((next: Role) => {
    setRoleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore unavailable storage */
    }
  }, []);

  const value = useMemo<ActorContextValue>(
    () => ({ actor: actorFor(role), role, setRole, ready }),
    [role, setRole, ready],
  );

  return <ActorContext.Provider value={value}>{children}</ActorContext.Provider>;
}

/** Access the current actor. Must be used within an `ActorProvider`. */
export function useActor(): ActorContextValue {
  const ctx = useContext(ActorContext);
  if (!ctx) throw new Error("useActor must be used within an ActorProvider.");
  return ctx;
}
