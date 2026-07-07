import { Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";
import type { CriteriaGroup, CriteriaRule } from "~/data";

import { criteriaToSentence, describeRule, groupByOption, type RuleSegment } from "./eligibility";

/**
 * A read-only slide-over that explains a programme's eligibility criteria: a
 * generated natural-language summary up top, then a detailed ALL/ANY breakdown.
 * "Edit criteria" is stubbed for now (the rule builder isn't built yet).
 */
export interface EligibilitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  educationLevel: string;
  criteria: CriteriaGroup[];
}

/** Render a rule's emphasised/plain segments. */
function RuleLine({ segments }: { segments: RuleSegment[] }) {
  return (
    <p className="text-sm text-fg-muted">
      {segments.map((segment, index) => (
        <span key={index} className={segment.strong ? "font-medium text-fg" : undefined}>
          {segment.text}
        </span>
      ))}
    </p>
  );
}

/** A ticked condition row. */
function ConditionRow({ rule }: { rule: CriteriaRule }) {
  return (
    <div className="flex items-start gap-2">
      <Check className="mt-0.5 size-4 shrink-0 text-success" />
      <RuleLine segments={describeRule(rule)} />
    </div>
  );
}

/** The small connective pill ("and" / "or") between groups and options. */
function Connective({ label, variant }: { label: string; variant: "and" | "or" }) {
  if (variant === "or") {
    return (
      <div className="py-1 pl-1 text-xs font-medium text-fg-muted">{label}</div>
    );
  }
  return (
    <div className="flex items-center justify-center py-1">
      <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-fg">
        {label}
      </span>
    </div>
  );
}

function AllGroup({ group }: { group: CriteriaGroup }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <Text as="p" size="sm" weight="semibold" className="mb-3 text-accent">
        All of these conditions:
      </Text>
      <div className="space-y-2">
        {group.rules.map((rule, index) => (
          <ConditionRow key={rule.criteriaRuleId ?? index} rule={rule} />
        ))}
      </div>
    </div>
  );
}

function AnyGroup({ group }: { group: CriteriaGroup }) {
  const options = groupByOption(group);
  return (
    <div className="rounded-lg border border-border p-4">
      <Text as="p" size="sm" weight="semibold" className="mb-3 text-accent">
        Any of these options:
      </Text>
      <div className="space-y-1">
        {options.map((rules, index) => (
          <div key={index}>
            {index > 0 ? <Connective label="or" variant="or" /> : null}
            <div className="rounded-md border border-border bg-bg-muted/40 p-3">
              <Text as="p" size="xs" variant="muted" weight="medium" className="mb-1.5">
                Option {index + 1}
              </Text>
              <div className="space-y-2">
                {rules.map((rule, ruleIndex) => (
                  <ConditionRow key={rule.criteriaRuleId ?? ruleIndex} rule={rule} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EligibilitySheet({
  open,
  onOpenChange,
  educationLevel,
  criteria,
}: EligibilitySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Eligibility criteria</SheetTitle>
          <Text size="sm" variant="muted">
            {educationLevel || "No education level selected"}
          </Text>
        </SheetHeader>

        <SheetBody className="space-y-6">
          {/* Generated summary */}
          <div className="rounded-lg border border-border bg-bg-muted/40 p-4">
            <p className="text-sm leading-relaxed text-fg">{criteriaToSentence(criteria)}</p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-fg-muted">
              <Sparkles className="size-3.5" />
              Generated from configured criteria
            </div>
          </div>

          {/* Detailed breakdown */}
          <div className="space-y-1">
            <Text
              as="p"
              size="xs"
              variant="subtle"
              weight="semibold"
              className="uppercase tracking-wide"
            >
              Detailed breakdown
            </Text>
            <div className="space-y-1 pt-2">
              {criteria.map((group, index) => (
                <div key={group.criteriaGroupId ?? index}>
                  {index > 0 ? <Connective label="and" variant="and" /> : null}
                  {group.matchType === "ALL" ? (
                    <AllGroup group={group} />
                  ) : (
                    <AnyGroup group={group} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </SheetBody>

        <SheetFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            size="sm"
            onClick={() =>
              toast.add({
                title: "Criteria editing coming soon",
                description:
                  "Criteria are auto-configured from the education level for now. A rule builder is on the roadmap.",
                type: "info",
              })
            }
          >
            Edit criteria
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
