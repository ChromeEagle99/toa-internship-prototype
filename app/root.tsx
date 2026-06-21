import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
// react-grid-layout's structural CSS (item transitions, placeholder, resize
// handle positioning). Imported before app.css so our token-based overrides
// there win. Local package asset — no external URL, air-gap clean.
import "react-grid-layout/css/styles.css";
import "./app.css";

export const links: Route.LinksFunction = () => [
  // Self-hosted fonts only — see app/app.css @font-face. No external CDN.
  {
    rel: "preload",
    href: "/fonts/Inter/Inter-VariableFont_opsz,wght.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
];

// Restores the persisted PRIZM theme before paint so a reload doesn't flash the
// default enterprise-light theme. Kept inline (repo-local) to honour air-gap discipline.
const restoreTheme = `(function(){try{var z=localStorage.getItem("prizm-zone"),m=localStorage.getItem("prizm-mode"),e=document.documentElement;if(z==="enterprise"||z==="c3")e.dataset.zone=z;if(m==="light"||m==="dark")e.dataset.mode=m;}catch(_){}})();`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-zone="enterprise" data-mode="light" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: restoreTheme }} />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
