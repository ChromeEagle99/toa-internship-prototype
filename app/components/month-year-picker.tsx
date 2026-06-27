import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Month/Year picker — two PRIZM Selects (month + year). The internship period in
 * the TOA data model is MONTH/YEAR granularity (stored as the first/last day of
 * the month), so a day-level calendar would be misleading here.
 *
 * Value is a partial-friendly "YYYY-MM" string: either segment may be blank
 * while the user is mid-selection ("2026-", "-03"), and `isMonthValue` reports
 * when both are set. Helpers below convert a complete value to an ISO day.
 */

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
] as const;

/** True when `value` is a complete "YYYY-MM". */
export function isMonthValue(value?: string): value is string {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value ?? "");
}

/** First day of the month, ISO (e.g. "2026-03" → "2026-03-01"). */
export function firstDayOfMonth(value: string): string {
  return `${value}-01`;
}

/** Last day of the month, ISO (e.g. "2026-02" → "2026-02-28"). */
export function lastDayOfMonth(value: string): string {
  const [year, month] = value.split("-").map(Number);
  const day = new Date(year, month, 0).getDate();
  return `${value}-${String(day).padStart(2, "0")}`;
}

/** ISO date → "YYYY-MM" for seeding a picker from a stored value. */
export function toMonthValue(iso?: string): string {
  return iso ? iso.slice(0, 7) : "";
}

export interface MonthYearPickerProps {
  /** Partial-friendly "YYYY-MM" (either segment may be blank). */
  value?: string;
  onChange: (value: string) => void;
  fromYear?: number;
  toYear?: number;
  className?: string;
}

export function MonthYearPicker({
  value,
  onChange,
  fromYear,
  toYear,
  className,
}: MonthYearPickerProps) {
  const thisYear = new Date().getFullYear();
  const first = fromYear ?? thisYear - 1;
  const last = toYear ?? thisYear + 3;
  const years: string[] = [];
  for (let y = first; y <= last; y++) years.push(String(y));

  const [year = "", month = ""] = (value ?? "").split("-");

  const emit = (nextYear: string, nextMonth: string) =>
    onChange(nextYear || nextMonth ? `${nextYear}-${nextMonth}` : "");

  return (
    <div className={cn("flex gap-2", className)}>
      <Select value={month} onValueChange={(m) => emit(year, m ?? "")}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={year} onValueChange={(y) => emit(y ?? "", month)}>
        <SelectTrigger className="w-28">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
