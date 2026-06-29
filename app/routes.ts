import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("programmes", "routes/programmes.tsx"),
  route("projects", "routes/projects.tsx"),
  route("components", "routes/components.tsx"),
  route("playground", "routes/playground.tsx"),
  route("playground/multi-step-form", "routes/playground.multi-step-form.tsx"),
  route("playground/data-access", "routes/playground.data-access.tsx"),
  route(
    "playground/date-range-picker",
    "routes/playground.date-range-picker.tsx",
  ),
  route("playground/dashboard", "routes/playground.dashboard.tsx"),
  route("playground/shell", "routes/playground.shell.tsx"),
  route(
    "playground/searchable-dropdown",
    "routes/playground.searchable-dropdown.tsx",
  ),
  route("dev/db", "routes/dev.db.tsx"),
  route("login/applicant", "routes/login.applicant.tsx"),
  route("login/corporate", "routes/login.corporate.tsx"),
  route("act-as", "routes/act-as.tsx"),
  route("playground/programmes", "routes/playground.programmes.tsx"),
] satisfies RouteConfig;
