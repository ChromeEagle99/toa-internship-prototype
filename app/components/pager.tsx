import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Pager — our own page-navigation component.
 *
 * The PRIZM `Pagination` exports are deliberately unopinionated primitives:
 * they draw whatever items you hand them and leave the "which page numbers to
 * show" maths, the disabled states, and the wiring to the consumer. That's
 * flexible but repetitive — every table would re-implement the same range
 * logic. `Pager` packages that once behind a controlled `page` / `totalPages`
 * / `onPageChange` API, while rendering entirely from the PRIZM primitives so
 * it inherits their tokens, focus rings, and hover styling for free.
 * ------------------------------------------------------------------ */

export type PageItem = number | "ellipsis";

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * The standard truncation algorithm: always keep the first and last page, keep
 * `siblingCount` pages either side of the current one, and collapse the gaps
 * into a single ellipsis.
 */
export function paginationRange(
  current: number,
  total: number,
  siblingCount = 1,
): PageItem[] {
  // first + last + current + one ellipsis each side + the sibling window.
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPageNumbers >= total) {
    return range(1, total);
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 2;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount;
    return [...range(1, leftItemCount), "ellipsis", total];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount;
    return [1, "ellipsis", ...range(total - rightItemCount + 1, total)];
  }

  return [1, "ellipsis", ...range(leftSibling, rightSibling), "ellipsis", total];
}

const disabledClass = "pointer-events-none opacity-50";

export interface PagerProps {
  /** Current page, 1-indexed. */
  page: number;
  /** Total number of pages (>= 1). */
  totalPages: number;
  /** Called with the requested page when the user navigates. */
  onPageChange: (page: number) => void;
  /** Pages shown either side of the current one. Default 1. */
  siblingCount?: number;
  /** Show the "Previous"/"Next" word labels. When false, prev/next are icon-only. Default true. */
  showLabels?: boolean;
  /** Add double-chevron jump-to-first / jump-to-last controls. Default false. */
  showFirstLast?: boolean;
  /** Hide the numbered links and show a "Page X of Y" label instead (compact mode). Default false. */
  hideNumbers?: boolean;
  /**
   * Add a jump-to-page control beside the nav. Pick the flavour:
   * - `"inline"` — a "Go to [ ] Go" form on one line.
   * - `"field"`  — an editable "Page [7] of 20" field; type and press Enter.
   * - `"dialog"` — a button that opens a modal to enter a page number.
   */
  jumpTo?: JumpVariant;
  className?: string;
}

export type JumpVariant = "inline" | "field" | "dialog";

/** Clamp to a valid page, returning null if the input isn't a usable number. */
function parsePage(raw: string, totalPages: number): number | null {
  const parsed = Number(raw);
  if (raw.trim() === "" || !Number.isInteger(parsed)) return null;
  if (parsed < 1 || parsed > totalPages) return null;
  return parsed;
}

/** "Go to [ ] Go" — a labelled input and button on a single line. */
function JumpInline({
  totalPages,
  onJump,
}: {
  totalPages: number;
  onJump: (page: number) => void;
}) {
  const [value, setValue] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const target = parsePage(value, totalPages);
    if (target === null) return;
    onJump(target);
    setValue("");
  };

  return (
    <form onSubmit={submit} className="flex shrink-0 items-center gap-2">
      <label
        htmlFor="pager-jump-inline"
        className="whitespace-nowrap text-sm text-fg-muted"
      >
        Go to
      </label>
      <Input
        id="pager-jump-inline"
        type="number"
        inputMode="numeric"
        min={1}
        max={totalPages}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label={`Go to page (1 to ${totalPages})`}
        className="h-9 w-16"
      />
      <Button type="submit" size="sm" variant="outline" disabled={value === ""}>
        Go
      </Button>
    </form>
  );
}

/** "Page [7] of 20" — the current page is an editable field; Enter to jump. */
function JumpField({
  page,
  totalPages,
  onJump,
}: {
  page: number;
  totalPages: number;
  onJump: (page: number) => void;
}) {
  const commit = (raw: string, el: HTMLInputElement) => {
    const target = parsePage(raw, totalPages);
    if (target === null || target === page) {
      el.value = String(page); // reject: restore the current page
      return;
    }
    onJump(target);
  };

  return (
    <div className="flex shrink-0 items-center gap-2 text-sm text-fg-muted">
      <label htmlFor="pager-jump-field" className="whitespace-nowrap">
        Page
      </label>
      <Input
        id="pager-jump-field"
        // Remount on page change so the field always reflects the current page.
        key={page}
        type="number"
        inputMode="numeric"
        min={1}
        max={totalPages}
        defaultValue={page}
        aria-label={`Current page ${page} of ${totalPages}. Type a page and press Enter to jump.`}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(e.currentTarget.value, e.currentTarget);
          }
        }}
        onBlur={(e) => commit(e.currentTarget.value, e.currentTarget)}
        className="h-9 w-16 text-center text-fg"
      />
      <span className="whitespace-nowrap">of {totalPages}</span>
    </div>
  );
}

/** A button that opens a modal to enter a page number. */
function JumpDialog({
  totalPages,
  onJump,
}: {
  totalPages: number;
  onJump: (page: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const target = parsePage(value, totalPages);
    if (target === null) return;
    onJump(target);
    setOpen(false);
    setValue("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setValue("");
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="shrink-0">
            Jump to page…
          </Button>
        }
      />
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Jump to page</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="pager-jump-dialog"
              className="whitespace-nowrap text-sm text-fg-muted"
            >
              Page number
            </label>
            <Input
              id="pager-jump-dialog"
              type="number"
              inputMode="numeric"
              min={1}
              max={totalPages}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`1–${totalPages}`}
              aria-label={`Page number (1 to ${totalPages})`}
              autoFocus
            />
          </div>
          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={parsePage(value, totalPages) === null}>
              Go
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function Pager({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showLabels = true,
  showFirstLast = false,
  hideNumbers = false,
  jumpTo,
  className,
}: PagerProps) {
  const atFirst = page <= 1;
  const atLast = page >= totalPages;

  /** Guarded navigation: clamp, and ignore no-op clicks on disabled controls. */
  const go = (target: number) => (event: MouseEvent) => {
    event.preventDefault();
    const next = Math.min(Math.max(1, target), totalPages);
    if (next !== page) onPageChange(next);
  };

  const jump = (target: number) => {
    const next = Math.min(Math.max(1, target), totalPages);
    if (next !== page) onPageChange(next);
  };

  const items = hideNumbers ? [] : paginationRange(page, totalPages, siblingCount);

  const nav = (
    // When paired with a jump control the nav shouldn't stretch — the wrapper
    // owns the spacing — so collapse the PRIZM default `w-full` to `w-auto`.
    <Pagination className={jumpTo ? "mx-0 w-auto" : className}>
      <PaginationContent>
        {showFirstLast && (
          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label="Go to first page"
              aria-disabled={atFirst || undefined}
              className={cn(atFirst && disabledClass)}
              onClick={go(1)}
            >
              <ChevronsLeft className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          {showLabels ? (
            <PaginationPrevious
              href="#"
              aria-disabled={atFirst || undefined}
              className={cn(atFirst && disabledClass)}
              onClick={go(page - 1)}
            />
          ) : (
            <PaginationLink
              href="#"
              aria-label="Go to previous page"
              aria-disabled={atFirst || undefined}
              className={cn(atFirst && disabledClass)}
              onClick={go(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </PaginationLink>
          )}
        </PaginationItem>

        {hideNumbers ? (
          <PaginationItem>
            <span className="px-3 text-sm text-fg-muted">
              Page <span className="font-medium text-fg">{page}</span> of{" "}
              {totalPages}
            </span>
          </PaginationItem>
        ) : (
          items.map((item, i) =>
            item === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  href="#"
                  isActive={item === page}
                  aria-label={`Go to page ${item}`}
                  onClick={go(item)}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            ),
          )
        )}

        <PaginationItem>
          {showLabels ? (
            <PaginationNext
              href="#"
              aria-disabled={atLast || undefined}
              className={cn(atLast && disabledClass)}
              onClick={go(page + 1)}
            />
          ) : (
            <PaginationLink
              href="#"
              aria-label="Go to next page"
              aria-disabled={atLast || undefined}
              className={cn(atLast && disabledClass)}
              onClick={go(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </PaginationLink>
          )}
        </PaginationItem>

        {showFirstLast && (
          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label="Go to last page"
              aria-disabled={atLast || undefined}
              className={cn(atLast && disabledClass)}
              onClick={go(totalPages)}
            >
              <ChevronsRight className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );

  if (!jumpTo) return nav;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 sm:flex-row sm:justify-between",
        className,
      )}
    >
      {nav}
      {jumpTo === "inline" && (
        <JumpInline totalPages={totalPages} onJump={jump} />
      )}
      {jumpTo === "field" && (
        <JumpField page={page} totalPages={totalPages} onJump={jump} />
      )}
      {jumpTo === "dialog" && (
        <JumpDialog totalPages={totalPages} onJump={jump} />
      )}
    </div>
  );
}
