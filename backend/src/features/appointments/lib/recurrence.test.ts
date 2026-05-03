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
        refillDate: new Date("2026-01-15T12:00:00.000Z"),
        refillSchedule: RefillSchedule.QUARTERLY,
        instructions: null,
        isActive: true,
      },
      {
        start: new Date("2026-04-01T00:00:00.000Z"),
        end: new Date("2026-10-31T23:59:59.000Z"),
      },
    );

    // Refill cadence is anchored at UTC noon so DST shifts can't drift the
    // serialized day across a date boundary. Every step is +3 months.
    expect(refills).toHaveLength(3);
    expect(refills[0]?.refillDate.startsWith("2026-04-15")).toBe(true);
    expect(refills[1]?.refillDate.startsWith("2026-07-15")).toBe(true);
    expect(refills[2]?.refillDate.startsWith("2026-10-15")).toBe(true);
  });
});
