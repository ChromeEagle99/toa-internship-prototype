import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Columns3,
  ListFilter,
  Search,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableCard } from "~/components/table-card";

/**
 * Reusable data table — the sorting / filtering / column-toggle behaviour PRIZM
 * deliberately leaves to the app ("plain HTML table primitives… no sorting —
 * bring your own"). Composes the PRIZM `Table` primitives, `Input`, `Popover`,
 * `Checkbox`, and `Button` inside a `TableCard`, matching the TOA mockup's
 * toolbar + framed-table look.
 *
 * Columns are declarative: each declares how to render its cell and, optionally,
 * how to sort (`sortValue`), facet-filter (`facetValue`), and search (`search`)
 * by it. State (search text, sort, hidden columns, active facets) lives here.
 */

export type SortDir = 1 | -1;

export interface DataTableColumn<T> {
  /** Stable key — used for sort state, column toggle, and React keys. */
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Provide to make the column sortable; returns the comparable value. */
  sortValue?: (row: T) => string | number;
  /** Provide to make the column facet-filterable; returns the row's value. */
  facetValue?: (row: T) => string;
  /** Provide to include the column in the global search; returns searchable text. */
  search?: (row: T) => string;
  align?: "left" | "right" | "center";
  /** Emphasise this column's cell (turns accent on row hover) — e.g. a title. */
  primary?: boolean;
  /** Exclude from the column-toggle menu (always shown). Default false. */
  pinned?: boolean;
  /** Start hidden. Default false. */
  defaultHidden?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  searchPlaceholder?: string;
  initialSort?: { key: string; dir: SortDir };
  /** Singular noun for the footer count (pluralised with a trailing "s"). */
  rowNoun?: string;
  emptyMessage?: string;
}

const ALIGN: Record<"left" | "right" | "center", string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

function compareValues(a: string | number, b: string | number): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  onRowClick,
  searchPlaceholder = "Search…",
  initialSort,
  rowNoun = "result",
  emptyMessage = "No results.",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: SortDir } | null>(initialSort ?? null);
  const [hidden, setHidden] = useState<Set<string>>(
    () => new Set(columns.filter((c) => c.defaultHidden).map((c) => c.key)),
  );
  const [facets, setFacets] = useState<Record<string, Set<string>>>({});

  const searchable = columns.some((c) => c.search);
  const toggleable = columns.filter((c) => !c.pinned);
  const visibleColumns = columns.filter((c) => !hidden.has(c.key));

  const processed = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = rows.filter((row) => {
      if (query && !columns.some((c) => c.search?.(row).toLowerCase().includes(query))) {
        return false;
      }
      for (const col of columns) {
        const selected = facets[col.key];
        if (selected && selected.size > 0 && col.facetValue) {
          if (!selected.has(col.facetValue(row))) return false;
        }
      }
      return true;
    });

    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortValue) {
        const get = col.sortValue;
        filtered.sort((a, b) => compareValues(get(a), get(b)) * sort.dir);
      }
    }
    return filtered;
  }, [rows, columns, search, sort, facets]);

  const toggleSort = (key: string) =>
    setSort((prev) =>
      prev?.key === key ? { key, dir: prev.dir === 1 ? -1 : 1 } : { key, dir: 1 },
    );

  const toggleColumn = (key: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const setFacet = (key: string, value: string) =>
    setFacets((prev) => {
      const next = { ...prev };
      const set = new Set(next[key] ?? []);
      set.has(value) ? set.delete(value) : set.add(value);
      next[key] = set;
      return next;
    });

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {searchable ? (
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
        ) : null}

        {toggleable.length > 0 ? (
          <Popover>
            <PopoverTrigger
              className={cn(
                "ml-auto inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium text-fg-muted shadow-sm",
                "hover:bg-bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              )}
            >
              <Columns3 className="h-4 w-4" />
              Columns
            </PopoverTrigger>
            <PopoverContent className="w-52 p-1.5">
              {toggleable.map((col) => {
                const shown = !hidden.has(col.key);
                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => toggleColumn(col.key)}
                    className="flex w-full items-center justify-between gap-2 rounded-sm px-2.5 py-2 text-left text-sm text-fg hover:bg-bg-muted"
                  >
                    <span>{col.header}</span>
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                        shown ? "border-accent bg-accent text-accent-fg" : "border-border",
                      )}
                    >
                      {shown ? <Check className="h-3 w-3" /> : null}
                    </span>
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>
        ) : null}
      </div>

      <TableCard
        footer={
          <span>
            {processed.length === rows.length ? (
              <>
                <span className="font-medium text-fg">{rows.length}</span>{" "}
                {rows.length === 1 ? rowNoun : `${rowNoun}s`}
              </>
            ) : (
              <>
                <span className="font-medium text-fg">{processed.length}</span> of {rows.length}{" "}
                {rows.length === 1 ? rowNoun : `${rowNoun}s`}
              </>
            )}
          </span>
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {visibleColumns.map((col) => (
                <DataTableHead
                  key={col.key}
                  column={col}
                  sort={sort}
                  rows={rows}
                  facet={facets[col.key]}
                  onSort={() => toggleSort(col.key)}
                  onFacet={(value) => setFacet(col.key, value)}
                />
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {processed.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={visibleColumns.length}
                  className="py-12 text-center text-fg-muted"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              processed.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  className={cn("group", onRowClick && "cursor-pointer")}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {visibleColumns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        col.align && ALIGN[col.align],
                        col.primary && "font-medium text-fg transition-colors group-hover:text-accent",
                      )}
                    >
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableCard>
    </div>
  );
}

function DataTableHead<T>({
  column,
  sort,
  rows,
  facet,
  onSort,
  onFacet,
}: {
  column: DataTableColumn<T>;
  sort: { key: string; dir: SortDir } | null;
  rows: T[];
  facet: Set<string> | undefined;
  onSort: () => void;
  onFacet: (value: string) => void;
}) {
  const active = sort?.key === column.key;
  const sortable = Boolean(column.sortValue);
  const filterable = Boolean(column.facetValue);

  const options = useMemo(() => {
    if (!column.facetValue) return [];
    return Array.from(new Set(rows.map(column.facetValue))).filter(Boolean).sort();
  }, [rows, column]);

  return (
    <TableHead className={cn("p-0", column.align && ALIGN[column.align], active && "text-accent")}>
      <div
        className={cn(
          "flex items-center",
          column.align === "right" && "justify-end",
          column.align === "center" && "justify-center",
        )}
      >
        {sortable ? (
          <button
            type="button"
            onClick={onSort}
            className="flex flex-1 items-center gap-1.5 px-4 py-3 uppercase tracking-wider hover:text-fg focus-visible:outline-none"
          >
            {column.header}
            {active ? (
              sort?.dir === 1 ? (
                <ArrowUp className="h-3.5 w-3.5 text-accent" />
              ) : (
                <ArrowDown className="h-3.5 w-3.5 text-accent" />
              )
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 text-fg-muted" />
            )}
          </button>
        ) : (
          <span className="flex-1 px-4 py-3 uppercase tracking-wider">{column.header}</span>
        )}

        {filterable && options.length > 0 ? (
          <Popover>
            <PopoverTrigger
              className={cn(
                "mr-2 rounded-sm p-1 transition-colors hover:bg-bg-muted",
                facet && facet.size > 0 ? "text-accent" : "text-fg-muted",
              )}
              aria-label={`Filter ${column.header}`}
            >
              <ListFilter className="h-3.5 w-3.5" />
            </PopoverTrigger>
            <PopoverContent className="w-52 p-1.5">
              {options.map((value) => {
                const checked = facet?.has(value) ?? false;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onFacet(value)}
                    className="flex w-full items-center justify-between gap-2 rounded-sm px-2.5 py-2 text-left text-sm font-normal normal-case tracking-normal text-fg hover:bg-bg-muted"
                  >
                    <span>{value}</span>
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                        checked ? "border-accent bg-accent text-accent-fg" : "border-border",
                      )}
                    >
                      {checked ? <Check className="h-3 w-3" /> : null}
                    </span>
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
    </TableHead>
  );
}
