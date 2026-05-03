import { createSchedulingDateRange } from "@/features/appointments/lib/recurrence";
import { expandPrescriptionRefills } from "@/features/appointments/lib/recurrence";
import { patientRepository } from "@/features/patients/server/patient-repository";
import { ApiError } from "@/lib/http/api-error";

import type {
  PrescriptionListQuery,
  PrescriptionPatchOutput,
  PrescriptionUpsertOutput,
} from "../schema";
import type { PrescriptionRecord, PrescriptionRefillOccurrence } from "../types";
import { prescriptionRepository } from "./prescription-repository";

export const prescriptionService = {
  list,
  listUpcomingRefillsForPatient,
  getById,
  create,
  update,
  remove,
};

async function list(query: PrescriptionListQuery): Promise<PrescriptionRecord[]> {
  return prescriptionRepository.list(query);
}

async function listUpcomingRefillsForPatient(patientId: string): Promise<PrescriptionRefillOccurrence[]> {
  const prescriptions = await prescriptionRepository.list({ patientId });
  const range = createSchedulingDateRange();

  return prescriptions
    .flatMap((prescription) =>
      expandPrescriptionRefills(
        {
          id: prescription.id,
          patientId: prescription.patientId,
          medicationName: prescription.medicationName,
          dosage: prescription.dosage,
          quantity: prescription.quantity,
          refillDate: new Date(prescription.refillDate),
          refillSchedule: prescription.refillSchedule,
          instructions: prescription.instructions,
          isActive: prescription.isActive,
        },
        range,
      ),
    )
    .sort((a, b) => a.refillDate.localeCompare(b.refillDate));
}

async function getById(id: string): Promise<PrescriptionRecord> {
  const prescription = await prescriptionRepository.findById(id);
  if (!prescription) {
    throw ApiError.notFound("Prescription not found");
  }
  return prescription;
}

async function create(input: PrescriptionUpsertOutput): Promise<PrescriptionRecord> {
  const patient = await patientRepository.findById(input.patientId);
  if (!patient) {
    throw ApiError.notFound("Patient not found");
  }

  const { id } = await prescriptionRepository.create(input);
  return getById(id);
}

async function update(id: string, input: PrescriptionPatchOutput): Promise<PrescriptionRecord> {
  await getById(id);
  if (input.patientId) {
    const patient = await patientRepository.findById(input.patientId);
    if (!patient) {
      throw ApiError.notFound("Patient not found");
    }
  }
  const { id: updatedId } = await prescriptionRepository.update(id, input);
  return getById(updatedId);
}

async function remove(id: string): Promise<{ id: string }> {
  await getById(id);
  return prescriptionRepository.remove(id);
}
