import { RefillSchedule as PrismaRefillSchedule, type Prisma, type PrismaClient } from "@prisma/client";

import { db } from "@/lib/db";

import type {
  PrescriptionListQuery,
  PrescriptionPatchOutput,
  PrescriptionUpsertOutput,
} from "../schema";
import type { PrescriptionRecord } from "../types";

type Db = PrismaClient | Prisma.TransactionClient;

export const prescriptionRepository = {
  list,
  findById,
  create,
  update,
  remove,
};

async function list(query: PrescriptionListQuery, client: Db = db): Promise<PrescriptionRecord[]> {
  const items = await client.prescription.findMany({
    where: {
      patientId: query.patientId,
    },
    orderBy: [{ isActive: "desc" }, { refillDate: "asc" }],
  });
  return items.map(mapRecord);
}

async function findById(id: string, client: Db = db): Promise<PrescriptionRecord | null> {
  const item = await client.prescription.findUnique({ where: { id } });
  return item ? mapRecord(item) : null;
}

async function create(input: PrescriptionUpsertOutput, client: Db = db) {
  return client.prescription.create({
    data: {
      patientId: input.patientId,
      medicationCatalogId: input.medicationCatalogId,
      medicationName: input.medicationName,
      dosage: input.dosage,
      quantity: input.quantity,
      refillDate: new Date(input.refillDate),
      refillSchedule: input.refillSchedule as PrismaRefillSchedule,
      instructions: input.instructions,
      isActive: input.isActive,
    },
    select: { id: true },
  });
}

async function update(id: string, input: PrescriptionPatchOutput, client: Db = db) {
  return client.prescription.update({
    where: { id },
    data: {
      patientId: input.patientId,
      medicationCatalogId: input.medicationCatalogId,
      medicationName: input.medicationName,
      dosage: input.dosage,
      quantity: input.quantity,
      refillDate: input.refillDate ? new Date(input.refillDate) : undefined,
      refillSchedule: input.refillSchedule as PrismaRefillSchedule | undefined,
      instructions: input.instructions,
      isActive: input.isActive,
    },
    select: { id: true },
  });
}

async function remove(id: string, client: Db = db) {
  return client.prescription.delete({
    where: { id },
    select: { id: true },
  });
}

function mapRecord(record: {
  id: string;
  patientId: string;
  medicationCatalogId: string | null;
  medicationName: string;
  dosage: string;
  quantity: number;
  refillDate: Date;
  refillSchedule: PrescriptionRecord["refillSchedule"];
  instructions: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): PrescriptionRecord {
  return {
    id: record.id,
    patientId: record.patientId,
    medicationCatalogId: record.medicationCatalogId,
    medicationName: record.medicationName,
    dosage: record.dosage,
    quantity: record.quantity,
    refillDate: record.refillDate.toISOString().slice(0, 10),
    refillSchedule: record.refillSchedule,
    instructions: record.instructions,
    isActive: record.isActive,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
