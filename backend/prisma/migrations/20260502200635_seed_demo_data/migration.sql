INSERT INTO "MedicationCatalog" ("id", "medicationName", "dosage", "createdAt", "updatedAt")
SELECT
  'medcat_' || lower(medication_name) || '_' || lower(replace(dosage, 'mg', 'mg')),
  medication_name,
  dosage,
  NOW(),
  NOW()
FROM unnest(ARRAY[
  'Diovan',
  'Lexapro',
  'Metformin',
  'Ozempic',
  'Prozac',
  'Seroquel',
  'Tegretol'
]) AS medication_name
CROSS JOIN unnest(ARRAY[
  '1mg',
  '2mg',
  '3mg',
  '5mg',
  '10mg',
  '25mg',
  '50mg',
  '100mg',
  '250mg',
  '500mg',
  '1000mg'
]) AS dosage
ON CONFLICT ("medicationName", "dosage") DO NOTHING;

INSERT INTO "Patient" (
  "id",
  "firstName",
  "lastName",
  "email",
  "passwordHash",
  "phone",
  "dob",
  "gender",
  "addressLine1",
  "addressLine2",
  "city",
  "state",
  "postalCode",
  "notes",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'pat_mark_johnson',
    'Mark',
    'Johnson',
    'mark@some-email-provider.net',
    '$2b$12$nU74E/hbHt0F/apztoLsweDtLT6xBA9hq96TUAxHdFTI87XJKZJV.',
    '(415) 555-0101',
    DATE '1988-06-14',
    'MALE',
    '101 Market Street',
    NULL,
    'San Francisco',
    'CA',
    '94105',
    'Demo patient imported from the provided seed payload.',
    NOW(),
    NOW()
  ),
  (
    'pat_lisa_smith',
    'Lisa',
    'Smith',
    'lisa@some-email-provider.net',
    '$2b$12$nU74E/hbHt0F/apztoLsweDtLT6xBA9hq96TUAxHdFTI87XJKZJV.',
    '(415) 555-0102',
    DATE '1990-09-22',
    'FEMALE',
    '202 Mission Street',
    NULL,
    'San Francisco',
    'CA',
    '94105',
    'Demo patient imported from the provided seed payload.',
    NOW(),
    NOW()
  )
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "Appointment" (
  "id",
  "patientId",
  "providerName",
  "appointmentDate",
  "repeatSchedule",
  "repeatEndDate",
  "notes",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'appt_mark_1',
    'pat_mark_johnson',
    'Dr Kim West',
    TIMESTAMPTZ '2026-04-16T16:30:00.000-07:00',
    'WEEKLY',
    DATE '2026-07-16',
    'Imported from the provided demo payload.',
    'SCHEDULED',
    NOW(),
    NOW()
  ),
  (
    'appt_mark_2',
    'pat_mark_johnson',
    'Dr Lin James',
    TIMESTAMPTZ '2026-04-19T18:30:00.000-07:00',
    'MONTHLY',
    DATE '2026-10-19',
    'Imported from the provided demo payload.',
    'SCHEDULED',
    NOW(),
    NOW()
  ),
  (
    'appt_lisa_1',
    'pat_lisa_smith',
    'Dr Sally Field',
    TIMESTAMPTZ '2026-04-22T18:15:00.000-07:00',
    'MONTHLY',
    DATE '2026-10-22',
    'Imported from the provided demo payload.',
    'SCHEDULED',
    NOW(),
    NOW()
  ),
  (
    'appt_lisa_2',
    'pat_lisa_smith',
    'Dr Lin James',
    TIMESTAMPTZ '2026-04-25T20:00:00.000-07:00',
    'WEEKLY',
    DATE '2026-07-25',
    'Imported from the provided demo payload.',
    'SCHEDULED',
    NOW(),
    NOW()
  )
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Prescription" (
  "id",
  "patientId",
  "medicationCatalogId",
  "medicationName",
  "dosage",
  "quantity",
  "refillDate",
  "refillSchedule",
  "instructions",
  "isActive",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'rx_mark_1',
    'pat_mark_johnson',
    'medcat_lexapro_5mg',
    'Lexapro',
    '5mg',
    2,
    DATE '2026-04-05',
    'MONTHLY',
    'Take as directed. Contact your provider for refill issues.',
    TRUE,
    NOW(),
    NOW()
  ),
  (
    'rx_mark_2',
    'pat_mark_johnson',
    'medcat_ozempic_1mg',
    'Ozempic',
    '1mg',
    1,
    DATE '2026-04-10',
    'MONTHLY',
    'Take as directed. Contact your provider for refill issues.',
    TRUE,
    NOW(),
    NOW()
  ),
  (
    'rx_lisa_1',
    'pat_lisa_smith',
    'medcat_metformin_500mg',
    'Metformin',
    '500mg',
    2,
    DATE '2026-04-15',
    'MONTHLY',
    'Take as directed. Contact your provider for refill issues.',
    TRUE,
    NOW(),
    NOW()
  ),
  (
    'rx_lisa_2',
    'pat_lisa_smith',
    'medcat_diovan_100mg',
    'Diovan',
    '100mg',
    1,
    DATE '2026-04-25',
    'MONTHLY',
    'Take as directed. Contact your provider for refill issues.',
    TRUE,
    NOW(),
    NOW()
  )
ON CONFLICT ("id") DO NOTHING;
