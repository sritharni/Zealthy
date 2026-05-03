import { z } from "zod";

import { REFILL_SCHEDULES, type RefillSchedule } from "./enums.js";

const trimmed = z.string().trim();
const optionalTrimmed = trimmed.optional().or(z.literal("")).transform((value) => value || undefined);

export const PrescriptionUpsertSchema = z.object({
  patientId: trimmed.min(1, "Patient is required"),
  medicationCatalogId: optionalTrimmed,
  medicationName: trimmed.min(1, "Medication name is required"),
  dosage: trimmed.min(1, "Dosage is required"),
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0"),
  refillDate: z
    .string()
    .min(1, "Refill date is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid refill date"),
  refillSchedule: z.enum(REFILL_SCHEDULES),
  instructions: optionalTrimmed,
  isActive: z.boolean().default(true),
});

export const PrescriptionPatchSchema = PrescriptionUpsertSchema.partial().extend({
  patientId: z.string().trim().optional(),
  quantity: z.coerce.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export const PrescriptionListQuerySchema = z.object({
  patientId: z.string().trim().optional(),
});

export type PrescriptionUpsertInput = z.input<typeof PrescriptionUpsertSchema>;
export type PrescriptionUpsertOutput = z.output<typeof PrescriptionUpsertSchema>;
export type PrescriptionPatchInput = z.input<typeof PrescriptionPatchSchema>;
export type PrescriptionPatchOutput = z.output<typeof PrescriptionPatchSchema>;
export type PrescriptionListQuery = z.infer<typeof PrescriptionListQuerySchema>;

export type PrescriptionRecord = {
  id: string;
  patientId: string;
  medicationCatalogId: string | null;
  medicationName: string;
  dosage: string;
  quantity: number;
  refillDate: string;
  refillSchedule: RefillSchedule;
  instructions: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PrescriptionRefillOccurrence = {
  id: string;
  prescriptionId: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  quantity: number;
  refillDate: string;
  refillSchedule: RefillSchedule;
  instructions: string | null;
  isActive: boolean;
  isRecurring: boolean;
};
