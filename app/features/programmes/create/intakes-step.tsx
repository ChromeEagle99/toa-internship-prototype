import { Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import { DateRangePicker, formatRange } from "~/components/date-range-picker";
import { MonthPicker } from "~/components/month-picker";
import type { Project } from "~/data";

import { ProjectAssignment } from "./project-assignment";
import type { IntakeDraft } from "./types";
import { FieldBlock, SectionHeader, monthRangeLabel } from "./ui";

export interface IntakesStepProps {
  intakes: IntakeDraft[];
  /** projectId → intakeId. */
  assignments: Record<string, string>;
  selectedIntakeId: string;
  selectedIntake: IntakeDraft | null;
  selectedIndex: number;
  projects: Project[];
  educationLevel: string;
  onSelectIntake: (id: string) => void;
  onAddIntake: () => void;
  onRemoveIntake: (id: string) => void;
  onPatchIntake: (id: string, patch: Partial<IntakeDraft>) => void;
  onAssign: (projectId: string) => void;
  onUnassign: (projectId: string) => void;
}

/**
 * Step 2 — a list of intakes on the left (each with its application window and
 * internship period), and the project pool for the selected intake on the right.
 */
export function IntakesStep({
  intakes,
  assignments,
  selectedIntakeId,
  selectedIntake,
  selectedIndex,
  projects,
  educationLevel,
  onSelectIntake,
  onAddIntake,
  onRemoveIntake,
  onPatchIntake,
  onAssign,
  onUnassign,
}: IntakesStepProps) {
  return (
    <div>
      <SectionHeader>Intakes</SectionHeader>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: intake list */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Text as="p" size="sm" weight="semibold">
                Intakes
              </Text>
              <Text as="p" size="xs" variant="muted">
                {intakes.length} intake{intakes.length === 1 ? "" : "s"} — click one to see
                matching projects
              </Text>
            </div>
            <Button variant="outline" size="sm" onClick={onAddIntake}>
              <Plus className="size-4" />
              Add
            </Button>
          </div>

          {intakes.map((intake, index) => {
            const selected = intake.id === selectedIntakeId;
            const assignedCount = Object.values(assignments).filter(
              (id) => id === intake.id,
            ).length;
            const hasWindow = intake.applicationWindow.from && intake.applicationWindow.to;
            return (
              <div
                key={intake.id}
                onClick={() => onSelectIntake(intake.id)}
                className={cn(
                  "cursor-pointer rounded-lg border p-4 transition-colors",
                  selected ? "border-accent ring-1 ring-accent/20" : "border-border",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Text as="p" size="sm" weight="semibold" className="truncate">
                      Intake {index + 1} · {monthRangeLabel(intake)}
                    </Text>
                    <Text as="p" size="xs" variant="muted" className="truncate">
                      {hasWindow
                        ? `Applications: ${formatRange(intake.applicationWindow)}`
                        : "Set application window"}
                    </Text>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="subtle">{assignedCount}</Badge>
                    {intakes.length > 1 ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-fg-muted hover:text-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveIntake(intake.id);
                        }}
                        aria-label={`Remove intake ${index + 1}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>

                {selected ? (
                  <div className="mt-4 space-y-4" onClick={(e) => e.stopPropagation()}>
                    <FieldBlock
                      label="Application Window"
                      hint="Pick the day applications open, then the day they close."
                      required
                    >
                      <DateRangePicker
                        value={intake.applicationWindow}
                        onChange={(range) => onPatchIntake(intake.id, { applicationWindow: range })}
                        placeholder="Pick the application dates"
                        className="w-full"
                      />
                    </FieldBlock>

                    <FieldBlock
                      label="Internship Period"
                      hint="Pick the month the internship begins, then the month it ends."
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <MonthPicker
                          value={intake.internshipStart}
                          onChange={(value) =>
                            onPatchIntake(intake.id, { internshipStart: value })
                          }
                          placeholder="Start month"
                        />
                        <MonthPicker
                          value={intake.internshipEnd}
                          onChange={(value) => onPatchIntake(intake.id, { internshipEnd: value })}
                          min={intake.internshipStart}
                          placeholder="End month"
                        />
                      </div>
                    </FieldBlock>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Right: project assignment */}
        <div className="lg:col-span-2">
          <ProjectAssignment
            intake={selectedIntake}
            intakeIndex={selectedIndex}
            projects={projects}
            educationLevel={educationLevel}
            assignments={assignments}
            onAssign={onAssign}
            onUnassign={onUnassign}
          />
        </div>
      </div>
    </div>
  );
}
