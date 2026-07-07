import { ArrowRight, CalendarDays } from "lucide-react";

import { Text } from "@/components/ui/text";

import { formatRange } from "~/components/date-range-picker";
import type { CriteriaGroup, IntakeWindow } from "~/data";

import { criteriaToSentence } from "./eligibility";
import { ReviewTimeline, type TimelineProject } from "./review-timeline";
import type { IntakeDraft } from "./types";
import { SectionHeader, SummaryField, monthRangeLabel } from "./ui";

export interface ReviewStepProps {
  title: string;
  educationLevel: string;
  formTemplate: string;
  intakes: IntakeDraft[];
  eligibilityCriteria: CriteriaGroup[];
  intakeWindows: IntakeWindow[];
  timelineProjects: TimelineProject[];
  onOpenEligibility: () => void;
}

/**
 * Step 3 — a read-only summary of the programme (details, intake windows,
 * eligibility sentence) and the programme timeline, before create / save.
 */
export function ReviewStep({
  title,
  educationLevel,
  formTemplate,
  intakes,
  eligibilityCriteria,
  intakeWindows,
  timelineProjects,
  onOpenEligibility,
}: ReviewStepProps) {
  return (
    <div>
      <SectionHeader>Review</SectionHeader>
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <SummaryField label="Programme Title" value={title} />
          <SummaryField label="Education Level" value={educationLevel} />
          <SummaryField label="Programme Status" value="Active" />
          <SummaryField label="Application Form" value={formTemplate} />
        </div>

        {/* Intake windows */}
        <div className="space-y-2">
          <Text as="p" size="xs" variant="muted">
            Intake Windows
          </Text>
          <div className="space-y-3 rounded-lg border border-border p-4">
            {intakes.map((intake, index) => (
              <div
                key={intake.id}
                className={index > 0 ? "border-t border-border pt-3" : undefined}
              >
                <Text as="p" size="sm" weight="semibold">
                  {title || `Intake ${index + 1}`} ({monthRangeLabel(intake, "dates TBC")})
                </Text>
                <Text as="p" size="sm" variant="muted">
                  App:{" "}
                  {intake.applicationWindow.from ? formatRange(intake.applicationWindow) : "—"}
                </Text>
                <Text as="p" size="sm" variant="muted">
                  Internship: {monthRangeLabel(intake, "—")}
                </Text>
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility requirements */}
        <div className="space-y-2">
          <Text as="p" size="xs" variant="muted">
            Eligibility Requirements
          </Text>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm leading-relaxed text-fg">
              {criteriaToSentence(eligibilityCriteria)}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <Text as="span" size="xs" variant="muted">
                Generated from configured criteria
              </Text>
              <button
                type="button"
                onClick={onOpenEligibility}
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                View criteria detail
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-fg-muted" />
            <Text as="p" size="sm" weight="semibold">
              Programme Timeline
            </Text>
          </div>
          <ReviewTimeline intakes={intakeWindows} attachedProjects={timelineProjects} />
        </div>
      </div>
    </div>
  );
}
