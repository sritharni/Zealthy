import { z } from "zod";

const trimmed = z.string().trim();

export const LoginSchema = z.object({
  email: trimmed.email("Enter a valid email"),
  password: trimmed.min(1, "Password is required"),
});

export type LoginInput = z.input<typeof LoginSchema>;

export type SessionUser = {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type AuthSession = {
  accessToken: string;
  user: SessionUser;
};
