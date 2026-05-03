const {
  patientFindById,
  prescriptionList,
  prescriptionFindById,
  prescriptionCreate,
  prescriptionUpdate,
  prescriptionRemove,
} = vi.hoisted(() => ({
  patientFindById: vi.fn(),
  prescriptionList: vi.fn(),
  prescriptionFindById: vi.fn(),
  prescriptionCreate: vi.fn(),
  prescriptionUpdate: vi.fn(),
  prescriptionRemove: vi.fn(),
}));

vi.mock("@/features/patients/server/patient-repository", () => ({
  patientRepository: {
    findById: patientFindById,
  },
}));

vi.mock("./prescription-repository", () => ({
  prescriptionRepository: {
    list: prescriptionList,
    findById: prescriptionFindById,
    create: prescriptionCreate,
    update: prescriptionUpdate,
    remove: prescriptionRemove,
  },
}));

import { prescriptionService } from "./prescription-service";

describe("prescriptionService", () => {
  const patient = {
    id: "patient-1",
  };

  const prescriptionRecord = {
    id: "prescription-1",
    patientId: "patient-1",
    medicationCatalogId: "med-1",
    medicationName: "Metformin",
    dosage: "500mg",
    quantity: 30,
    refillDate: "2026-05-15",
    refillSchedule: "MONTHLY" as const,
    instructions: "Take with food",
    isActive: true,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
  };

  beforeEach(() => {
    patientFindById.mockReset();
    prescriptionList.mockReset();
    prescriptionFindById.mockReset();
    prescriptionCreate.mockReset();
    prescriptionUpdate.mockReset();
    prescriptionRemove.mockReset();
  });

  it("returns prescription lists for admin queries", async () => {
    prescriptionList.mockResolvedValue([prescriptionRecord]);

    const result = await prescriptionService.list({ patientId: "patient-1" });

    expect(prescriptionList).toHaveBeenCalledWith({ patientId: "patient-1" });
    expect(result).toEqual([prescriptionRecord]);
  });

  it("creates a prescription when the patient exists", async () => {
    patientFindById.mockResolvedValue(patient);
    prescriptionCreate.mockResolvedValue({ id: "prescription-1" });
    prescriptionFindById.mockResolvedValue(prescriptionRecord);

    const result = await prescriptionService.create({
      patientId: "patient-1",
      medicationCatalogId: "med-1",
      medicationName: "Metformin",
      dosage: "500mg",
      quantity: 30,
      refillDate: "2026-05-15",
      refillSchedule: "MONTHLY",
      instructions: "Take with food",
      isActive: true,
    });

    expect(prescriptionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        patientId: "patient-1",
        medicationName: "Metformin",
      }),
    );
    expect(result).toEqual(prescriptionRecord);
  });

  it("rejects prescription creation when the patient does not exist", async () => {
    patientFindById.mockResolvedValue(null);

    await expect(
      prescriptionService.create({
        patientId: "missing-patient",
        medicationCatalogId: "med-1",
        medicationName: "Metformin",
        dosage: "500mg",
        quantity: 30,
        refillDate: "2026-05-15",
        refillSchedule: "MONTHLY",
        instructions: undefined,
        isActive: true,
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
      message: "Patient not found",
    });
  });

  it("updates a prescription and validates a replacement patient id", async () => {
    prescriptionFindById
      .mockResolvedValueOnce(prescriptionRecord)
      .mockResolvedValueOnce({
        ...prescriptionRecord,
        patientId: "patient-2",
      });
    patientFindById.mockResolvedValue({ id: "patient-2" });
    prescriptionUpdate.mockResolvedValue({ id: "prescription-1" });

    const result = await prescriptionService.update("prescription-1", {
      patientId: "patient-2",
      isActive: false,
    });

    expect(patientFindById).toHaveBeenCalledWith("patient-2");
    expect(prescriptionUpdate).toHaveBeenCalledWith("prescription-1", {
      patientId: "patient-2",
      isActive: false,
    });
    expect(result.patientId).toBe("patient-2");
  });

  it("throws not found when updating a missing prescription", async () => {
    prescriptionFindById.mockResolvedValue(null);

    await expect(
      prescriptionService.update("missing-prescription", { isActive: false }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
      message: "Prescription not found",
    });
  });

  it("removes a prescription after existence is confirmed", async () => {
    prescriptionFindById.mockResolvedValue(prescriptionRecord);
    prescriptionRemove.mockResolvedValue({ id: "prescription-1" });

    const result = await prescriptionService.remove("prescription-1");

    expect(prescriptionRemove).toHaveBeenCalledWith("prescription-1");
    expect(result).toEqual({ id: "prescription-1" });
  });
});
