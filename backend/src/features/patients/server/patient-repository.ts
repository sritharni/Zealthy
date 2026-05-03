import { Gender as PrismaGender, type Prisma, type PrismaClient } from "@prisma/client";

import {
  createPortalDateRange,
  createSchedulingDateRange,
  expandAppointmentOccurrences,
  expandPrescriptionRefills,
} from "@/features/appointments/lib/recurrence";
import { db } from "@/lib/db";
import { toSkipTake } from "@/lib/http/pagination";

import type {
  PatientCreateOutput,
  PatientListQuery,
  PatientUpdateOutput,
} from "../schema";
import type {
  AppointmentOccurrenceView,
  AppointmentRecord,
  PatientDetail,
  PatientListItem,
  PatientPortalSummary,
  PrescriptionRecord,
  RefillOccurrenceView,
} from "../types";

type Db = PrismaClient | Prisma.TransactionClient;

export const patientRepository = {
  list,
  count,
  findById,
  findAuthByEmail,
  findPortalSummaryById,
  create,
  update,
  existsByEmail,
};

async function list(query: PatientListQuery, client: Db = db): Promise<PatientListItem[]> {
  const where = buildSearchWhere(query.q);
  const orderBy = buildOrderBy(query);

  if (query.sort === "upcomingAppointments" || query.sort === "activeMedications") {
    const patients = await client.patient.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      select: PATIENT_LIST_SELECT,
    });

    const decorated = await decoratePatients(patients, client);
    decorated.sort(compareAggregate(query));
    const { skip, take } = toSkipTake(query);
    return decorated.slice(skip, skip + take);
  }

  const { skip, take } = toSkipTake(query);
  const patients = await client.patient.findMany({
    where,
    orderBy,
    skip,
    take,
    select: PATIENT_LIST_SELECT,
  });

  return decoratePatients(patients, client);
}

async function count(query: PatientListQuery, client: Db = db): Promise<number> {
  return client.patient.count({ where: buildSearchWhere(query.q) });
}

async function findById(id: string, client: Db = db): Promise<PatientDetail | null> {
  const patient = await client.patient.findUnique({
    where: { id },
    include: {
      appointments: {
        orderBy: [{ appointmentDate: "asc" }],
      },
      prescriptions: {
        orderBy: [{ isActive: "desc" }, { refillDate: "asc" }],
      },
    },
  });

  if (!patient) return null;

  const schedulingRange = createSchedulingDateRange();
  const upcomingAppointments = patient.appointments
    .flatMap((appointment) => expandAppointmentOccurrences(appointment, schedulingRange))
    .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate))
    .map(mapAppointmentOccurrence);

  const upcomingRefills = patient.prescriptions
    .flatMap((prescription) => expandPrescriptionRefills(prescription, schedulingRange))
    .sort((a, b) => a.refillDate.localeCompare(b.refillDate))
    .map(mapRefillOccurrence);

  const prescriptions = patient.prescriptions.map(mapPrescriptionRecord);

  return {
    id: patient.id,
    firstName: patient.firstName,
    lastName: patient.lastName,
    email: patient.email,
    phone: patient.phone,
    dob: toDateOnlyIso(patient.dob),
    gender: patient.gender,
    addressLine1: patient.addressLine1,
    addressLine2: patient.addressLine2,
    city: patient.city,
    state: patient.state,
    postalCode: patient.postalCode,
    notes: patient.notes,
    createdAt: patient.createdAt.toISOString(),
    updatedAt: patient.updatedAt.toISOString(),
    appointments: patient.appointments.map(mapAppointmentRecord),
    upcomingAppointments,
    prescriptions,
    upcomingRefills,
    stats: {
      upcomingAppointmentCount: upcomingAppointments.length,
      activePrescriptionCount: prescriptions.filter((prescription) => prescription.isActive).length,
      upcomingRefillCount: upcomingRefills.length,
    },
  };
}

async function findPortalSummaryById(id: string, client: Db = db): Promise<PatientPortalSummary | null> {
  const patient = await client.patient.findUnique({
    where: { id },
    include: {
      appointments: { orderBy: [{ appointmentDate: "asc" }] },
      prescriptions: { orderBy: [{ isActive: "desc" }, { refillDate: "asc" }] },
    },
  });

  if (!patient) return null;

  const portalRange = createPortalDateRange();
  const upcomingAppointments = patient.appointments
    .flatMap((appointment) => expandAppointmentOccurrences(appointment, portalRange))
    .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate))
    .map(mapAppointmentOccurrence);
  const upcomingRefills = patient.prescriptions
    .flatMap((prescription) => expandPrescriptionRefills(prescription, portalRange))
    .sort((a, b) => a.refillDate.localeCompare(b.refillDate))
    .map(mapRefillOccurrence);

  const prescriptions = patient.prescriptions.map(mapPrescriptionRecord);

  return {
    id: patient.id,
    firstName: patient.firstName,
    lastName: patient.lastName,
    email: patient.email,
    phone: patient.phone,
    dob: toDateOnlyIso(patient.dob),
    gender: patient.gender,
    upcomingAppointments,
    upcomingRefills,
    prescriptions,
    stats: {
      appointmentCount7d: upcomingAppointments.length,
      refillCount7d: upcomingRefills.length,
      activePrescriptionCount: prescriptions.filter((prescription) => prescription.isActive).length,
    },
  };
}

async function findAuthByEmail(email: string, client: Db = db) {
  return client.patient.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      passwordHash: true,
    },
  });
}

async function create(input: PatientCreateOutput, client: Db = db) {
  return client.patient.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash: input.password,
      phone: input.phone,
      dob: new Date(input.dob),
      gender: input.gender as PrismaGender,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      notes: input.notes,
    },
    select: { id: true },
  });
}

async function update(id: string, input: PatientUpdateOutput, client: Db = db) {
  return client.patient.update({
    where: { id },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash: input.password,
      phone: input.phone,
      dob: new Date(input.dob),
      gender: input.gender as PrismaGender,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      notes: input.notes,
    },
    select: { id: true },
  });
}

async function existsByEmail(email: string, excludeId?: string, client: Db = db): Promise<boolean> {
  const found = await client.patient.findFirst({
    where: { email, id: excludeId ? { not: excludeId } : undefined },
    select: { id: true },
  });
  return found !== null;
}

const PATIENT_LIST_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  dob: true,
  createdAt: true,
} satisfies Prisma.PatientSelect;

type PatientRow = Prisma.PatientGetPayload<{ select: typeof PATIENT_LIST_SELECT }>;

function buildSearchWhere(q?: string): Prisma.PatientWhereInput {
  if (!q) return {};
  return {
    OR: [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ],
  };
}

function buildOrderBy(query: PatientListQuery): Prisma.PatientOrderByWithRelationInput[] {
  switch (query.sort) {
    case "name":
      return [{ lastName: query.dir }, { firstName: query.dir }];
    case "dob":
      return [{ dob: query.dir }];
    case "createdAt":
    default:
      return [{ createdAt: query.dir }];
  }
}

function compareAggregate(query: PatientListQuery) {
  const key =
    query.sort === "upcomingAppointments" ? "upcomingAppointmentCount" : "activeMedicationCount";
  const factor = query.dir === "asc" ? 1 : -1;
  return (a: PatientListItem, b: PatientListItem) => {
    const diff = a[key] - b[key];
    if (diff !== 0) {
      return diff * factor;
    }
    return a.createdAt.localeCompare(b.createdAt) * -1;
  };
}

async function decoratePatients(patients: PatientRow[], client: Db): Promise<PatientListItem[]> {
  if (patients.length === 0) return [];

  const ids = patients.map((patient) => patient.id);
  const schedulingRange = createSchedulingDateRange();

  const [appointments, prescriptions] = await Promise.all([
    client.appointment.findMany({
      where: { patientId: { in: ids } },
      select: {
        id: true,
        patientId: true,
        providerName: true,
        appointmentDate: true,
        repeatSchedule: true,
        repeatEndDate: true,
        notes: true,
        status: true,
      },
    }),
    client.prescription.findMany({
      where: { patientId: { in: ids } },
      select: {
        id: true,
        patientId: true,
        medicationName: true,
        dosage: true,
        quantity: true,
        refillDate: true,
        refillSchedule: true,
        instructions: true,
        isActive: true,
      },
    }),
  ]);

  const appointmentCounts = new Map<string, number>();
  for (const appointment of appointments) {
    const count = expandAppointmentOccurrences(appointment, schedulingRange).length;
    appointmentCounts.set(
      appointment.patientId,
      (appointmentCounts.get(appointment.patientId) ?? 0) + count,
    );
  }

  const activeMedicationCounts = new Map<string, number>();
  for (const prescription of prescriptions) {
    if (!prescription.isActive) continue;
    activeMedicationCounts.set(
      prescription.patientId,
      (activeMedicationCounts.get(prescription.patientId) ?? 0) + 1,
    );
  }

  return patients.map((patient) => ({
    id: patient.id,
    firstName: patient.firstName,
    lastName: patient.lastName,
    email: patient.email,
    phone: patient.phone,
    dob: toDateOnlyIso(patient.dob),
    createdAt: patient.createdAt.toISOString(),
    upcomingAppointmentCount: appointmentCounts.get(patient.id) ?? 0,
    activeMedicationCount: activeMedicationCounts.get(patient.id) ?? 0,
  }));
}

function mapAppointmentRecord(record: {
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

function mapAppointmentOccurrence(record: {
  id: string;
  appointmentId: string;
  providerName: string;
  appointmentDate: string;
  repeatSchedule: AppointmentOccurrenceView["repeatSchedule"];
  notes: string | null;
  status: AppointmentOccurrenceView["status"];
  isRecurring: boolean;
}): AppointmentOccurrenceView {
  return record;
}

function mapPrescriptionRecord(record: {
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
    refillDate: toDateOnlyIso(record.refillDate),
    refillSchedule: record.refillSchedule,
    instructions: record.instructions,
    isActive: record.isActive,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapRefillOccurrence(record: {
  id: string;
  prescriptionId: string;
  medicationName: string;
  dosage: string;
  quantity: number;
  refillDate: string;
  refillSchedule: RefillOccurrenceView["refillSchedule"];
  instructions: string | null;
  isActive: boolean;
  isRecurring: boolean;
}): RefillOccurrenceView {
  return record;
}

function toDateOnlyIso(value: Date): string {
  return value.toISOString().slice(0, 10);
}
