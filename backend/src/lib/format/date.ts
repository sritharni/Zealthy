import { format, formatDistanceToNowStrict, parseISO } from "date-fns";

type DateInput = Date | string;

function toDate(value: DateInput): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

export function formatDate(value: DateInput): string {
  return format(toDate(value), "MMM d, yyyy");
}

export function formatDateLong(value: DateInput): string {
  return format(toDate(value), "MMMM d, yyyy");
}

export function formatDateTime(value: DateInput): string {
  return format(toDate(value), "MMM d, yyyy h:mm a");
}

export function formatRelative(value: DateInput): string {
  return formatDistanceToNowStrict(toDate(value), { addSuffix: true });
}

export function calculateAge(dob: DateInput): number {
  const date = toDate(dob);
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
    age--;
  }
  return age;
}

/**
 * For <input type="date" /> — yyyy-MM-dd, no timezone shift.
 */
export function toDateInputValue(value: DateInput): string {
  return format(toDate(value), "yyyy-MM-dd");
}