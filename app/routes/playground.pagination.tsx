import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Text } from "@/components/ui/text";

import { Pager, paginationRange, type JumpVariant } from "~/components/pager";
import { ThemeToggle } from "~/components/theme-toggle";

/* Seed data for the paginated tables — a roster of internship applications. */
type Status = "Submitted" | "Screening" | "Shortlisted" | "Offered";

const STATUS_VARIANT: Record<Status, BadgeProps["variant"]> = {
  Submitted: "subtle",
  Screening: "info",
  Shortlisted: "warning",
  Offered: "success",
};

const NAMES = [
  "Aisha Rahman", "Wei Jie Tan", "Priya Nair", "Daniel Ong", "Siti Nurhaliza",
  "Marcus Lee", "Chloe Lim", "Arjun Menon", "Hui Ling Goh", "Ethan Chua",
  "Farah Ismail", "Ravi Kumar", "Natalie Wong", "Zhi Hao Ng", "Amelia Teo",
];
const PROGRAMMES = [
  "Cyber Defence", "Data Science", "Systems Engineering", "Robotics",
  "Software Delivery",
];
const STATUSES: Status[] = ["Submitted", "Screening", "Shortlisted", "Offered"];

interface Applicant {
  id: string;
  name: string;
  programme: string;
  status: Status;
}

const APPLICANTS: Applicant[] = Array.from({ length: 43 }, (_, i) => ({
  id: `APP-${1000 + i + 1}`,
  name: NAMES[i % NAMES.length],
  programme: PROGRAMMES[i % PROGRAMMES.length],
  status: STATUSES[i % STATUSES.length],
}));

/** The head + body for a page of applicants — shared by both table examples. */
function ApplicantsTable({ rows }: { rows: Applicant[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Reference</TableHead>
          <TableHead>Applicant</TableHead>
          <TableHead>Programme</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.id}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.programme}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function meta() {
  return [
    { title: "Pagination — Playground" },
    {
      name: "description",
      content:
        "Our own Pager component, built on the PRIZM Pagination primitives, shown in several configurations.",
    },
  ];
}

export default function PaginationDemo() {
  // A single page of state per configuration so each can be driven live.
  const [raw, setRaw] = useState(4);
  const rawTotal = 12;
  const rawItems = paginationRange(raw, rawTotal);

  const [full, setFull] = useState(4);
  const [compact, setCompact] = useState(3);
  const [jump, setJump] = useState(6);
  const [dense, setDense] = useState(8);

  // Table with raw PRIZM primitives: fixed page size of 8.
  const [primPage, setPrimPage] = useState(1);
  const PRIM_SIZE = 8;
  const primTotal = Math.ceil(APPLICANTS.length / PRIM_SIZE);
  const primRows = APPLICANTS.slice(
    (primPage - 1) * PRIM_SIZE,
    primPage * PRIM_SIZE,
  );
  const primItems = paginationRange(primPage, primTotal);

  // Table with our Pager: rows-per-page select + jump-to-page.
  const [pagerPage, setPagerPage] = useState(1);
  const [pagerSize, setPagerSize] = useState("8");
  const [jumpVariant, setJumpVariant] = useState<JumpVariant>("inline");
  const pagerSizeNum = Number(pagerSize);
  const pagerTotal = Math.max(1, Math.ceil(APPLICANTS.length / pagerSizeNum));
  const pagerPageClamped = Math.min(pagerPage, pagerTotal);
  const pagerRows = APPLICANTS.slice(
    (pagerPageClamped - 1) * pagerSizeNum,
    pagerPageClamped * pagerSizeNum,
  );
  const pagerFirstRow = (pagerPageClamped - 1) * pagerSizeNum + 1;
  const pagerLastRow = Math.min(pagerPageClamped * pagerSizeNum, APPLICANTS.length);

  // Table footer: page derived from row count and the chosen page size.
  const [footerPage, setFooterPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  const totalRows = 97;
  const size = Number(pageSize);
  const footerTotal = Math.max(1, Math.ceil(totalRows / size));
  const footerPageClamped = Math.min(footerPage, footerTotal);
  const firstRow = (footerPageClamped - 1) * size + 1;
  const lastRow = Math.min(footerPageClamped * size, totalRows);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <Heading as="h1" size="2xl">
              Pagination
            </Heading>
            <Text size="sm" variant="muted" className="mt-0.5">
              Our <code className="text-fg">Pager</code> component, built on the
              PRIZM Pagination primitives.
            </Text>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-6 py-10">
        <Link
          to="/playground"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft />
          Back to playground
        </Link>

        <section className="space-y-2">
          <Text size="sm" variant="muted">
            <code className="text-fg">~/components/pager</code> wraps the PRIZM{" "}
            <code className="text-fg">Pagination</code> primitives behind a
            controlled <code className="text-fg">page</code> /{" "}
            <code className="text-fg">totalPages</code> /{" "}
            <code className="text-fg">onPageChange</code> API. It owns the range
            truncation, the disabled edges, and the active state; a few props —{" "}
            <code className="text-fg">siblingCount</code>,{" "}
            <code className="text-fg">showLabels</code>,{" "}
            <code className="text-fg">showFirstLast</code>,{" "}
            <code className="text-fg">hideNumbers</code>,{" "}
            <code className="text-fg">jumpTo</code> — reshape it for each case
            below, all rendering the same PRIZM tokens and focus styling.
          </Text>
        </section>

        {/* PRIZM primitives — the raw building blocks */}
        <section className="space-y-4">
          <div className="space-y-1">
            <Heading as="h2" size="lg">
              PRIZM primitives (canonical)
            </Heading>
            <Text size="sm" variant="muted">
              The shipped composition, hand-wired:{" "}
              <code className="text-fg">Pagination</code> wrapping{" "}
              <code className="text-fg">PaginationContent</code>,{" "}
              <code className="text-fg">PaginationItem</code>,{" "}
              <code className="text-fg">PaginationLink</code>,{" "}
              <code className="text-fg">PaginationPrevious/Next</code> and{" "}
              <code className="text-fg">PaginationEllipsis</code>. This is what{" "}
              <code className="text-fg">Pager</code> below packages up — the
              same primitives, minus the boilerplate.
            </Text>
          </div>
          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Search results</CardTitle>
              <CardDescription>
                Page {raw} of {rawTotal}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={raw === 1 || undefined}
                      className={
                        raw === 1 ? "pointer-events-none opacity-50" : undefined
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setRaw((p) => Math.max(1, p - 1));
                      }}
                    />
                  </PaginationItem>

                  {rawItems.map((item, i) =>
                    item === "ellipsis" ? (
                      <PaginationItem key={`e-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          href="#"
                          isActive={item === raw}
                          onClick={(e) => {
                            e.preventDefault();
                            setRaw(item);
                          }}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={raw === rawTotal || undefined}
                      className={
                        raw === rawTotal
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setRaw((p) => Math.min(rawTotal, p + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardContent>
          </Card>
        </section>

        {/* Table + PRIZM primitives */}
        <section className="space-y-4">
          <div className="space-y-1">
            <Heading as="h2" size="lg">
              Table + PRIZM primitives
            </Heading>
            <Text size="sm" variant="muted">
              A real paginated table: slice the rows by page in the route, and
              hand-wire the PRIZM <code className="text-fg">Pagination</code>{" "}
              primitives underneath. Fixed page size of {PRIM_SIZE}.
            </Text>
          </div>
          <Separator />

          <Card>
            <CardContent className="space-y-4 p-0">
              <ApplicantsTable rows={primRows} />
              <div className="px-4 pb-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        aria-disabled={primPage === 1 || undefined}
                        className={
                          primPage === 1
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          setPrimPage((p) => Math.max(1, p - 1));
                        }}
                      />
                    </PaginationItem>

                    {primItems.map((item, i) =>
                      item === "ellipsis" ? (
                        <PaginationItem key={`e-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={item}>
                          <PaginationLink
                            href="#"
                            isActive={item === primPage}
                            onClick={(e) => {
                              e.preventDefault();
                              setPrimPage(item);
                            }}
                          >
                            {item}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        aria-disabled={primPage === primTotal || undefined}
                        className={
                          primPage === primTotal
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          setPrimPage((p) => Math.min(primTotal, p + 1));
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Table + our Pager (jump-to-page + rows per page) */}
        <section className="space-y-4">
          <div className="space-y-1">
            <Heading as="h2" size="lg">
              Table + our Pager
            </Heading>
            <Text size="sm" variant="muted">
              The same table driven by <code className="text-fg">Pager</code>{" "}
              with two additions: a rows-per-page{" "}
              <code className="text-fg">Select</code>, and{" "}
              <code className="text-fg">jumpTo</code> for landing on a page
              directly. Pick a jump style below — they all drive the same table.
              Changing the page size resets to page one.
            </Text>
          </div>
          <Separator />

          {/* Let the viewer choose which jump-to-page variant is shown. */}
          <div className="flex flex-wrap items-center gap-2">
            <Text size="sm" variant="muted" className="mr-1">
              Jump style
            </Text>
            {(
              [
                { value: "inline", label: "Inline input" },
                { value: "field", label: "Editable field" },
                { value: "dialog", label: "Modal button" },
              ] satisfies { value: JumpVariant; label: string }[]
            ).map(({ value, label }) => (
              <Button
                key={value}
                size="sm"
                variant={jumpVariant === value ? "solid" : "outline"}
                onClick={() => setJumpVariant(value)}
              >
                {label}
              </Button>
            ))}
            <code className="ml-1 text-sm text-fg-muted">
              jumpTo="{jumpVariant}"
            </code>
          </div>

          <Card>
            <CardContent className="space-y-4 p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4">
                <Text size="sm" variant="muted">
                  Showing{" "}
                  <span className="font-medium text-fg">
                    {pagerFirstRow}–{pagerLastRow}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-fg">
                    {APPLICANTS.length}
                  </span>{" "}
                  applications
                </Text>
                <div className="flex items-center gap-2">
                  <Text size="sm" variant="muted">
                    Rows per page
                  </Text>
                  <Select
                    value={pagerSize}
                    onValueChange={(value) => {
                      setPagerSize(value as string);
                      setPagerPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-[72px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["5", "8", "10", "20"].map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ApplicantsTable rows={pagerRows} />

              <div className="px-4 pb-4">
                <Pager
                  page={pagerPageClamped}
                  totalPages={pagerTotal}
                  onPageChange={setPagerPage}
                  showFirstLast
                  jumpTo={jumpVariant}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Default */}
        <section className="space-y-4">
          <div className="space-y-1">
            <Heading as="h2" size="lg">
              Our Pager — default
            </Heading>
            <Text size="sm" variant="muted">
              <code className="text-fg">
                &lt;Pager page totalPages onPageChange /&gt;
              </code>{" "}
              — Previous/Next labels, numbered links, and a truncating ellipsis.
            </Text>
          </div>
          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Search results</CardTitle>
              <CardDescription>Page {full} of 12</CardDescription>
            </CardHeader>
            <CardContent>
              <Pager page={full} totalPages={12} onPageChange={setFull} />
            </CardContent>
          </Card>
        </section>

        {/* Compact */}
        <section className="space-y-4">
          <div className="space-y-1">
            <Heading as="h2" size="lg">
              Compact
            </Heading>
            <Text size="sm" variant="muted">
              <code className="text-fg">hideNumbers</code> swaps the numbered
              links for a "Page X of Y" label — for wizards, detail views, and
              mobile.
            </Text>
          </div>
          <Separator />

          <Card>
            <CardContent>
              <Pager
                page={compact}
                totalPages={8}
                onPageChange={setCompact}
                hideNumbers
              />
            </CardContent>
          </Card>
        </section>

        {/* First / last jump */}
        <section className="space-y-4">
          <div className="space-y-1">
            <Heading as="h2" size="lg">
              First / last jump
            </Heading>
            <Text size="sm" variant="muted">
              <code className="text-fg">showFirstLast</code> bookends the range
              with double-chevron controls that jump straight to the first and
              last page — handy for long histories.
            </Text>
          </div>
          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Audit log</CardTitle>
              <CardDescription>Page {jump} of 20</CardDescription>
            </CardHeader>
            <CardContent>
              <Pager
                page={jump}
                totalPages={20}
                onPageChange={setJump}
                showFirstLast
              />
            </CardContent>
          </Card>
        </section>

        {/* Table footer */}
        <section className="space-y-4">
          <div className="space-y-1">
            <Heading as="h2" size="lg">
              Table footer
            </Heading>
            <Text size="sm" variant="muted">
              The enterprise workhorse: a row-count summary, a page-size{" "}
              <code className="text-fg">Select</code>, and an icon-only{" "}
              <code className="text-fg">Pager</code> (
              <code className="text-fg">hideNumbers</code> +{" "}
              <code className="text-fg">showLabels={"{false}"}</code>). Changing
              the page size recomputes the range and resets to page one.
            </Text>
          </div>
          <Separator />

          <Card>
            <CardContent>
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <Text size="sm" variant="muted">
                  Showing{" "}
                  <span className="font-medium text-fg">
                    {firstRow}–{lastRow}
                  </span>{" "}
                  of <span className="font-medium text-fg">{totalRows}</span>
                </Text>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Text size="sm" variant="muted">
                      Rows per page
                    </Text>
                    <Select
                      value={pageSize}
                      onValueChange={(value) => {
                        setPageSize(value as string);
                        setFooterPage(1);
                      }}
                    >
                      <SelectTrigger className="h-9 w-[72px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["10", "20", "50"].map((n) => (
                          <SelectItem key={n} value={n}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Pager
                    page={footerPageClamped}
                    totalPages={footerTotal}
                    onPageChange={setFooterPage}
                    hideNumbers
                    showLabels={false}
                    className="mx-0 w-auto"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sibling count density */}
        <section className="space-y-4">
          <div className="space-y-1">
            <Heading as="h2" size="lg">
              Density (<code className="text-fg">siblingCount</code>)
            </Heading>
            <Text size="sm" variant="muted">
              How many pages sit either side of the current one before the
              ellipsis takes over. Same component, three densities — all on page{" "}
              {dense} of 20.
            </Text>
          </div>
          <Separator />

          <Card>
            <CardContent className="space-y-6">
              {[0, 1, 2].map((count) => (
                <div key={count} className="space-y-2">
                  <Text size="sm" variant="muted">
                    <code className="text-fg">siblingCount={`{${count}}`}</code>
                  </Text>
                  <Pager
                    page={dense}
                    totalPages={20}
                    onPageChange={setDense}
                    siblingCount={count}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
