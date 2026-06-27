import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ProgrammeCreateWizard } from "~/components/programme/programme-create-wizard";

export default function ProgrammeNew() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        to="/programmes"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 w-fit")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to programmes
      </Link>
      <ProgrammeCreateWizard />
    </div>
  );
}
