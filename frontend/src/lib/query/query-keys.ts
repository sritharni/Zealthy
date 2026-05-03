import type { AppointmentListQuery } from "@/features/appointments/schema";
import type { PatientListQuery } from "@/features/patients/schema";
import type { PrescriptionListQuery } from "@/features/prescriptions/schema";

/**
 * Centralized query key registry. Keeping keys in one place keeps cache
 * invalidation honest — every consumer reads the same key shape.
 */
export const queryKeys = {
  patients: {
    all: ["patients"] as const,
    lists: () => [...queryKeys.patients.all, "list"] as const,
    list: (params: PatientListQuery) => [...queryKeys.patients.lists(), params] as const,
    details: () => [...queryKeys.patients.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.patients.details(), id] as const,
  },
  appointments: {
    all: ["appointments"] as const,
    lists: () => [...queryKeys.appointments.all, "list"] as const,
    list: (params: AppointmentListQuery) => [...queryKeys.appointments.lists(), params] as const,
  },
  prescriptions: {
    all: ["prescriptions"] as const,
    lists: () => [...queryKeys.prescriptions.all, "list"] as const,
    list: (params: PrescriptionListQuery) => [...queryKeys.prescriptions.lists(), params] as const,
  },
  medicationCatalog: {
    all: ["medicationCatalog"] as const,
  },
} as const;
