export { apiRoutes } from "@/shared";

/**
 * Single source of truth for routes. Components and tests import these
 * helpers instead of hardcoding paths.
 */
export const routes = {
  home: "/",
  auth: {
    login: "/",
  },
  portal: {
    dashboard: "/dashboard",
    appointments: "/appointments",
    prescriptions: "/prescriptions",
  },
  admin: {
    root: "/admin",
    patients: {
      list: "/admin",
      new: "/admin/patients/new",
      detail: (id: string) => `/admin/patients/${id}`,
      edit: (id: string) => `/admin/patients/${id}/edit`,
    },
  },
} as const;
