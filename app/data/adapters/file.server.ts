import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { setAdapter } from "../config";
import type { StorageAdapter } from "./adapter";

/**
 * File-backed adapter — a **persistent** server backend for development.
 *
 * It is the missing middle between the two adapters that ship:
 *  - `memory` persists nothing (vanishes when the process restarts);
 *  - `local-storage` persists, but only in the browser, so it never matches what
 *    a React Router loader/action sees on the server.
 *
 * This adapter writes every collection to ONE JSON file on disk, shaped
 * `{ "<collection>": { "<id>": record } }` — the same per-collection layout the
 * localStorage adapter uses, just on the filesystem. Because it lives on the
 * server, loaders/actions can read and write it and the data survives a
 * `react-router dev` restart. It is a real, zero-setup "test database": no
 * service to run, just a file you can open and inspect.
 *
 * ── Why `.server.ts` ──────────────────────────────────────────────────────────
 * This module imports `node:fs`, which must never reach the browser bundle. The
 * `.server` suffix makes React Router/Vite treat it as server-only and error if
 * client code imports it. So it is deliberately NOT re-exported from `~/data`
 * (that barrel is client-reachable); import it directly from a loader/action.
 *
 * ── Scope ─────────────────────────────────────────────────────────────────────
 * Single-process, read-modify-write per call, synchronous fs. Perfect for a dev
 * tool; not a concurrent production store. When the real backend arrives, write
 * an `http`/`db` adapter and swap it in `config.ts` — nothing above changes.
 */

/** Default location for the dev database. Gitignored; safe to delete to reset. */
const DEFAULT_DB_PATH = resolve(process.cwd(), ".data", "dev-db.json");

type Db = Record<string, Record<string, unknown>>;

export function createFileAdapter(filePath: string = DEFAULT_DB_PATH): StorageAdapter {
  function readDb(): Db {
    if (!existsSync(filePath)) return {};
    try {
      const parsed = JSON.parse(readFileSync(filePath, "utf8"));
      return parsed && typeof parsed === "object" ? (parsed as Db) : {};
    } catch {
      // Corrupt file — treat as empty rather than wedging every read. The next
      // write overwrites it with a valid document.
      return {};
    }
  }

  function writeDb(db: Db): void {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, JSON.stringify(db, null, 2), "utf8");
  }

  function collectionOf(db: Db, collection: string): Record<string, unknown> {
    return db[collection] ?? {};
  }

  /** Clone in/out so callers can't mutate stored state via a held reference. */
  function clone<T>(value: T): T {
    return structuredClone(value);
  }

  return {
    name: "file",

    async get(collection, id) {
      const records = collectionOf(readDb(), collection);
      return Object.prototype.hasOwnProperty.call(records, id) ? clone(records[id]) : null;
    },

    async list(collection) {
      return Object.values(collectionOf(readDb(), collection)).map(clone);
    },

    async put(collection, id, value) {
      const db = readDb();
      const records = collectionOf(db, collection);
      records[id] = clone(value);
      db[collection] = records;
      writeDb(db);
    },

    async remove(collection, id) {
      const db = readDb();
      const records = collectionOf(db, collection);
      delete records[id];
      db[collection] = records;
      writeDb(db);
    },

    async clear(collection) {
      const db = readDb();
      delete db[collection];
      writeDb(db);
    },
  };
}

/**
 * The process-wide file adapter, memoised. A loader/action calls
 * `setAdapter(getFileAdapter())` to make repositories persist to disk for the
 * rest of the server process — see `app/routes/dev.db.tsx`.
 */
let cached: StorageAdapter | null = null;
export function getFileAdapter(): StorageAdapter {
  if (!cached) cached = createFileAdapter();
  return cached;
}

/**
 * Make repositories persist to the file backend for the rest of this server
 * process. Call it at the top of any server-only loader/action that touches the
 * data layer (the dev pages, the auth resolver) so they all share one store.
 */
export function usePersistentBackend(): void {
  setAdapter(getFileAdapter());
}
