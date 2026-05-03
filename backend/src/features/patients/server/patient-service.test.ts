const { findById, create, update, existsByEmail, hashPassword } = vi.hoisted(() => ({
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  existsByEmail: vi.fn(),
  hashPassword: vi.fn(),
}));

vi.mock("./patient-repository", () => ({
  patientRepository: {
    findById,
    create,
    update,
    existsByEmail,
  },
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword,
}));

import { patientService } from "./patient-service";

describe("patientService", () => {
  const patientDetail = {
    id: "patient-1",
    firstName: "Mark",
    lastName: "Johnson",
    email: "mark@some-email-provider.net",
    phone: "(555) 111-2222",
    dob: "1980-01-01",
    gender: "MALE" as const,
    addressLine1: null,
    addressLine2: null,
    city: null,
    state: null,
    postalCode: null,
    notes: null,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    appointments: [],
    upcomingAppointments: [],
    prescriptions: [],
    upcomingRefills: [],
    stats: {
      upcomingAppointmentCount: 0,
      activePrescriptionCount: 0,
      upcomingRefillCount: 0,
    },
  };

  beforeEach(() => {
    findById.mockReset();
    create.mockReset();
    update.mockReset();
    existsByEmail.mockReset();
    hashPassword.mockReset();
  });

  it("hashes the password before creating a patient", async () => {
    existsByEmail.mockResolvedValue(false);
    hashPassword.mockResolvedValue("hashed-password");
    create.mockResolvedValue({ id: "patient-1" });
    findById.mockResolvedValue(patientDetail);

    const result = await patientService.create({
      firstName: "Mark",
      lastName: "Johnson",
      email: "mark@some-email-provider.net",
      password: "Password123!",
      phone: "(555) 111-2222",
      dob: "1980-01-01",
      gender: "MALE",
      addressLine1: undefined,
      addressLine2: undefined,
      city: undefined,
      state: undefined,
      postalCode: undefined,
      notes: undefined,
    });

    expect(hashPassword).toHaveBeenCalledWith("Password123!");
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "mark@some-email-provider.net",
        password: "hashed-password",
      }),
    );
    expect(result).toEqual(patientDetail);
  });

  it("rejects patient creation when the email is already taken", async () => {
    existsByEmail.mockResolvedValue(true);

    await expect(
      patientService.create({
        firstName: "Mark",
        lastName: "Johnson",
        email: "mark@some-email-provider.net",
        password: "Password123!",
        phone: "(555) 111-2222",
        dob: "1980-01-01",
        gender: "MALE",
        addressLine1: undefined,
        addressLine2: undefined,
        city: undefined,
        state: undefined,
        postalCode: undefined,
        notes: undefined,
      }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
      status: 409,
      message: "A patient with this email already exists",
    });

    expect(create).not.toHaveBeenCalled();
  });

  it("hashes a new password during update and refetches the patient", async () => {
    findById
      .mockResolvedValueOnce(patientDetail)
      .mockResolvedValueOnce({
        ...patientDetail,
        firstName: "Marcus",
      });
    existsByEmail.mockResolvedValue(false);
    hashPassword.mockResolvedValue("updated-hash");
    update.mockResolvedValue({ id: "patient-1" });

    const result = await patientService.update("patient-1", {
      firstName: "Marcus",
      lastName: "Johnson",
      email: "marcus@some-email-provider.net",
      password: "NewPassword123!",
      phone: "(555) 111-2222",
      dob: "1980-01-01",
      gender: "MALE",
      addressLine1: undefined,
      addressLine2: undefined,
      city: undefined,
      state: undefined,
      postalCode: undefined,
      notes: undefined,
    });

    expect(existsByEmail).toHaveBeenCalledWith("marcus@some-email-provider.net", "patient-1");
    expect(hashPassword).toHaveBeenCalledWith("NewPassword123!");
    expect(update).toHaveBeenCalledWith(
      "patient-1",
      expect.objectContaining({
        firstName: "Marcus",
        password: "updated-hash",
      }),
    );
    expect(result.firstName).toBe("Marcus");
  });

  it("does not re-check email uniqueness when the email is unchanged", async () => {
    findById
      .mockResolvedValueOnce(patientDetail)
      .mockResolvedValueOnce(patientDetail);
    update.mockResolvedValue({ id: "patient-1" });

    await patientService.update("patient-1", {
      firstName: "Mark",
      lastName: "Johnson",
      email: "mark@some-email-provider.net",
      password: undefined,
      phone: "(555) 111-2222",
      dob: "1980-01-01",
      gender: "MALE",
      addressLine1: undefined,
      addressLine2: undefined,
      city: undefined,
      state: undefined,
      postalCode: undefined,
      notes: undefined,
    });

    expect(existsByEmail).not.toHaveBeenCalled();
    expect(hashPassword).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(
      "patient-1",
      expect.objectContaining({
        password: undefined,
      }),
    );
  });

  it("throws not found when updating a missing patient", async () => {
    findById.mockResolvedValue(null);

    await expect(
      patientService.update("missing-patient", {
        firstName: "Mark",
        lastName: "Johnson",
        email: "mark@some-email-provider.net",
        password: undefined,
        phone: "(555) 111-2222",
        dob: "1980-01-01",
        gender: "MALE",
        addressLine1: undefined,
        addressLine2: undefined,
        city: undefined,
        state: undefined,
        postalCode: undefined,
        notes: undefined,
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
      message: "Patient not found",
    });
  });

  it("returns paginated patient list metadata for admin queries", async () => {
    const patientRow = {
      id: "patient-1",
      firstName: "Mark",
      lastName: "Johnson",
      email: "mark@some-email-provider.net",
      phone: "(555) 111-2222",
      dob: "1980-01-01",
      createdAt: "2026-05-01T00:00:00.000Z",
      upcomingAppointmentCount: 3,
      activeMedicationCount: 2,
    };

    const listMock = vi.spyOn(
      await import("./patient-repository.js"),
      "patientRepository",
      "get",
    );
    listMock.mockReturnValue({
      findById,
      create,
      update,
      existsByEmail,
      list: vi.fn().mockResolvedValue([patientRow]),
      count: vi.fn().mockResolvedValue(11),
    } as never);

    const result = await patientService.list({
      page: 2,
      pageSize: 10,
      sort: "createdAt",
      dir: "desc",
      q: "mark",
    });

    expect(result).toEqual({
      items: [patientRow],
      page: 2,
      pageSize: 10,
      total: 11,
      totalPages: 2,
    });

    listMock.mockRestore();
  });
});
