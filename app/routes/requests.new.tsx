import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ProjectRequestWizard } from "~/components/request/project-request-wizard";

export default function RequestNew() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        to="/requests"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 w-fit")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to project requests
      </Link>
      <ProjectRequestWizard />
    </div>
  );
}
