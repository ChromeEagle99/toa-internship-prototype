import { EmptyState, Button } from "toa-project";
import { Inbox, FolderOpen, SearchX } from "lucide-react";

export function NoProjects() {
  return (
    <div className="rounded-lg border border-border bg-surface" style={{ maxWidth: 420 }}>
      <EmptyState
        icon={<FolderOpen className="h-6 w-6" />}
        title="No projects yet"
        description="Create your first project to start organising work across your team."
        action={
          <Button variant="solid" size="sm">
            New project
          </Button>
        }
      />
    </div>
  );
}

export function EmptyInbox() {
  return (
    <div className="rounded-lg border border-border bg-surface" style={{ maxWidth: 420 }}>
      <EmptyState
        icon={<Inbox className="h-6 w-6" />}
        title="You&rsquo;re all caught up"
        description="There are no new notifications. We&rsquo;ll let you know when something needs your attention."
      />
    </div>
  );
}

export function NoResults() {
  return (
    <div className="rounded-lg border border-border bg-surface" style={{ maxWidth: 420 }}>
      <EmptyState
        icon={<SearchX className="h-6 w-6" />}
        title="No matching results"
        description="We couldn&rsquo;t find anything for that search. Try a different keyword or clear your filters."
        action={
          <Button variant="outline" size="sm">
            Clear filters
          </Button>
        }
      />
    </div>
  );
}
