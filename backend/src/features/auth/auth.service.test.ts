const { findUnique, verifyPassword } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    patient: {
      findUnique,
    },
  },
}));

vi.mock("@/lib/auth/password", () => ({
  verifyPassword,
}));

import { AuthService } from "./auth.service";

describe("AuthService", () => {
  const service = new AuthService();

  beforeEach(() => {
    findUnique.mockReset();
    verifyPassword.mockReset();
  });

  it("returns a bearer token and session user on successful login", async () => {
    findUnique.mockResolvedValue({
      id: "patient-1",
      email: "mark@some-email-provider.net",
      firstName: "Mark",
      lastName: "Johnson",
      passwordHash: "stored-hash",
    });
    verifyPassword.mockResolvedValue(true);

    const session = await service.login("mark@some-email-provider.net", "Password123!");

    expect(session).toEqual({
      accessToken: expect.any(String),
      user: {
        sub: "patient-1",
        email: "mark@some-email-provider.net",
        firstName: "Mark",
        lastName: "Johnson",
      },
    });
  });

  it("rejects unknown patients with an unauthorized error", async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      service.login("missing@some-email-provider.net", "Password123!"),
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      status: 401,
      message: "Invalid email or password",
    });
  });

  it("rejects invalid passwords with an unauthorized error", async () => {
    findUnique.mockResolvedValue({
      id: "patient-1",
      email: "mark@some-email-provider.net",
      firstName: "Mark",
      lastName: "Johnson",
      passwordHash: "stored-hash",
    });
    verifyPassword.mockResolvedValue(false);

    await expect(
      service.login("mark@some-email-provider.net", "wrong-password"),
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      status: 401,
      message: "Invalid email or password",
    });
  });

  it("allows logout as a no-op for token-based auth", () => {
    expect(service.logout()).toBeUndefined();
  });

  it("reads back a valid session from a bearer token", async () => {
    findUnique.mockResolvedValue({
      id: "patient-1",
      email: "mark@some-email-provider.net",
      firstName: "Mark",
      lastName: "Johnson",
      passwordHash: "stored-hash",
    });
    verifyPassword.mockResolvedValue(true);

    const authSession = await service.login("mark@some-email-provider.net", "Password123!");
    const session = await service.getSession({
      headers: {
        authorization: `Bearer ${authSession.accessToken}`,
      },
    } as never);

    expect(session).toEqual({
      sub: "patient-1",
      email: "mark@some-email-provider.net",
      firstName: "Mark",
      lastName: "Johnson",
    });
  });

  it("rejects requests without a bearer token", async () => {
    await expect(service.getSession({ headers: {} } as never)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      status: 401,
      message: "Missing bearer token",
    });
  });
});
