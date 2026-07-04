import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("programmes", "routes/programmes.tsx"),
  route("programmes/new", "routes/programmes.new.tsx"),
  route("projects", "routes/projects.tsx"),
  route("projects/new", "routes/projects.new.tsx"),
  route("projects/upload", "routes/projects.upload.tsx"),
  route("my-projects", "routes/my-projects.tsx"),
  route("project-requests", "routes/project-requests.tsx"),
  route("project-requests/new", "routes/project-requests.new.tsx"),
  route(
    "project-requests/:requestId/respond",
    "routes/project-requests.$requestId.respond.tsx",
  ),
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
  route(
    "playground/month-multi-select",
    "routes/playground.month-multi-select.tsx",
  ),
  route("playground/gantt", "routes/playground.gantt.tsx"),
  route("dev/db", "routes/dev.db.tsx"),
  route("login/applicant", "routes/login.applicant.tsx"),
  route("login/corporate", "routes/login.corporate.tsx"),
  route("act-as", "routes/act-as.tsx"),
  route("playground/programmes", "routes/playground.programmes.tsx"),
] satisfies RouteConfig;
