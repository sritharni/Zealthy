import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { LoginForm } from "./login-form";

const { push, refresh, post, setAccessTokenCookie } = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  post: vi.fn(),
  setAccessTokenCookie: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

vi.mock("@/lib/http/api-client", () => ({
  apiClient: {
    post,
  },
}));

vi.mock("@/lib/auth/token", () => ({
  setAccessTokenCookie,
}));

describe("LoginForm", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    post.mockReset();
    setAccessTokenCookie.mockReset();
  });

  it("submits credentials and redirects to the dashboard", async () => {
    post.mockResolvedValue({
      data: {
        accessToken: "signed-token",
        user: {
          sub: "patient-1",
          email: "mark@some-email-provider.net",
          firstName: "Mark",
          lastName: "Johnson",
        },
      },
    });

    render(
      createElement(
        QueryClientProvider,
        { client: new QueryClient() },
        createElement(LoginForm),
      ),
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "mark@some-email-provider.net" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith("/auth/login", {
        email: "mark@some-email-provider.net",
        password: "Password123!",
      });
    });
    expect(setAccessTokenCookie).toHaveBeenCalledWith("signed-token");
    expect(push).toHaveBeenCalledWith("/dashboard");
    expect(refresh).toHaveBeenCalled();
  });
});
