export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  NON_BINARY: "NON_BINARY",
  OTHER: "OTHER",
  UNDISCLOSED: "UNDISCLOSED",
} as const;
export const GENDERS = ["MALE", "FEMALE", "NON_BINARY", "OTHER", "UNDISCLOSED"] as const;
export type Gender = (typeof GENDERS)[number];

export const AppointmentStatus = {
  SCHEDULED: "SCHEDULED",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
} as const;
export const APPOINTMENT_STATUSES = [
  "SCHEDULED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const RepeatSchedule = {
  NONE: "NONE",
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
} as const;
export const REPEAT_SCHEDULES = ["NONE", "DAILY", "WEEKLY", "MONTHLY"] as const;
export type RepeatSchedule = (typeof REPEAT_SCHEDULES)[number];

export const RefillSchedule = {
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  YEARLY: "YEARLY",
} as const;
export const REFILL_SCHEDULES = ["MONTHLY", "QUARTERLY", "YEARLY"] as const;
export type RefillSchedule = (typeof REFILL_SCHEDULES)[number];
