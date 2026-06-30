import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Plus,
  RotateCcw,
  Upload,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";

import { Shell, type ShellUser } from "~/components/shell";
import type { Actor } from "~/data";

import { ProjectRowForm, SectionLabel } from "../project-row-form";
import { emptyRow, missingFields, type ProjectRow } from "../upload-data";

/**
 * Upload Projects — the PD P&C (ADPnC) intake surface for submitting a batch of
 * projects against an intake request. A self-contained page that owns its Shell
 * chrome, like every Projects view.
 *
 * Two ways in: drop a completed Excel/CSV template, or enter projects by hand.
 * Each row is one project; education level is set per row (projects are no longer
 * tied to a programme at submission — the IO attaches them to a programme later).
 *
 * Prototype: fully wired client-side, but "Submit" does not persist — it toasts
 * and returns to the submission queue. Swap in a `projectSubmissionsRepository`
 * action when one exists.
 */

export interface UploadProjectsViewProps {
  actor: Actor;
  user: ShellUser;
}

export function UploadProjectsView({ actor, user }: UploadProjectsViewProps) {
  const navigate = useNavigate();

  // Two modes: the intake landing (template + dropzone), and the manual editor.
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [declared, setDeclared] = useState(false);

  const inForm = rows.length > 0;
  const totalMissing = useMemo(
    () => rows.reduce((sum, row) => sum + missingFields(row), 0),
    [rows],
  );
  const projectsWithGaps = useMemo(
    () => rows.filter((row) => missingFields(row) > 0).length,
    [rows],
  );
  const canSubmit = inForm && totalMissing === 0 && declared;

  function addRow() {
    const row = emptyRow();
    setRows((prev) => [...prev, row]);
    setActiveTab(row.id);
  }

  function patchRow(id: string, patch: Partial<ProjectRow>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function removeRow(id: string) {
    setRows((prev) => {
      const next = prev.filter((row) => row.id !== id);
      if (id === activeTab) setActiveTab(next[0]?.id ?? "");
      return next;
    });
  }

  function resetToLanding() {
    setRows([]);
    setActiveTab("");
    setDeclared(false);
  }

  function handleSubmit() {
    if (!canSubmit) return;
    // Placeholder: persistence isn't wired up yet.
    // eslint-disable-next-line no-console
    console.log("Submit projects (placeholder):", rows);
    toast.add({
      title: "Projects submitted",
      description: "This is a placeholder — nothing was persisted yet.",
      type: "success",
    });
    setTimeout(() => navigate("/projects"), 600);
  }

  const activeRowIndex = rows.findIndex((row) => row.id === activeTab);
  const activeRow = rows[activeRowIndex] ?? rows[0];

  return (
    <Shell
      actor={actor}
      user={user}
      workstream="Internship"
      title="Upload Projects"
      actions={
        inForm ? (
          <>
            <Button type="button" variant="outline" size="sm" onClick={resetToLanding}>
              <RotateCcw className="size-4" />
              Replace file
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              <Plus className="size-4" />
              Add row
            </Button>
          </>
        ) : undefined
      }
    >
      <div className="mb-5">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-4" />
          Back to Submission Requests
        </Link>
      </div>

      {!inForm ? (
        <Card>
          <CardContent className="space-y-6 p-6">
            {/* Intent banner */}
            <div className="rounded-lg border border-accent/30 bg-accent-subtle/50 p-4">
              <Text size="sm" weight="semibold" className="text-accent">
                Submit by Education Level
              </Text>
              <Text size="sm" variant="muted" className="mt-1">
                Set the <span className="font-medium text-fg">Education Level</span> for
                each project row. Projects are no longer tied to a programme at submission —
                the IO attaches approved projects to a programme when they create one.
              </Text>
            </div>

            {/* Step 1 — template */}
            <div className="flex flex-col gap-3 rounded-lg bg-bg-subtle p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Text size="sm" weight="semibold">
                  Step 1 — Download the project template
                </Text>
                <Text size="sm" variant="muted" className="mt-1">
                  Fill in the Excel template. Each row is one project. After uploading,
                  select the student level(s) for each row in the form.
                </Text>
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                onClick={() =>
                  toast.add({
                    title: "Template",
                    description: "Template download is coming soon.",
                    type: "info",
                  })
                }
              >
                <Download className="size-4" />
                Download Template
              </Button>
            </div>

            {/* Step 2 — upload */}
            <div className="space-y-3">
              <Text size="sm" weight="semibold">
                Step 2 — Upload your completed file
              </Text>
              <button
                type="button"
                onClick={() =>
                  toast.add({
                    title: "Upload",
                    description: "File parsing is coming soon — use manual entry below.",
                    type: "info",
                  })
                }
                className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border px-6 py-12 text-center transition-colors hover:border-accent hover:bg-accent-subtle/30"
              >
                <span className="flex size-12 items-center justify-center rounded-lg bg-accent-subtle text-accent">
                  <FileSpreadsheet className="size-6" />
                </span>
                <Text size="sm" weight="semibold">
                  Upload your completed template
                </Text>
                <Text size="sm" variant="muted">
                  Drag and drop or click to browse · .xlsx / .xls / .csv
                </Text>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <Text size="sm" variant="muted">
                or enter projects manually
              </Text>
              <Separator className="flex-1" />
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={addRow}>
              <Plus className="size-4" />
              Add projects manually
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <Text size="sm" weight="medium">
              {rows.length} {rows.length === 1 ? "project" : "projects"}
            </Text>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              {rows.map((row, i) => (
                <TabsTrigger key={row.id} value={row.id} className="gap-2">
                  <Badge variant="subtle" className="tabular-nums">
                    {i + 1}
                  </Badge>
                  {row.title.trim() || "Untitled"}
                </TabsTrigger>
              ))}
              <button
                type="button"
                onClick={addRow}
                aria-label="Add project"
                className="ml-1 inline-flex size-8 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
              >
                <Plus className="size-4" />
              </button>
            </TabsList>
          </Tabs>

          {activeRow ? (
            <ProjectRowForm
              row={activeRow}
              onChange={(patch) => patchRow(activeRow.id, patch)}
              onRemove={() => removeRow(activeRow.id)}
              canRemove={rows.length > 1}
            />
          ) : null}

          {totalMissing > 0 ? (
            <Text size="sm" className="text-center text-danger">
              {totalMissing} required {totalMissing === 1 ? "field" : "fields"} still
              missing across {projectsWithGaps}{" "}
              {projectsWithGaps === 1 ? "project" : "projects"}. Fix the highlighted fields
              above before submitting.
            </Text>
          ) : null}

          {/* Declaration */}
          <Card>
            <CardContent className="p-6">
              <SectionLabel>Declaration</SectionLabel>
              <Separator className="my-4" />
              <label className="flex items-start gap-3">
                <Checkbox
                  checked={declared}
                  onCheckedChange={(checked) => setDeclared(checked === true)}
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <Text size="sm" weight="medium">
                    I confirm that:
                  </Text>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>
                      <Text as="span" size="sm" variant="muted">
                        Necessary security clearance has been obtained for all projects
                        included in this submission
                      </Text>
                    </li>
                    <li>
                      <Text as="span" size="sm" variant="muted">
                        All projects have received endorsement from the respective PC
                        Head(s) prior to submission
                      </Text>
                    </li>
                  </ul>
                </div>
              </label>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button
              type="button"
              className="w-full"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              <Upload className="size-4" />
              Submit {rows.length} {rows.length === 1 ? "Project" : "Projects"} to IO
            </Button>
            {!canSubmit ? (
              <Text size="sm" variant="muted" className="text-center">
                {totalMissing > 0
                  ? "Fix all required fields above before submitting."
                  : "Tick the declaration above before submitting."}
              </Text>
            ) : null}
          </div>
        </div>
      )}
    </Shell>
  );
}
