import { createSchedulingDateRange, expandAppointmentOccurrences } from "@/features/appointments/lib/recurrence";
import { patientRepository } from "@/features/patients/server/patient-repository";
import { ApiError } from "@/lib/http/api-error";

import type {
  AppointmentPatchOutput,
  AppointmentUpsertOutput,
  AppointmentListQuery,
} from "../schema";
import type { AppointmentOccurrence, AppointmentRecord } from "../types";
import { appointmentRepository } from "./appointment-repository";

export const appointmentService = {
  list,
  listOccurrencesForPatient,
  getById,
  create,
  update,
  remove,
};

async function list(query: AppointmentListQuery): Promise<AppointmentRecord[]> {
  return appointmentRepository.list(query);
}

async function listOccurrencesForPatient(patientId: string): Promise<AppointmentOccurrence[]> {
  const appointments = await appointmentRepository.list({ patientId });
  const range = createSchedulingDateRange();

  return appointments
    .flatMap((appointment) =>
      expandAppointmentOccurrences(
        {
          id: appointment.id,
          patientId: appointment.patientId,
          providerName: appointment.providerName,
          appointmentDate: new Date(appointment.appointmentDate),
          repeatSchedule: appointment.repeatSchedule,
          repeatEndDate: appointment.repeatEndDate ? new Date(appointment.repeatEndDate) : null,
          notes: appointment.notes,
          status: appointment.status,
        },
        range,
      ),
    )
    .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate));
}

async function getById(id: string): Promise<AppointmentRecord> {
  const appointment = await appointmentRepository.findById(id);
  if (!appointment) {
    throw ApiError.notFound("Appointment not found");
  }
  return appointment;
}

async function create(input: AppointmentUpsertOutput): Promise<AppointmentRecord> {
  const patient = await patientRepository.findById(input.patientId);
  if (!patient) {
    throw ApiError.notFound("Patient not found");
  }

  const { id } = await appointmentRepository.create(input);
  return getById(id);
}

async function update(id: string, input: AppointmentPatchOutput): Promise<AppointmentRecord> {
  await getById(id);
  if (input.patientId) {
    const patient = await patientRepository.findById(input.patientId);
    if (!patient) {
      throw ApiError.notFound("Patient not found");
    }
  }
  const { id: updatedId } = await appointmentRepository.update(id, input);
  return getById(updatedId);
}

async function remove(id: string): Promise<{ id: string }> {
  await getById(id);
  return appointmentRepository.remove(id);
}
