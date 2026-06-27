import { BookOpen, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";
import { DataTable, type DataTableColumn } from "~/components/data-table";
import { useActor } from "~/context/actor-context";
import { programmesRepository, type Programme } from "~/data";

const columns: DataTableColumn<Programme>[] = [
  {
    key: "title",
    header: "Programme",
    primary: true,
    cell: (p) => p.title,
    sortValue: (p) => p.title,
    search: (p) => p.title,
  },
  {
    key: "educationLevel",
    header: "Education level",
    cell: (p) => <Badge variant="subtle">{p.educationLevel}</Badge>,
    sortValue: (p) => p.educationLevel,
    facetValue: (p) => p.educationLevel,
    search: (p) => p.educationLevel,
  },
  {
    key: "year",
    header: "Year",
    cell: (p) => p.year,
    sortValue: (p) => p.year,
    facetValue: (p) => String(p.year),
  },
];

/**
 * Programmes list (IO Admin). Reads through the data layer with the current
 * actor, so the policy decides visibility. Data access runs in an effect because
 * the localStorage backend is browser-only.
 */
export default function ProgrammesIndex() {
  const { actor, ready } = useActor();
  const navigate = useNavigate();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await programmesRepository.as(actor).list();
    if (res.ok) {
      setError(null);
      setProgrammes(res.data);
    } else {
      setProgrammes([]);
      setError(`[${res.error.code}] ${res.error.message}`);
    }
  }, [actor]);

  // Re-read once the persisted role is resolved and whenever the actor changes.
  useEffect(() => {
    if (ready) void refresh();
  }, [ready, refresh]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Link to="/programmes/new" className={cn(buttonVariants())}>
          <Plus className="h-4 w-4" />
          New programme
        </Link>
      </div>

      {error ? (
        <Text size="sm" className="text-danger">
          {error}
        </Text>
      ) : programmes.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No programmes yet"
          action={
            <Link to="/programmes/new" className={cn(buttonVariants())}>
              <Plus className="h-4 w-4" />
              New programme
            </Link>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={programmes}
          getRowId={(p) => p.id}
          onRowClick={(p) => navigate(`/programmes/${p.id}`)}
          searchPlaceholder="Search programmes…"
          initialSort={{ key: "year", dir: -1 }}
          rowNoun="programme"
          emptyMessage="No programmes match your filters."
        />
      )}
    </div>
  );
}
