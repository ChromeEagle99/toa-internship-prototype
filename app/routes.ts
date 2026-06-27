import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  // The portal — every feature route renders inside the app shell.
  layout("routes/shell.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("programmes", "routes/programmes._index.tsx"),
    route("programmes/new", "routes/programmes.new.tsx"),
    route("programmes/:id", "routes/programmes.$id.tsx"),
    route("requests", "routes/requests._index.tsx"),
    route("requests/new", "routes/requests.new.tsx"),
    route("projects", "routes/projects._index.tsx"),
    route("submissions", "routes/submissions._index.tsx"),
  ]),

  // Design-system playground / demos — kept outside the shell.
  route("components", "routes/components.tsx"),
  route("playground", "routes/playground.tsx"),
  route("playground/multi-step-form", "routes/playground.multi-step-form.tsx"),
  route("playground/data-access", "routes/playground.data-access.tsx"),
  route("playground/date-range-picker", "routes/playground.date-range-picker.tsx"),
  route("playground/dashboard", "routes/playground.dashboard.tsx"),
] satisfies RouteConfig;
