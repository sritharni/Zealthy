import { RefillSchedule, RepeatSchedule } from "@prisma/client";

import { expandAppointmentOccurrences, expandPrescriptionRefills } from "./recurrence";

describe("recurrence helpers", () => {
  it("projects recurring weekly appointments inside the requested window", () => {
    const occurrences = expandAppointmentOccurrences(
      {
        id: "appt-1",
        patientId: "patient-1",
        providerName: "Dr West",
        appointmentDate: new Date("2026-05-01T09:00:00.000Z"),
        repeatSchedule: RepeatSchedule.WEEKLY,
        repeatEndDate: new Date("2026-05-22T09:00:00.000Z"),
        notes: null,
        status: "SCHEDULED",
      },
      {
        start: new Date("2026-05-01T00:00:00.000Z"),
        end: new Date("2026-05-31T23:59:59.000Z"),
      },
    );

    expect(occurrences).toHaveLength(4);
    expect(occurrences[0]?.appointmentDate).toBe("2026-05-01T09:00:00.000Z");
    expect(occurrences[3]?.appointmentDate).toBe("2026-05-22T09:00:00.000Z");
  });

  it("projects quarterly prescription refills by 3-month intervals", () => {
    const refills = expandPrescriptionRefills(
      {
        id: "rx-1",
        patientId: "patient-1",
        medicationName: "Metformin",
        dosage: "500mg",
        quantity: 1,
        refillDate: new Date("2026-01-15T00:00:00.000Z"),
        refillSchedule: RefillSchedule.QUARTERLY,
        instructions: null,
        isActive: true,
      },
      {
        start: new Date("2026-04-01T00:00:00.000Z"),
        end: new Date("2026-10-31T23:59:59.000Z"),
      },
    );

    expect(refills.map((item) => item.refillDate)).toEqual([
      "2026-04-14T23:00:00.000Z",
      "2026-07-14T23:00:00.000Z",
      "2026-10-14T23:00:00.000Z",
    ]);
  });
});
