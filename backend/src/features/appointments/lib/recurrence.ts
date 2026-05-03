import { addDays, addMonths, addWeeks, endOfDay, isAfter, isBefore, startOfDay } from "date-fns";
import { RepeatSchedule, RefillSchedule, type Appointment, type Prescription } from "@prisma/client";

const MAX_APPOINTMENT_MONTHS = 3;
const MAX_DASHBOARD_DAYS = 7;

export type DateRange = {
  start: Date;
  end: Date;
};

export type AppointmentOccurrence = {
  id: string;
  appointmentId: string;
  patientId: string;
  providerName: string;
  appointmentDate: string;
  repeatSchedule: RepeatSchedule;
  status: Appointment["status"];
  notes: string | null;
  isRecurring: boolean;
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

export function createPortalDateRange(days = MAX_DASHBOARD_DAYS): DateRange {
  const start = startOfDay(new Date());
  return { start, end: endOfDay(addDays(start, days)) };
}

export function createSchedulingDateRange(months = MAX_APPOINTMENT_MONTHS): DateRange {
  const start = startOfDay(new Date());
  return { start, end: endOfDay(addMonths(start, months)) };
}

export function expandAppointmentOccurrences(
  appointment: Pick<
    Appointment,
    "id" | "patientId" | "providerName" | "appointmentDate" | "repeatSchedule" | "repeatEndDate" | "notes" | "status"
  >,
  range: DateRange,
): AppointmentOccurrence[] {
  return expandRecurringDates(
    appointment.appointmentDate,
    appointment.repeatSchedule,
    appointment.repeatEndDate,
    range,
  ).map((occurrenceDate, index) => ({
    id: `${appointment.id}:${index}`,
    appointmentId: appointment.id,
    patientId: appointment.patientId,
    providerName: appointment.providerName,
    appointmentDate: occurrenceDate.toISOString(),
    repeatSchedule: appointment.repeatSchedule,
    status: appointment.status,
    notes: appointment.notes,
    isRecurring: appointment.repeatSchedule !== RepeatSchedule.NONE,
  }));
}

export function expandPrescriptionRefills(
  prescription: Pick<
    Prescription,
    "id" | "patientId" | "medicationName" | "dosage" | "quantity" | "refillDate" | "refillSchedule" | "instructions" | "isActive"
  >,
  range: DateRange,
): PrescriptionRefillOccurrence[] {
  if (!prescription.isActive) return [];

  return expandRefillDates(prescription.refillDate, prescription.refillSchedule, range).map(
    (occurrenceDate, index) => ({
      id: `${prescription.id}:${index}`,
      prescriptionId: prescription.id,
      patientId: prescription.patientId,
    medicationName: prescription.medicationName,
    dosage: prescription.dosage,
    quantity: prescription.quantity,
    refillDate: occurrenceDate.toISOString(),
    refillSchedule: prescription.refillSchedule,
      instructions: prescription.instructions,
      isActive: prescription.isActive,
      isRecurring: true,
    }),
  );
}

function expandRecurringDates(
  anchor: Date,
  schedule: RepeatSchedule,
  repeatEndDate: Date | null,
  range: DateRange,
): Date[] {
  const results: Date[] = [];
  let cursor = new Date(anchor);
  let step = 0;

  while (!isAfter(cursor, range.end)) {
    const withinLowerBound = !isBefore(cursor, range.start);
    const withinUpperBound = repeatEndDate ? !isAfter(cursor, endOfDay(repeatEndDate)) : true;

    if (withinLowerBound && withinUpperBound) {
      results.push(new Date(cursor));
    }

    if (schedule === RepeatSchedule.NONE || (repeatEndDate && isAfter(cursor, endOfDay(repeatEndDate)))) {
      break;
    }

    step += 1;
    cursor = incrementDate(anchor, schedule, step);
  }

  return results;
}

function incrementDate(anchor: Date, schedule: RepeatSchedule, step: number): Date {
  switch (schedule) {
    case RepeatSchedule.DAILY:
      return addDays(anchor, step);
    case RepeatSchedule.WEEKLY:
      return addWeeks(anchor, step);
    case RepeatSchedule.MONTHLY:
      return addMonths(anchor, step);
    case RepeatSchedule.NONE:
    default:
      return anchor;
  }
}

function expandRefillDates(anchor: Date, schedule: RefillSchedule, range: DateRange): Date[] {
  const results: Date[] = [];
  let cursor = new Date(anchor);
  let step = 0;

  while (!isAfter(cursor, range.end)) {
    if (!isBefore(cursor, range.start)) {
      results.push(new Date(cursor));
    }
    step += 1;
    cursor = incrementRefillDate(anchor, schedule, step);
  }

  return results;
}

function incrementRefillDate(anchor: Date, schedule: RefillSchedule, step: number): Date {
  switch (schedule) {
    case RefillSchedule.MONTHLY:
      return addMonths(anchor, step);
    case RefillSchedule.QUARTERLY:
      return addMonths(anchor, step * 3);
    case RefillSchedule.YEARLY:
      return addMonths(anchor, step * 12);
  }
}
