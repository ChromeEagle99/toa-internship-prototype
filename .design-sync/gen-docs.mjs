#!/usr/bin/env node
// Generate per-component docs for the design-sync package shape.
//
// PRIZM is vendored as flat named exports in a single `components/ui` dir, so
// synth-entry discovery lands every component (including compound sub-parts like
// CardHeader) in one "general" group. This script gives each discovered
// component a doc file carrying:
//   - `category:` frontmatter (drives the Claude Design pane grouping), mapped
//     from the PRIZM category structure in llms.txt;
//   - a body: the real PRIZM `llms/<slug>.md` documentation for the primary
//     component of each file, or a short pointer for its sub-parts.
//
// Output: `.design-sync/docs/<ComponentName>.md`, matched by cfg.docsDir. Files
// are named by exact export name; the converter matches them by slug
// (lowercased, non-alnum stripped), so CardHeader.md -> CardHeader. Regenerated
// from source on every sync (wired into cfg.buildCmd), so it never goes stale.

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, ".design-sync", "docs");
const LLMS = join(ROOT, "llms");

// file-basename slug -> Claude Design pane category (from llms.txt).
const CATEGORY = {
  button: "Actions",
  input: "Forms", textarea: "Forms", checkbox: "Forms", "radio-group": "Forms",
  switch: "Forms", select: "Forms", combobox: "Forms", slider: "Forms",
  label: "Forms", field: "Forms",
  badge: "Data display", avatar: "Data display", table: "Data display",
  calendar: "Data display", kbd: "Data display", code: "Data display",
  card: "Layout", separator: "Layout", frame: "Layout", group: "Layout", stack: "Layout",
  alert: "Feedback", toast: "Feedback", progress: "Feedback", spinner: "Feedback",
  skeleton: "Feedback", "empty-state": "Feedback",
  tabs: "Navigation", breadcrumb: "Navigation", pagination: "Navigation",
  "navigation-menu": "Navigation", command: "Navigation", link: "Navigation",
  dialog: "Overlay", sheet: "Overlay", popover: "Overlay", tooltip: "Overlay",
  menu: "Overlay", "context-menu": "Overlay", "hover-card": "Overlay",
  heading: "Typography", text: "Typography", prose: "Typography",
};
// Slugs to "rc3" to merge with the src-dir-derived group for components/rc3/
// (a non-generic dir name the doc category can't otherwise override).
const RC3_CATEGORY = "RC3";

// Source dirs to scan, and exports to skip (excluded from the sync).
const DIRS = ["components/ui", "components/rc3"];
const EXCLUDE = new Set(["RC3Swatch", "AutonomyModeSelectorDemo", "PerceptionViewDemo"]);

const slug = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
const exportRx = /export\s+(?:const|function|class)\s+([A-Z][A-Za-z0-9]*)\b/g;

function llmsBody(fileSlug) {
  const p = join(LLMS, `${fileSlug}.md`);
  if (!existsSync(p)) return null;
  // Strip the doc's own frontmatter (handle CRLF); we write our own.
  return readFileSync(p, "utf8").replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
}

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let written = 0;
for (const dir of DIRS) {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) continue;
  const isRc3 = dir.endsWith("rc3");
  for (const file of readdirSync(abs)) {
    if (!file.endsWith(".tsx")) continue;
    const fileSlug = basename(file, ".tsx"); // kebab, e.g. radio-group
    const category = isRc3 ? RC3_CATEGORY : (CATEGORY[fileSlug] ?? "Components");
    const src = readFileSync(join(abs, file), "utf8");
    const names = [...src.matchAll(exportRx)].map((m) => m[1]).filter((n) => !EXCLUDE.has(n));
    if (!names.length) continue;
    // Primary = the export whose slug matches the file slug (Card <- card.tsx).
    const primary = names.find((n) => slug(n) === slug(fileSlug)) ?? names[0];
    const body = isRc3 ? null : llmsBody(fileSlug);
    for (const name of names) {
      const fm = `---\ncategory: ${category}\n---\n\n`;
      let content;
      if (name === primary && body) {
        content = fm + body + "\n";
      } else if (name === primary) {
        content = fm + `# ${name}\n\nPart of the PRIZM 4.0 ${category} components.\n`;
      } else {
        content = fm + `# ${name}\n\nSubcomponent of \`${primary}\`. See the \`${primary}\` documentation for usage.\n`;
      }
      writeFileSync(join(OUT, `${name}.md`), content);
      written++;
    }
  }
}
console.error(`gen-docs: wrote ${written} component docs to .design-sync/docs/`);
