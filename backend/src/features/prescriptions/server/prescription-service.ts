import { patientRepository } from "@/features/patients/server/patient-repository";
import { ApiError } from "@/lib/http/api-error";

import type {
  PrescriptionListQuery,
  PrescriptionPatchOutput,
  PrescriptionUpsertOutput,
} from "../schema";
import type { PrescriptionRecord } from "../types";
import { prescriptionRepository } from "./prescription-repository";

export const prescriptionService = {
  list,
  getById,
  create,
  update,
  remove,
};

async function list(query: PrescriptionListQuery): Promise<PrescriptionRecord[]> {
  return prescriptionRepository.list(query);
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
