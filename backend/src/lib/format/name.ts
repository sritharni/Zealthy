type Named = { firstName: string; lastName: string };

export function formatFullName({ firstName, lastName }: Named): string {
  return `${firstName} ${lastName}`.trim();
}

export function formatInitials({ firstName, lastName }: Named): string {
  const first = firstName.charAt(0);
  const last = lastName.charAt(0);
  return `${first}${last}`.toUpperCase();
}