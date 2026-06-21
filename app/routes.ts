import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("components", "routes/components.tsx"),
  route("playground", "routes/playground.tsx"),
  route("playground/multi-step-form", "routes/playground.multi-step-form.tsx"),
] satisfies RouteConfig;
