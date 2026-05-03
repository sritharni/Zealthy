import { ApiError } from "@/lib/http/api-error";
import { hashPassword } from "@/lib/auth/password";
import type { Paginated } from "@/lib/http/api-response";

import type {
  PatientCreateOutput,
  PatientListQuery,
  PatientUpdateOutput,
} from "../schema";
import type { PatientDetail, PatientListItem, PatientPortalSummary } from "../types";
import { patientRepository } from "./patient-repository";

export const patientService = {
  list,
  getById,
  getPortalSummary,
  create,
  update,
};

async function list(query: PatientListQuery): Promise<Paginated<PatientListItem>> {
  const [items, total] = await Promise.all([
    patientRepository.list(query),
    patientRepository.count(query),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  return {
    items,
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages,
  };
}

async function getById(id: string): Promise<PatientDetail> {
  const patient = await patientRepository.findById(id);
  if (!patient) {
    throw ApiError.notFound("Patient not found");
  }
  return patient;
}

async function getPortalSummary(id: string): Promise<PatientPortalSummary> {
  const patient = await patientRepository.findPortalSummaryById(id);
  if (!patient) {
    throw ApiError.notFound("Patient not found");
  }
  return patient;
}

async function create(input: PatientCreateOutput): Promise<PatientDetail> {
  await assertEmailAvailable(input.email);
  const { id } = await patientRepository.create({
    ...input,
    password: await hashPassword(input.password),
  });
  return getById(id);
}

async function update(id: string, input: PatientUpdateOutput): Promise<PatientDetail> {
  const existing = await patientRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Patient not found");
  }

  if (input.email !== existing.email) {
    await assertEmailAvailable(input.email, id);
  }

  const { password, ...rest } = input;
  const { id: updatedId } = await patientRepository.update(id, {
    ...rest,
    password: password ? await hashPassword(password) : undefined,
  });
  return getById(updatedId);
}

async function assertEmailAvailable(email: string, excludeId?: string) {
  const exists = await patientRepository.existsByEmail(email, excludeId);
  if (exists) {
    throw ApiError.conflict("A patient with this email already exists");
  }
}
