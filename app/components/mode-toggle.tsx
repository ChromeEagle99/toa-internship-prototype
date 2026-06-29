import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

type Mode = "light" | "dark";

const MODE_KEY = "prizm-mode";

/**
 * A light/dark mode toggle, styled as a ghost icon button to sit alongside the
 * header's other actions. Flips the `data-mode` attribute on `<html>`; the token
 * CSS keys off `[data-zone][data-mode]`, so every component re-themes with no
 * component changes. The choice is persisted to localStorage and restored before
 * paint by the inline script in `app/root.tsx`, so there is no flash on reload.
 *
 * Zone stays fixed at `enterprise` for this project (see CLAUDE.md); only the
 * light/dark mode is user-switchable here. The combined zone + mode switcher
 * lives in `~/components/theme-toggle`.
 */
export function ModeToggle() {
  // Start from the SSR default so the first client render matches the server
  // markup (no hydration mismatch); the real value is read from the DOM in the
  // effect below, after the restore script has run.
  const [mode, setMode] = useState<Mode>("light");

  useEffect(() => {
    setMode((document.documentElement.dataset.mode as Mode) ?? "light");
  }, []);

  function toggleMode() {
    const next: Mode = mode === "light" ? "dark" : "light";
    document.documentElement.dataset.mode = next;
    localStorage.setItem(MODE_KEY, next);
    setMode(next);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMode}
      aria-label={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
    >
      {mode === "light" ? <Moon className="size-5" /> : <Sun className="size-5" />}
    </Button>
  );
}
