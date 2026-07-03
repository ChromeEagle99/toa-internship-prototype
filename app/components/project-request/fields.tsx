import { useState } from "react";
import { CalendarDays } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import { Calendar } from "~/components/calendar";

import { formatDate, startOfToday } from "./model";

/** An uppercase section label with a rule filling the remaining width. */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <Text
        size="xs"
        weight="semibold"
        variant="muted"
        className="shrink-0 uppercase tracking-wide"
      >
        {children}
      </Text>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/** Input-styled popover wrapping the single-date Calendar, for the deadline. */
export function DeadlinePicker({
  value,
  onChange,
}: {
  value?: Date;
  onChange: (date: Date | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-border bg-surface px-3 text-sm shadow-sm",
          "hover:bg-bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          !value && "text-fg-muted",
        )}
      >
        <span className="truncate">{formatDate(value) ?? "Pick a date"}</span>
        <CalendarDays className="size-4 shrink-0 text-fg-muted" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          captionLayout="dropdown"
          selected={value}
          defaultMonth={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          disabled={(date) => date < startOfToday()}
        />
      </PopoverContent>
    </Popover>
  );
}
