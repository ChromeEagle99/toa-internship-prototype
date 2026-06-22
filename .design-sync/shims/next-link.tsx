// design-sync shim for `next/link`.
//
// The vendored PRIZM `components/ui/link.tsx` imports `next/link`, but this
// project is a React Router app with no `next` dependency. Claude Design
// renders plain React (no Next router), so a plain anchor is the correct
// rendering target there. This shim is used ONLY by the sync bundle via
// `.design-sync/tsconfig.sync.json`; the app's own tsconfig is untouched.
import { forwardRef, type ComponentPropsWithoutRef } from "react";

type NextLinkProps = ComponentPropsWithoutRef<"a"> & { href?: string };

const NextLink = forwardRef<HTMLAnchorElement, NextLinkProps>(
  ({ href, children, ...props }, ref) => (
    <a ref={ref} href={typeof href === "string" ? href : "#"} {...props}>
      {children}
    </a>
  ),
);
NextLink.displayName = "NextLinkShim";

export default NextLink;
