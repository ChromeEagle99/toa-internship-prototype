import { BookOpen, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Text } from "@/components/ui/text";
import { useActor } from "~/context/actor-context";
import { programmesRepository, type Programme } from "~/data";

/**
 * Programmes list (IO Admin). Reads through the data layer with the current
 * actor, so the policy decides visibility. Data access runs in an effect because
 * the localStorage backend is browser-only.
 */
export default function ProgrammesIndex() {
  const { actor, ready } = useActor();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await programmesRepository.as(actor).list();
    if (res.ok) {
      setError(null);
      setProgrammes([...res.data].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title)));
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
      <div className="flex items-center justify-between">
        <Text variant="muted">Internship cohorts you manage, grouped by education level and year.</Text>
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
          description="Create a programme to set the frame for an internship cohort."
          action={
            <Link to="/programmes/new" className={cn(buttonVariants())}>
              <Plus className="h-4 w-4" />
              New programme
            </Link>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Programme</TableHead>
              <TableHead>Education level</TableHead>
              <TableHead>Year</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programmes.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  <Link to={`/programmes/${p.id}`} className="hover:underline">
                    {p.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="subtle">{p.educationLevel}</Badge>
                </TableCell>
                <TableCell>{p.year}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
