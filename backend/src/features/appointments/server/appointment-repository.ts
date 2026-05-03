import {
  AppointmentStatus as PrismaAppointmentStatus,
  RepeatSchedule as PrismaRepeatSchedule,
  type Prisma,
  type PrismaClient,
} from "@prisma/client";

import { db } from "@/lib/db";

import type {
  AppointmentListQuery,
  AppointmentPatchOutput,
  AppointmentUpsertOutput,
} from "../schema";
import type { AppointmentRecord } from "../types";

type Db = PrismaClient | Prisma.TransactionClient;

export const appointmentRepository = {
  list,
  findById,
  create,
  update,
  remove,
};

async function list(query: AppointmentListQuery, client: Db = db): Promise<AppointmentRecord[]> {
  const items = await client.appointment.findMany({
    where: {
      patientId: query.patientId,
    },
    orderBy: [{ appointmentDate: "asc" }, { createdAt: "desc" }],
  });

  return items.map(mapRecord);
}

async function findById(id: string, client: Db = db): Promise<AppointmentRecord | null> {
  const item = await client.appointment.findUnique({ where: { id } });
  return item ? mapRecord(item) : null;
}

async function create(input: AppointmentUpsertOutput, client: Db = db) {
  return client.appointment.create({
    data: {
      patientId: input.patientId,
      providerName: input.providerName,
      appointmentDate: new Date(input.appointmentDate),
      repeatSchedule: input.repeatSchedule as PrismaRepeatSchedule,
      repeatEndDate: input.repeatEndDate ? new Date(input.repeatEndDate) : null,
      notes: input.notes,
      status: input.status as PrismaAppointmentStatus,
    },
    select: { id: true },
  });
}

async function update(id: string, input: AppointmentPatchOutput, client: Db = db) {
  return client.appointment.update({
    where: { id },
    data: {
      patientId: input.patientId,
      providerName: input.providerName,
      appointmentDate: input.appointmentDate ? new Date(input.appointmentDate) : undefined,
      repeatSchedule: input.repeatSchedule as PrismaRepeatSchedule | undefined,
      repeatEndDate: input.repeatEndDate ? new Date(input.repeatEndDate) : input.repeatEndDate === undefined ? undefined : null,
      notes: input.notes,
      status: input.status as PrismaAppointmentStatus | undefined,
    },
    select: { id: true },
  });
}

async function remove(id: string, client: Db = db) {
  return client.appointment.delete({
    where: { id },
    select: { id: true },
  });
}

function mapRecord(record: {
  id: string;
  patientId: string;
  providerName: string;
  appointmentDate: Date;
  repeatSchedule: AppointmentRecord["repeatSchedule"];
  repeatEndDate: Date | null;
  notes: string | null;
  status: AppointmentRecord["status"];
  createdAt: Date;
  updatedAt: Date;
}): AppointmentRecord {
  return {
    id: record.id,
    patientId: record.patientId,
    providerName: record.providerName,
    appointmentDate: record.appointmentDate.toISOString(),
    repeatSchedule: record.repeatSchedule,
    repeatEndDate: record.repeatEndDate?.toISOString() ?? null,
    notes: record.notes,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
