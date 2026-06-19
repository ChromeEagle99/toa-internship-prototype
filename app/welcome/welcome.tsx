import { Link } from "react-router";

export function Welcome() {
  return (
    <main className="flex flex-col items-center justify-center gap-8 pt-16 pb-4">
      <Link
        to="/components"
        className="text-accent underline-offset-4 transition-colors hover:underline"
      >
        Browse all PRIZM components →
      </Link>
    </main>
  );
}
