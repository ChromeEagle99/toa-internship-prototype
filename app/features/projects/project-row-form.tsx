import { Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

import { MonthPicker } from "~/components/month-picker";
import { MultiSelect } from "~/components/multi-select";
import { Required } from "~/components/required";

import {
  DISCIPLINES,
  DURATIONS,
  EDUCATION_LEVELS,
  EMERGING_AREAS,
  PROGRAMME_CENTRES,
  TECH_DOMAINS,
  type ProjectRow,
} from "./upload-data";

// ── Small presentational helpers ─────────────────────────────────────────────

/** An uppercase micro-heading for a form section. */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      as="p"
      size="xs"
      weight="semibold"
      variant="subtle"
      className="uppercase tracking-wide"
    >
      {children}
    </Text>
  );
}

/** The AI "Generate" affordance — decorative in the prototype. */
function GenerateButton({ onGenerate }: { onGenerate: () => void }) {
  return (
    <Button type="button" size="sm" variant="solid" onClick={onGenerate}>
      <Sparkles className="size-4" />
      Generate
    </Button>
  );
}

/** A labelled native-style Select wired to a controlled string value. */
function SelectField({
  label,
  value,
  onValueChange,
  placeholder,
  options,
}: {
  label: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: readonly string[];
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(v) => onValueChange((v as string) ?? "")}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ── The single-project form ──────────────────────────────────────────────────

export function ProjectRowForm({
  row,
  onChange,
  onRemove,
  canRemove,
}: {
  row: ProjectRow;
  onChange: (patch: Partial<ProjectRow>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center justify-between gap-3">
          <Text size="sm" variant="muted">
            New project — fill in the details below
          </Text>
          {canRemove ? (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
              <Trash2 className="size-4" />
              Remove
            </Button>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label>
            Education Level <Required />
          </Label>
          <Select
            value={row.educationLevel}
            onValueChange={(v) => onChange({ educationLevel: (v as string) ?? "" })}
          >
            <SelectTrigger className="sm:max-w-xs">
              <SelectValue placeholder="— Select —" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <SectionLabel>Project Details</SectionLabel>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={`title-${row.id}`}>
              Project Title <Required />
            </Label>
            <GenerateButton
              onGenerate={() =>
                toast.add({
                  title: "AI assist",
                  description: "Title generation is coming soon.",
                  type: "info",
                })
              }
            />
          </div>
          <Input
            id={`title-${row.id}`}
            value={row.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g. Cybersecurity Threat Analysis"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={`scope-${row.id}`}>
              Project Scope <Required />
            </Label>
            <GenerateButton
              onGenerate={() =>
                toast.add({
                  title: "AI assist",
                  description: "Scope generation is coming soon.",
                  type: "info",
                })
              }
            />
          </div>
          <Textarea
            id={`scope-${row.id}`}
            rows={5}
            value={row.scope}
            onChange={(e) => onChange({ scope: e.target.value })}
            placeholder="Describe what the intern will do, tools they will use, and expected deliverables…"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor={`disciplines-${row.id}`}>
              Discipline of Study <Required />
            </Label>
            <MultiSelect
              id={`disciplines-${row.id}`}
              options={DISCIPLINES}
              value={row.disciplines}
              onChange={(disciplines) => onChange({ disciplines })}
              placeholder="Select disciplines…"
              searchPlaceholder="Search disciplines…"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`skills-${row.id}`}>
              Skills / Knowledge Required <Required />
            </Label>
            <Input
              id={`skills-${row.id}`}
              value={row.skills}
              onChange={(e) => onChange({ skills: e.target.value })}
              placeholder="e.g. Python, ML (comma-separated)"
            />
          </div>

          <SelectField
            label={<>PC <Required /></>}
            value={row.pc}
            onValueChange={(pc) => onChange({ pc })}
            placeholder="— Select —"
            options={PROGRAMME_CENTRES}
          />

          <SelectField
            label={<>Tech Domain <Required /></>}
            value={row.techDomain}
            onValueChange={(techDomain) => onChange({ techDomain })}
            placeholder="— Select —"
            options={TECH_DOMAINS}
          />

          <SelectField
            label={<>Emerging Area <Required /></>}
            value={row.emergingArea}
            onValueChange={(emergingArea) => onChange({ emergingArea })}
            placeholder="— Select —"
            options={EMERGING_AREAS}
          />
        </div>

        <Separator />

        <SectionLabel>Mentor</SectionLabel>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`mentor-${row.id}`}>
              Main Mentor <Required />
            </Label>
            <Input
              id={`mentor-${row.id}`}
              value={row.mentorName}
              onChange={(e) => onChange({ mentorName: e.target.value })}
              placeholder="Search mentor by name or email…"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`appointment-${row.id}`}>
              Main Mentor Appointment <Required />
            </Label>
            <Input
              id={`appointment-${row.id}`}
              value={row.mentorAppointment}
              onChange={(e) => onChange({ mentorAppointment: e.target.value })}
              placeholder="e.g. Principal Engineer"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`writeup-${row.id}`}>
            Main Mentor Write-up <Required />
          </Label>
          <Textarea
            id={`writeup-${row.id}`}
            rows={4}
            value={row.mentorWriteup}
            onChange={(e) => onChange({ mentorWriteup: e.target.value })}
            placeholder="Brief professional background of the mentor…"
          />
        </div>

        <Separator />

        <SectionLabel>Logistics</SectionLabel>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            label={<>Project Duration <Required /></>}
            value={row.duration}
            onValueChange={(duration) => onChange({ duration })}
            placeholder="— Select —"
            options={DURATIONS}
          />

          <div className="space-y-1.5">
            <Label htmlFor={`start-${row.id}`}>
              Internship Start Month <Required />
            </Label>
            <MonthPicker
              id={`start-${row.id}`}
              value={row.startMonth}
              onChange={(startMonth) => onChange({ startMonth })}
              placeholder="Select month"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`end-${row.id}`}>
              Internship End Month <Required />
            </Label>
            <MonthPicker
              id={`end-${row.id}`}
              value={row.endMonth}
              onChange={(endMonth) => onChange({ endMonth })}
              placeholder="Select month"
              min={row.startMonth}
            />
          </div>
        </div>

        <div className="space-y-1.5 sm:max-w-xs">
          <Label htmlFor={`placements-${row.id}`}>
            No. of Placements <Required />
          </Label>
          <Input
            id={`placements-${row.id}`}
            type="number"
            min={1}
            value={row.placements}
            onChange={(e) => onChange({ placements: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
