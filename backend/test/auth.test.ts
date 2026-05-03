import type { SessionUser } from "@/shared";

import { AuthController } from "@/features/auth/auth.controller";
import { type AuthService } from "@/features/auth/auth.service";

describe("AuthController", () => {
  const fakeSession: SessionUser = {
    sub: "patient-1",
    email: "mark@some-email-provider.net",
    firstName: "Mark",
    lastName: "Johnson",
  };

  const authService: Pick<AuthService, "login" | "logout" | "getSession"> = {
    async login(_email, _password) {
      return {
        accessToken: "signed-token",
        user: fakeSession,
      };
    },
    logout() {
      return;
    },
    async getSession() {
      return fakeSession;
    },
  };

  const controller = new AuthController(authService as AuthService);

  it("returns an access token and session user on login", async () => {
    const result = await controller.login({
      email: "mark@some-email-provider.net",
      password: "Password123!",
    });

    expect(result.data).toEqual({
      accessToken: "signed-token",
      user: fakeSession,
    });
  });

  it("returns a success payload on logout", () => {
    const result = controller.logout();

    expect(result.data).toEqual({ success: true });
  });

  it("returns session data from the bearer token route", async () => {
    const result = await controller.me({
      headers: {
        authorization: "Bearer signed-token",
      },
    } as never);

    expect(result.data).toEqual(fakeSession);
  });

  it("passes validated credentials through to the auth service", async () => {
    const login = vi.spyOn(authService, "login");

    await controller.login({
      email: "mark@some-email-provider.net",
      password: "Password123!",
    });

    expect(login).toHaveBeenCalledWith("mark@some-email-provider.net", "Password123!");
    login.mockRestore();
  });
});
