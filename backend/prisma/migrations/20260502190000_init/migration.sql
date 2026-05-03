-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'UNDISCLOSED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "RepeatSchedule" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "RefillSchedule" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dob" DATE NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'UNDISCLOSED',
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" VARCHAR(2),
    "postalCode" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationCatalog" (
    "id" TEXT NOT NULL,
    "medicationName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicationCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "repeatSchedule" "RepeatSchedule" NOT NULL DEFAULT 'NONE',
    "repeatEndDate" DATE,
    "notes" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medicationCatalogId" TEXT,
    "medicationName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "refillDate" DATE NOT NULL,
    "refillSchedule" "RefillSchedule" NOT NULL,
    "instructions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_email_key" ON "Patient"("email");

-- CreateIndex
CREATE INDEX "Patient_email_idx" ON "Patient"("email");

-- CreateIndex
CREATE INDEX "Patient_lastName_firstName_idx" ON "Patient"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "Patient_createdAt_idx" ON "Patient"("createdAt");

-- CreateIndex
CREATE INDEX "MedicationCatalog_medicationName_idx" ON "MedicationCatalog"("medicationName");

-- CreateIndex
CREATE UNIQUE INDEX "MedicationCatalog_medicationName_dosage_key" ON "MedicationCatalog"("medicationName", "dosage");

-- CreateIndex
CREATE INDEX "Appointment_patientId_appointmentDate_idx" ON "Appointment"("patientId", "appointmentDate");

-- CreateIndex
CREATE INDEX "Appointment_status_appointmentDate_idx" ON "Appointment"("status", "appointmentDate");

-- CreateIndex
CREATE INDEX "Appointment_repeatSchedule_appointmentDate_idx" ON "Appointment"("repeatSchedule", "appointmentDate");

-- CreateIndex
CREATE INDEX "Prescription_patientId_refillDate_idx" ON "Prescription"("patientId", "refillDate");

-- CreateIndex
CREATE INDEX "Prescription_patientId_isActive_idx" ON "Prescription"("patientId", "isActive");

-- CreateIndex
CREATE INDEX "Prescription_medicationName_idx" ON "Prescription"("medicationName");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_medicationCatalogId_fkey" FOREIGN KEY ("medicationCatalogId") REFERENCES "MedicationCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
