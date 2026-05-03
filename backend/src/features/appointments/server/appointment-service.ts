import { patientRepository } from "@/features/patients/server/patient-repository";
import { ApiError } from "@/lib/http/api-error";

import type {
  AppointmentPatchOutput,
  AppointmentUpsertOutput,
  AppointmentListQuery,
} from "../schema";
import type { AppointmentRecord } from "../types";
import { appointmentRepository } from "./appointment-repository";

export const appointmentService = {
  list,
  getById,
  create,
  update,
  remove,
};

async function list(query: AppointmentListQuery): Promise<AppointmentRecord[]> {
  return appointmentRepository.list(query);
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
