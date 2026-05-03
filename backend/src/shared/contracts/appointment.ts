import { z } from "zod";

import {
  APPOINTMENT_STATUSES,
  REPEAT_SCHEDULES,
  type AppointmentStatus,
  type RepeatSchedule,
} from "./enums.js";

const trimmed = z.string().trim();
const optionalTrimmed = trimmed.optional().or(z.literal("")).transform((value) => value || undefined);

const AppointmentBaseSchema = z.object({
  patientId: trimmed.min(1, "Patient is required"),
  providerName: trimmed.min(1, "Provider name is required").max(120),
  appointmentDate: z
    .string()
    .min(1, "Appointment date is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid appointment date"),
  repeatSchedule: z.enum(REPEAT_SCHEDULES).default("NONE"),
  repeatEndDate: optionalTrimmed,
  notes: optionalTrimmed,
  status: z.enum(APPOINTMENT_STATUSES).default("SCHEDULED"),
});

export const AppointmentUpsertSchema = AppointmentBaseSchema.superRefine((
  value: z.output<typeof AppointmentBaseSchema>,
  ctx,
) => {
  if (value.repeatSchedule !== "NONE" && !value.repeatEndDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["repeatEndDate"],
      message: "Repeat end date is required for recurring appointments",
    });
  }

  if (
    value.repeatEndDate &&
    !Number.isNaN(Date.parse(value.repeatEndDate)) &&
    new Date(value.repeatEndDate) < new Date(value.appointmentDate)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["repeatEndDate"],
      message: "Repeat end date cannot be earlier than the appointment date",
    });
  }
});

export const AppointmentPatchSchema = AppointmentBaseSchema.partial().extend({
  patientId: z.string().trim().optional(),
});

export const AppointmentListQuerySchema = z.object({
  patientId: z.string().trim().optional(),
});

export type AppointmentUpsertInput = z.input<typeof AppointmentUpsertSchema>;
export type AppointmentUpsertOutput = z.output<typeof AppointmentUpsertSchema>;
export type AppointmentPatchInput = z.input<typeof AppointmentPatchSchema>;
export type AppointmentPatchOutput = z.output<typeof AppointmentPatchSchema>;
export type AppointmentListQuery = z.infer<typeof AppointmentListQuerySchema>;

export type AppointmentRecord = {
  id: string;
  patientId: string;
  providerName: string;
  appointmentDate: string;
  repeatSchedule: RepeatSchedule;
  repeatEndDate: string | null;
  notes: string | null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type AppointmentOccurrence = {
  id: string;
  appointmentId: string;
  patientId: string;
  providerName: string;
  appointmentDate: string;
  repeatSchedule: RepeatSchedule;
  notes: string | null;
  status: AppointmentStatus;
  isRecurring: boolean;
};
