/**
 * Format a 10-digit US phone number as (xxx) xxx-xxxx. Falls back to the
 * original string for anything we don't recognize so we never silently
 * mangle international numbers.
 */
export function formatPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return input;
}

export function normalizePhone(input: string): string {
  return input.replace(/\D/g, "");
}