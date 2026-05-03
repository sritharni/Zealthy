import { compare, hash } from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(value: string): Promise<string> {
  return hash(value, SALT_ROUNDS);
}

export async function verifyPassword(value: string, passwordHash: string): Promise<boolean> {
  return compare(value, passwordHash);
}
