import { faker } from "@faker-js/faker";
import {
  AppointmentStatus,
  Gender,
  PrismaClient,
  RefillSchedule,
  RepeatSchedule,
  type Prisma,
} from "@prisma/client";

import { hashPassword } from "@/lib/auth/password";

const prisma = new PrismaClient();

const GENERATED_PATIENT_COUNT = 14;

const GIST_SEED = {
  users: [
    {
      name: "Mark Johnson",
      email: "mark@some-email-provider.net",
      password: "Password123!",
      appointments: [
        { provider: "Dr Kim West", datetime: "2026-04-16T16:30:00.000-07:00", repeat: "weekly" },
        { provider: "Dr Lin James", datetime: "2026-04-19T18:30:00.000-07:00", repeat: "monthly" },
      ],
      prescriptions: [
        { medication: "Lexapro", dosage: "5mg", quantity: 2, refillOn: "2026-04-05", refillSchedule: "monthly" },
        { medication: "Ozempic", dosage: "1mg", quantity: 1, refillOn: "2026-04-10", refillSchedule: "monthly" },
      ],
    },
    {
      name: "Lisa Smith",
      email: "lisa@some-email-provider.net",
      password: "Password123!",
      appointments: [
        { provider: "Dr Sally Field", datetime: "2026-04-22T18:15:00.000-07:00", repeat: "monthly" },
        { provider: "Dr Lin James", datetime: "2026-04-25T20:00:00.000-07:00", repeat: "weekly" },
      ],
      prescriptions: [
        { medication: "Metformin", dosage: "500mg", quantity: 2, refillOn: "2026-04-15", refillSchedule: "monthly" },
        { medication: "Diovan", dosage: "100mg", quantity: 1, refillOn: "2026-04-25", refillSchedule: "monthly" },
      ],
    },
  ],
  medications: ["Diovan", "Lexapro", "Metformin", "Ozempic", "Prozac", "Seroquel", "Tegretol"],
  dosages: ["1mg", "2mg", "3mg", "5mg", "10mg", "25mg", "50mg", "100mg", "250mg", "500mg", "1000mg"],
} as const;

function pick<T>(items: readonly T[]): T {
  const value = items[Math.floor(Math.random() * items.length)];
  if (value === undefined) {
    throw new Error("pick() received an empty array");
  }
  return value;
}

async function resetDatabase() {
  await prisma.appointment.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicationCatalog.deleteMany();
  await prisma.patient.deleteMany();
}

async function seedMedicationCatalog() {
  const entries = GIST_SEED.medications.flatMap((medicationName) =>
    GIST_SEED.dosages.map((dosage) => ({ medicationName, dosage })),
  );

  await prisma.medicationCatalog.createMany({
    data: entries,
    skipDuplicates: true,
  });
}

async function seedSamplePatients() {
  for (const user of GIST_SEED.users) {
    const [firstName, ...lastNameParts] = user.name.split(" ");
    const lastName = lastNameParts.join(" ");

    const patient = await prisma.patient.create({
      data: {
        firstName: firstName || "Demo",
        lastName,
        email: user.email,
        passwordHash: await hashPassword(user.password),
        phone: faker.phone.number({ style: "national" }),
        dob: faker.date.birthdate({ min: 28, max: 64, mode: "age" }),
        gender: pick([Gender.MALE, Gender.FEMALE]),
        addressLine1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        postalCode: faker.location.zipCode("#####"),
        notes: "Seeded demo patient from the source gist for portal login validation.",
      },
    });

    for (const appointment of user.appointments) {
      await prisma.appointment.create({
        data: {
          patientId: patient.id,
          providerName: appointment.provider,
          appointmentDate: new Date(appointment.datetime),
          repeatSchedule: toRepeatSchedule(appointment.repeat),
          repeatEndDate: faker.date.soon({ days: 120 }),
          notes: "Imported from gist seed data.",
          status: AppointmentStatus.SCHEDULED,
        },
      });
    }

    for (const prescription of user.prescriptions) {
      const catalog = await prisma.medicationCatalog.findFirst({
        where: {
          medicationName: prescription.medication,
          dosage: prescription.dosage,
        },
        select: { id: true },
      });

      await prisma.prescription.create({
        data: {
          patientId: patient.id,
          medicationCatalogId: catalog?.id,
          medicationName: prescription.medication,
          dosage: prescription.dosage,
          quantity: prescription.quantity,
          refillDate: new Date(prescription.refillOn),
          refillSchedule: toRefillSchedule(prescription.refillSchedule),
          instructions: "Take as directed. Contact your provider for side effects or refill issues.",
          isActive: true,
        },
      });
    }
  }
}

function makeGeneratedPatientInput(passwordHash: string): Prisma.PatientCreateInput {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName, provider: "zealthy-demo.com" }).toLowerCase(),
    passwordHash,
    phone: faker.phone.number({ style: "national" }),
    dob: faker.date.birthdate({ min: 18, max: 85, mode: "age" }),
    gender: pick([
      Gender.MALE,
      Gender.FEMALE,
      Gender.NON_BINARY,
      Gender.OTHER,
      Gender.UNDISCLOSED,
    ]),
    addressLine1: faker.location.streetAddress(),
    addressLine2: faker.helpers.maybe(() => faker.location.secondaryAddress(), { probability: 0.3 }),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    postalCode: faker.location.zipCode("#####"),
    notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.55 }),
  };
}

async function seedGeneratedPatients() {
  const defaultPasswordHash = await hashPassword("Password123!");
  const catalog = await prisma.medicationCatalog.findMany({
    select: { id: true, medicationName: true, dosage: true },
  });

  for (let index = 0; index < GENERATED_PATIENT_COUNT; index += 1) {
    const patient = await prisma.patient.create({
      data: makeGeneratedPatientInput(defaultPasswordHash),
    });

    const appointmentCount = faker.number.int({ min: 1, max: 4 });
    for (let appointmentIndex = 0; appointmentIndex < appointmentCount; appointmentIndex += 1) {
      const repeatSchedule = pick([
        RepeatSchedule.NONE,
        RepeatSchedule.WEEKLY,
        RepeatSchedule.MONTHLY,
      ]);
      const appointmentDate = faker.date.between({
        from: "2026-04-01T08:00:00.000Z",
        to: "2026-06-15T17:00:00.000Z",
      });

      await prisma.appointment.create({
        data: {
          patientId: patient.id,
          providerName: `${faker.person.prefix()} ${faker.person.fullName()}`,
          appointmentDate,
          repeatSchedule,
          repeatEndDate:
            repeatSchedule === RepeatSchedule.NONE ? null : faker.date.soon({ days: 90, refDate: appointmentDate }),
          notes: faker.helpers.arrayElement([
            "Medication review",
            "Follow-up for chronic condition",
            "Lab review",
            "General wellness check-in",
          ]),
          status: pick([
            AppointmentStatus.SCHEDULED,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.COMPLETED,
          ]),
        },
      });
    }

    const prescriptionCount = faker.number.int({ min: 1, max: 3 });
    const sampleMeds = faker.helpers.arrayElements(catalog, prescriptionCount);
    for (const medication of sampleMeds) {
      await prisma.prescription.create({
        data: {
          patientId: patient.id,
          medicationCatalogId: medication.id,
          medicationName: medication.medicationName,
          dosage: medication.dosage,
          quantity: faker.number.int({ min: 1, max: 3 }),
          refillDate: faker.date.between({
            from: "2026-04-01T00:00:00.000Z",
            to: "2026-06-30T00:00:00.000Z",
          }),
          refillSchedule: pick([
            RefillSchedule.MONTHLY,
            RefillSchedule.QUARTERLY,
            RefillSchedule.YEARLY,
          ]),
          instructions: faker.helpers.arrayElement([
            "Take with food in the morning.",
            "Use exactly as prescribed.",
            "Avoid missing doses; call if symptoms worsen.",
          ]),
          isActive: faker.datatype.boolean({ probability: 0.85 }),
        },
      });
    }
  }
}

function toRepeatSchedule(value: string): RepeatSchedule {
  switch (value) {
    case "daily":
      return RepeatSchedule.DAILY;
    case "weekly":
      return RepeatSchedule.WEEKLY;
    case "monthly":
      return RepeatSchedule.MONTHLY;
    default:
      return RepeatSchedule.NONE;
  }
}

function toRefillSchedule(value: string): RefillSchedule {
  switch (value) {
    case "quarterly":
      return RefillSchedule.QUARTERLY;
    case "yearly":
      return RefillSchedule.YEARLY;
    default:
      return RefillSchedule.MONTHLY;
  }
}

async function main() {
  faker.seed(42);

  console.warn("Resetting database...");
  await resetDatabase();

  console.warn("Seeding medication catalog from source gist values...");
  await seedMedicationCatalog();

  console.warn("Seeding source demo users...");
  await seedSamplePatients();

  console.warn(`Seeding ${GENERATED_PATIENT_COUNT} generated demo patients...`);
  await seedGeneratedPatients();

  console.warn("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
