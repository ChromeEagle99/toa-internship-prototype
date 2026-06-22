// design-sync shim for `@/lib/theme-context`.
//
// This module does not exist in the repo — only the vendored
// `components/rc3/swatch.tsx` (RC3Swatch) imports it, and RC3Swatch is excluded
// from the sync (see config.json componentSrcMap). But synth-entry mode bundles
// every source file, so the file must still compile. This shim provides a no-op
// `useTheme` returning the active enterprise/light default. Used ONLY by the
// sync bundle via `.design-sync/tsconfig.sync.json`.
export function useTheme(): { mode: "light" | "dark" } {
  return { mode: "light" };
}
