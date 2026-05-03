import { z } from "zod";

import { type AppointmentOccurrence, type AppointmentRecord } from "./appointment.js";
import { GENDERS, type Gender } from "./enums.js";
import { type PrescriptionRecord, type PrescriptionRefillOccurrence } from "./prescription.js";
import { PaginationParamsSchema } from "../lib/pagination.js";

const TWO_LETTER_STATE = /^[A-Z]{2}$/;
const PHONE_DIGIT_COUNT = /^\+?[\d\s().-]{10,20}$/;
const PASSWORD_COMPLEXITY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const PATIENT_SORT_FIELDS = [
  "name",
  "dob",
  "createdAt",
  "upcomingAppointments",
  "activeMedications",
] as const;

export type PatientSortField = (typeof PATIENT_SORT_FIELDS)[number];

const trimmed = z.string().trim();
const optionalTrimmed = trimmed.optional().or(z.literal("")).transform((value) => value || undefined);

const PatientBaseSchema = z.object({
  firstName: trimmed.min(1, "First name is required").max(80),
  lastName: trimmed.min(1, "Last name is required").max(80),
  email: trimmed.email("Enter a valid email").max(255),
  phone: trimmed
    .min(10, "Enter a valid phone number")
    .max(20)
    .regex(PHONE_DIGIT_COUNT, "Enter a valid phone number"),
  dob: z
    .string()
    .min(1, "Date of birth is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date")
    .refine((value) => new Date(value) <= new Date(), "Date of birth cannot be in the future"),
  gender: z.enum(GENDERS).default("UNDISCLOSED"),
  addressLine1: optionalTrimmed,
  addressLine2: optionalTrimmed,
  city: optionalTrimmed,
  state: optionalTrimmed
    .transform((value) => value?.toUpperCase())
    .refine((value) => value === undefined || TWO_LETTER_STATE.test(value), "Use 2-letter state code"),
  postalCode: optionalTrimmed,
  notes: optionalTrimmed,
});

const PasswordSchema = trimmed
  .min(8, "Password must be at least 8 characters")
  .regex(
    PASSWORD_COMPLEXITY,
    "Password must include an uppercase letter, lowercase letter, and number",
  );

export const PatientCreateSchema = PatientBaseSchema.extend({
  password: PasswordSchema,
});

export const PatientUpdateSchema = PatientBaseSchema.extend({
  password: PasswordSchema.optional().or(z.literal("")).transform((value) => value || undefined),
});

export type PatientCreateInput = z.input<typeof PatientCreateSchema>;
export type PatientCreateOutput = z.output<typeof PatientCreateSchema>;
export type PatientUpdateInput = z.input<typeof PatientUpdateSchema>;
export type PatientUpdateOutput = z.output<typeof PatientUpdateSchema>;

export const PatientListQuerySchema = PaginationParamsSchema.extend({
  q: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => value || undefined),
  sort: z.enum(PATIENT_SORT_FIELDS).default("createdAt"),
  dir: z.enum(["asc", "desc"]).default("desc"),
});

export type PatientListQuery = z.infer<typeof PatientListQuerySchema>;

export type PatientListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  createdAt: string;
  upcomingAppointmentCount: number;
  activeMedicationCount: number;
};

export type PatientDetail = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: Gender;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  appointments: AppointmentRecord[];
  upcomingAppointments: AppointmentOccurrenceView[];
  prescriptions: PrescriptionRecord[];
  upcomingRefills: RefillOccurrenceView[];
  stats: {
    upcomingAppointmentCount: number;
    activePrescriptionCount: number;
    upcomingRefillCount: number;
  };
};

export type PatientPortalSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: Gender;
  upcomingAppointments: AppointmentOccurrenceView[];
  upcomingRefills: RefillOccurrenceView[];
  prescriptions: PrescriptionRecord[];
  stats: {
    appointmentCount7d: number;
    refillCount7d: number;
    activePrescriptionCount: number;
  };
};

export type AppointmentOccurrenceView = Omit<AppointmentOccurrence, "patientId">;
export type RefillOccurrenceView = Omit<PrescriptionRefillOccurrence, "patientId">;
