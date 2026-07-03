import { ChevronDown, Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import { Required } from "~/components/required";

import { DeadlinePicker, SectionLabel } from "./fields";
import {
  AD_PNC,
  EDUCATION_LEVELS,
  PC_HEADS,
  requestSummary,
  type EducationRow,
  type RequestItem,
} from "./model";

/** The −/+ placements stepper. */
function PlacementStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-border">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Decrease placements"
        className="flex size-9 items-center justify-center rounded-l-md text-fg-muted transition-colors hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
      <span className="w-10 text-center text-sm font-medium tabular-nums text-accent">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Increase placements"
        className="flex size-9 items-center justify-center rounded-r-md text-fg-muted transition-colors hover:bg-bg-muted"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function RequestCard({
  request,
  index,
  showErrors,
  onToggleCollapse,
  onToggleSelect,
  onRemove,
  onPcHeadChange,
  onAdPncChange,
  onDeadlineChange,
  onRowChange,
  onAddRow,
  onRemoveRow,
}: {
  request: RequestItem;
  index: number;
  showErrors: boolean;
  onToggleCollapse: () => void;
  onToggleSelect: (selected: boolean) => void;
  onRemove: () => void;
  onPcHeadChange: (value: string) => void;
  onAdPncChange: (value: string) => void;
  onDeadlineChange: (date: Date | undefined) => void;
  onRowChange: (rowId: string, patch: Partial<EducationRow>) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
}) {
  const summary = requestSummary(request);

  return (
    <div className={cn(request.selected && "bg-bg-subtle")}>
      {/* ── Row header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-3">
        <Checkbox
          checked={request.selected}
          onCheckedChange={(checked) => onToggleSelect(Boolean(checked))}
          aria-label={`Select request ${index + 1}`}
        />
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-expanded={!request.collapsed}
          aria-label={request.collapsed ? "Expand request" : "Collapse request"}
          className="text-fg-muted transition-colors hover:text-fg"
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              request.collapsed && "-rotate-90",
            )}
          />
        </button>
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-bg-muted text-xs font-medium text-fg-muted">
          {index + 1}
        </span>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex-1 truncate text-left"
        >
          {summary ? (
            <Text size="sm" weight="medium" className="truncate">
              {summary}
            </Text>
          ) : (
            <Text size="sm" variant="muted" className="truncate">
              Not filled in yet
            </Text>
          )}
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="Delete request"
          className="shrink-0 text-fg-muted hover:text-danger"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {/* ── Detail panel ───────────────────────────────────────────────── */}
      {!request.collapsed ? (
        <div className="space-y-6 px-5 pb-6">
          {/* Recipients */}
          <div className="space-y-4">
            <SectionLabel>Recipients</SectionLabel>
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>
                  PC Head <Required />
                </Label>
                <Select
                  value={request.pcHead ?? ""}
                  onValueChange={(v) => onPcHeadChange((v as string) ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select PC Head" />
                  </SelectTrigger>
                  <SelectContent>
                    {PC_HEADS.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showErrors && !request.pcHead ? (
                  <Text size="xs" className="text-danger">
                    Select a PC Head.
                  </Text>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label>
                  AD (P&amp;C) <Required />
                </Label>
                <Select
                  value={request.adPnc ?? ""}
                  onValueChange={(v) => onAdPncChange((v as string) ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select AD (P&C)" />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_PNC.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showErrors && !request.adPnc ? (
                  <Text size="xs" className="text-danger">
                    Select an AD (P&amp;C).
                  </Text>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label>
                  Response deadline <Required />
                </Label>
                <DeadlinePicker
                  value={request.deadline}
                  onChange={onDeadlineChange}
                />
                {showErrors && !request.deadline ? (
                  <Text size="xs" className="text-danger">
                    Choose a response deadline.
                  </Text>
                ) : null}
              </div>
            </div>
          </div>

          {/* Placement requirements */}
          <div className="space-y-4">
            <SectionLabel>Placement requirements</SectionLabel>

            <div className="space-y-3">
              {/* Column headers — aligned to the recipients grid above so the
                  Education Level select matches the PC Head / AD widths. */}
              <div className="grid gap-5 sm:grid-cols-3">
                <Label className="text-fg-muted">Education Level</Label>
                <Label className="text-fg-muted">Placements</Label>
              </div>

              {request.rows.map((row) => (
                <div key={row.id} className="grid items-start gap-5 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Select
                      value={row.level}
                      onValueChange={(v) =>
                        onRowChange(row.id, { level: (v as string) ?? "" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        {EDUCATION_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showErrors && !row.level ? (
                      <Text size="xs" className="text-danger">
                        Choose an education level.
                      </Text>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <PlacementStepper
                      value={row.placements}
                      onChange={(placements) =>
                        onRowChange(row.id, { placements })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveRow(row.id)}
                      disabled={request.rows.length <= 1}
                      aria-label="Remove education level"
                      className="text-fg-muted hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={onAddRow}>
              <Plus className="size-4" />
              Add education level
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
