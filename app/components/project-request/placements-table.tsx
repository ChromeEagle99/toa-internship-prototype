import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { EducationRow } from "./model";

/** The Education Level × No. of Placements table, shared by the review row and email. */
export function PlacementsTable({ rows }: { rows: EducationRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-bg-subtle hover:bg-bg-subtle">
            <TableHead className="text-fg">Education Level</TableHead>
            <TableHead className="w-40 border-l border-border text-fg">
              No. of Placements
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-transparent">
              <TableCell>{row.level || "—"}</TableCell>
              <TableCell className="border-l border-border tabular-nums">
                {row.placements}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
