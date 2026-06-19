---
component: toast
slug: toast
status: stable
source: components/ui/toast.tsx
builtOn: Base UI Toast
---

# Toast

Transient notification shown in the bottom-right corner. Auto-dismisses after 5 seconds.

## Setup

Wrap your root layout in `<ToastProvider>` once. Then call `toast.add()` anywhere (inside or outside React components) to fire a toast.

```tsx
// app/layout.tsx
import { ToastProvider } from "@/components/ui/toast";

export default function RootLayout({ children }) {
  return <ToastProvider>{children}</ToastProvider>;
}
```

## Usage

```tsx
import { toast } from "@/components/ui/toast";

// Simple
toast.add({ title: "Saved" });

// With description
toast.add({ title: "Error", description: "Something went wrong.", type: "error" });

// Auto-dismiss after 3 s
toast.add({ title: "Copied!", timeout: 3000 });

// Persistent (no auto-dismiss)
toast.add({ title: "Processing…", timeout: 0 });

// Promise
toast.promise(saveData(), {
  loading: "Saving…",
  success: "Saved!",
  error: "Failed to save.",
});
```

## Toast types

| type | icon |
|------|------|
| `success` | green check circle |
| `error` | red alert circle |
| `info` | blue info icon |
| (none) | no icon |

<!-- prizm:api-start -->
## Props

_No props on the root — see sub-components below._

## Sub-components

### `ToastProvider`

Wraps the app. Required for `toast.add()` calls to render.

### `ToastViewport`

Where toasts appear. Rendered inside ToastProvider by default.

_Built on Base UI Toast. Trigger via the imperative `toast.add({ title, description, variant })` singleton from `components/ui/toast.tsx`. `<ToastProvider>` must be in `app/layout.tsx` for toasts to render._

_All components also accept standard HTML attributes for their root element (e.g. `id`, `aria-*`, `data-*`, event handlers) and forward `ref` where applicable._
<!-- prizm:api-end -->

## Source

Copy `components/ui/toast.tsx`. Peer deps: `@base-ui-components/react`, `lucide-react`, `clsx`, `tailwind-merge`.
