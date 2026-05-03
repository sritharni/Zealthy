export const apiRoutes = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
  },
  patients: {
    collection: "/patients",
    item: (id: string) => `/patients/${id}`,
    portalSummary: (id: string) => `/patients/${id}/portal-summary`,
  },
  appointments: {
    collection: "/appointments",
    item: (id: string) => `/appointments/${id}`,
  },
  prescriptions: {
    collection: "/prescriptions",
    item: (id: string) => `/prescriptions/${id}`,
  },
  medicationCatalog: {
    collection: "/medication-catalog",
  },
} as const;
