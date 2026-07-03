import { ArrowRight, Eye, ShieldCheck } from "lucide-react";

import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

import { EDUCATION_LEVELS } from "./eligibility";
import { FieldBlock, SectionHeader } from "./ui";

export interface DetailsStepProps {
  title: string;
  educationLevel: string;
  description: string;
  /** Number of configured eligibility rules, shown on the criteria card. */
  ruleCount: number;
  /** Application-form template name for the selected education level. */
  formTemplate: string;
  onTitleChange: (value: string) => void;
  onEducationLevelChange: (level: string) => void;
  onDescriptionChange: (value: string) => void;
  onOpenEligibility: () => void;
}

/**
 * Step 1 — programme title, education level (which auto-configures the
 * eligibility criteria and application form), and description.
 */
export function DetailsStep({
  title,
  educationLevel,
  description,
  ruleCount,
  formTemplate,
  onTitleChange,
  onEducationLevelChange,
  onDescriptionChange,
  onOpenEligibility,
}: DetailsStepProps) {
  return (
    <div>
      <SectionHeader>Details</SectionHeader>
      <div className="space-y-6">
        <FieldBlock label="Programme Title" hint="Shown to applicants in listings." required>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Type a programme name, e.g. UG Intern 2027"
          />
        </FieldBlock>

        <FieldBlock label="Education Level" hint="Who this programme is open to." required>
          <RadioGroup
            value={educationLevel}
            onValueChange={(v) => onEducationLevelChange(v as string)}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {EDUCATION_LEVELS.map((level) => {
              const selected = educationLevel === level;
              return (
                <div
                  key={level}
                  onClick={() => onEducationLevelChange(level)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    selected ? "border-accent bg-accent/5" : "border-border hover:bg-bg-muted",
                  )}
                >
                  <RadioGroupItem value={level} />
                  <span className="text-sm text-fg">{level}</span>
                </div>
              );
            })}
          </RadioGroup>
          {educationLevel ? (
            <button
              type="button"
              onClick={() =>
                toast.add({
                  title: "Application form preview",
                  description: `This programme uses the “${formTemplate}”. A full preview is coming soon.`,
                  type: "info",
                })
              }
              className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              <Eye className="size-4" />
              Preview application form
            </button>
          ) : null}
        </FieldBlock>

        <FieldBlock
          label="Eligibility Criteria"
          hint="Who qualifies to apply. Set from the education level."
        >
          <button
            type="button"
            disabled={!educationLevel}
            onClick={onOpenEligibility}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border border-border p-4 text-left transition-colors",
              educationLevel ? "hover:bg-bg-muted" : "cursor-not-allowed opacity-70",
            )}
          >
            <ShieldCheck
              className={cn("size-5 shrink-0", educationLevel ? "text-accent" : "text-fg-muted")}
            />
            <div className="min-w-0 flex-1">
              <Text as="p" size="sm" weight="semibold">
                {educationLevel ? `${ruleCount} criteria configured` : "Not configured"}
              </Text>
              <Text as="p" size="xs" variant="muted">
                {educationLevel
                  ? "View or edit eligibility criteria"
                  : "Select an education level above to load criteria"}
              </Text>
            </div>
            <ArrowRight className="size-4 shrink-0 text-fg-muted" />
          </button>
        </FieldBlock>

        <FieldBlock label="Programme Description" hint="Shown to applicants.">
          <Textarea
            rows={5}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="In a sentence or two, describe what interns will do on this programme…"
          />
        </FieldBlock>
      </div>
    </div>
  );
}
