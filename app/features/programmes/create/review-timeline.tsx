import { Fragment, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Gantt } from "~/components/gantt";
import type { IntakeWindow } from "~/data";

/**
 * A read-only timeline for the Review step: each intake's application window and
 * internship period, plus estimated bars for attached projects. Project bars are
 * anchored to the earliest internship start (projects don't carry their own
 * start date yet), matching the note shown beneath the chart.
 */
export interface TimelineProject {
  projectId: string;
  title: string;
  durationMonths: number;
}

export interface ReviewTimelineProps {
  intakes: IntakeWindow[];
  attachedProjects: TimelineProject[];
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** `YYYY-MM` → first-of-month `Date`, or `null` if malformed/absent. */
function firstOfMonth(ym?: string | null): Date | null {
  if (!ym) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(ym);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, 1);
}

/** `YYYY-MM-DD` → local `Date`, or `null`. */
function toLocalDate(ymd?: string | null): Date | null {
  if (!ymd) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

/** "01 Aug 2026". */
function fmtDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  return `${day} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

function minDate(dates: Date[]): Date {
  return dates.reduce((a, b) => (b < a ? b : a));
}
function maxDate(dates: Date[]): Date {
  return dates.reduce((a, b) => (b > a ? b : a));
}

/** A legend toggle: coloured swatch + label + checkbox. */
function LegendItem({
  label,
  swatch,
  checked,
  onCheckedChange,
}: {
  label: string;
  swatch: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-fg-muted">
      <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} />
      <span className={cn("size-3 rounded-sm", swatch)} />
      {label}
    </label>
  );
}

export function ReviewTimeline({ intakes, attachedProjects }: ReviewTimelineProps) {
  const [show, setShow] = useState({ application: true, internship: true, project: true });

  // Resolve each intake's dates once.
  const rows = intakes.map((intake) => ({
    appOpen: toLocalDate(intake.applicationOpen),
    appClose: toLocalDate(intake.applicationClose),
    internStart: firstOfMonth(intake.internshipStart),
    internEnd: firstOfMonth(intake.internshipEnd),
  }));

  // Project bars anchor to the earliest internship start across all intakes.
  const internStarts = rows.map((r) => r.internStart).filter((d): d is Date => d !== null);
  const anchor =
    internStarts.length > 0
      ? minDate(internStarts)
      : rows.map((r) => r.appOpen).filter((d): d is Date => d !== null)[0] ?? null;

  const projectBars =
    anchor === null
      ? []
      : attachedProjects.map((p) => ({
          ...p,
          start: anchor,
          end: addMonths(anchor, Math.max(1, p.durationMonths || 1)),
        }));

  // Overall timeline window: pad to whole months around every date in play.
  const allDates = [
    ...rows.flatMap((r) => [r.appOpen, r.appClose, r.internStart, r.internEnd]),
    ...projectBars.flatMap((p) => [p.start, p.end]),
  ].filter((d): d is Date => d !== null);

  if (allDates.length === 0) {
    return (
      <Text size="sm" variant="muted">
        Set an intake's dates to preview the programme timeline.
      </Text>
    );
  }

  const start = new Date(minDate(allDates).getFullYear(), minDate(allDates).getMonth(), 1);
  const lastMonth = new Date(maxDate(allDates).getFullYear(), maxDate(allDates).getMonth(), 1);
  const end = addMonths(lastMonth, 1); // include the final month in full

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 rounded-t-lg border border-border bg-bg-muted/40 px-4 py-3">
        <LegendItem
          label="Application window"
          swatch="border border-border bg-surface"
          checked={show.application}
          onCheckedChange={(value) => setShow((s) => ({ ...s, application: value }))}
        />
        <LegendItem
          label="Internship"
          swatch="bg-accent"
          checked={show.internship}
          onCheckedChange={(value) => setShow((s) => ({ ...s, internship: value }))}
        />
        <LegendItem
          label="Project (est. from duration)"
          swatch="bg-info"
          checked={show.project}
          onCheckedChange={(value) => setShow((s) => ({ ...s, project: value }))}
        />
      </div>

      <Gantt
        start={start}
        end={end}
        scale="month"
        editable={false}
        showToday={false}
        labelWidth={170}
        rowHeight={40}
        className="rounded-t-none"
      >
        <Gantt.Timeline />

        {rows.map((row, index) => (
          <Fragment key={intakes[index].intakeId ?? index}>
            <Gantt.Row
              label={
                <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
                  Intake {index + 1}
                </span>
              }
            />
            {show.application && row.appOpen && row.appClose ? (
              <Gantt.Row label="Applications">
                <Gantt.Bar
                  id={`${intakes[index].intakeId ?? index}-app`}
                  start={row.appOpen}
                  end={row.appClose}
                  color="neutral"
                  progress={0}
                >
                  {`${fmtDate(row.appOpen)} – ${fmtDate(row.appClose)}`}
                </Gantt.Bar>
              </Gantt.Row>
            ) : null}
            {show.internship && row.internStart && row.internEnd ? (
              <Gantt.Row label="Internship">
                <Gantt.Bar
                  id={`${intakes[index].intakeId ?? index}-intern`}
                  start={row.internStart}
                  end={row.internEnd}
                  color="accent"
                >
                  <span className="text-accent-fg">
                    {`${fmtDate(row.internStart)} – ${fmtDate(row.internEnd)}`}
                  </span>
                </Gantt.Bar>
              </Gantt.Row>
            ) : null}
          </Fragment>
        ))}

        {show.project && projectBars.length > 0 ? (
          <>
            <Gantt.Row
              label={
                <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
                  Attached projects
                </span>
              }
            />
            {projectBars.map((p) => (
              <Gantt.Row key={p.projectId} label={p.title}>
                <Gantt.Bar id={p.projectId} start={p.start} end={p.end} color="info">
                  {p.durationMonths} {p.durationMonths === 1 ? "Month" : "Months"} (estimated)
                </Gantt.Bar>
              </Gantt.Row>
            ))}
          </>
        ) : null}
      </Gantt>

      <Text size="xs" variant="muted">
        Project bars are estimated from each project&apos;s duration, anchored to the earliest
        internship start. Projects don&apos;t carry their own start date yet.
      </Text>
    </div>
  );
}
