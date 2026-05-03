export const ACCESS_TOKEN_COOKIE = "zealthy_access_token";

export function setAccessTokenCookie(token: string) {
  if (typeof document === "undefined") {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; SameSite=Lax${secure}`;
}

export function clearAccessTokenCookie() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie =
    `${ACCESS_TOKEN_COOKIE}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function getAccessTokenFromDocument(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${ACCESS_TOKEN_COOKIE}=`));

  return match ? decodeURIComponent(match.split("=")[1] ?? "") : null;
}
