const { patientFindById, appointmentList, appointmentFindById, appointmentCreate, appointmentUpdate, appointmentRemove } =
  vi.hoisted(() => ({
    patientFindById: vi.fn(),
    appointmentList: vi.fn(),
    appointmentFindById: vi.fn(),
    appointmentCreate: vi.fn(),
    appointmentUpdate: vi.fn(),
    appointmentRemove: vi.fn(),
  }));

vi.mock("@/features/patients/server/patient-repository", () => ({
  patientRepository: {
    findById: patientFindById,
  },
}));

vi.mock("./appointment-repository", () => ({
  appointmentRepository: {
    list: appointmentList,
    findById: appointmentFindById,
    create: appointmentCreate,
    update: appointmentUpdate,
    remove: appointmentRemove,
  },
}));

import { appointmentService } from "./appointment-service";

describe("appointmentService", () => {
  const patient = {
    id: "patient-1",
  };

  const appointmentRecord = {
    id: "appointment-1",
    patientId: "patient-1",
    providerName: "Dr West",
    appointmentDate: "2026-05-13T16:24:00.000Z",
    repeatSchedule: "WEEKLY" as const,
    repeatEndDate: "2026-06-13T16:24:00.000Z",
    notes: "Lab review",
    status: "CONFIRMED" as const,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
  };

  beforeEach(() => {
    patientFindById.mockReset();
    appointmentList.mockReset();
    appointmentFindById.mockReset();
    appointmentCreate.mockReset();
    appointmentUpdate.mockReset();
    appointmentRemove.mockReset();
  });

  it("returns appointment lists for admin queries", async () => {
    appointmentList.mockResolvedValue([appointmentRecord]);

    const result = await appointmentService.list({ patientId: "patient-1" });

    expect(appointmentList).toHaveBeenCalledWith({ patientId: "patient-1" });
    expect(result).toEqual([appointmentRecord]);
  });

  it("creates an appointment when the patient exists", async () => {
    patientFindById.mockResolvedValue(patient);
    appointmentCreate.mockResolvedValue({ id: "appointment-1" });
    appointmentFindById.mockResolvedValue(appointmentRecord);

    const result = await appointmentService.create({
      patientId: "patient-1",
      providerName: "Dr West",
      appointmentDate: "2026-05-13T16:24:00.000Z",
      repeatSchedule: "WEEKLY",
      repeatEndDate: "2026-06-13T16:24:00.000Z",
      notes: "Lab review",
      status: "CONFIRMED",
    });

    expect(appointmentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        patientId: "patient-1",
        providerName: "Dr West",
      }),
    );
    expect(result).toEqual(appointmentRecord);
  });

  it("rejects appointment creation when the patient does not exist", async () => {
    patientFindById.mockResolvedValue(null);

    await expect(
      appointmentService.create({
        patientId: "missing-patient",
        providerName: "Dr West",
        appointmentDate: "2026-05-13T16:24:00.000Z",
        repeatSchedule: "NONE",
        repeatEndDate: undefined,
        notes: undefined,
        status: "SCHEDULED",
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
      message: "Patient not found",
    });
  });

  it("updates an appointment and validates a replacement patient id", async () => {
    appointmentFindById
      .mockResolvedValueOnce(appointmentRecord)
      .mockResolvedValueOnce({
        ...appointmentRecord,
        patientId: "patient-2",
      });
    patientFindById.mockResolvedValue({ id: "patient-2" });
    appointmentUpdate.mockResolvedValue({ id: "appointment-1" });

    const result = await appointmentService.update("appointment-1", {
      patientId: "patient-2",
      status: "SCHEDULED",
    });

    expect(patientFindById).toHaveBeenCalledWith("patient-2");
    expect(appointmentUpdate).toHaveBeenCalledWith("appointment-1", {
      patientId: "patient-2",
      status: "SCHEDULED",
    });
    expect(result.patientId).toBe("patient-2");
  });

  it("throws not found when updating a missing appointment", async () => {
    appointmentFindById.mockResolvedValue(null);

    await expect(
      appointmentService.update("missing-appointment", { status: "CANCELLED" }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
      message: "Appointment not found",
    });
  });

  it("removes an appointment after existence is confirmed", async () => {
    appointmentFindById.mockResolvedValue(appointmentRecord);
    appointmentRemove.mockResolvedValue({ id: "appointment-1" });

    const result = await appointmentService.remove("appointment-1");

    expect(appointmentRemove).toHaveBeenCalledWith("appointment-1");
    expect(result).toEqual({ id: "appointment-1" });
  });
});
