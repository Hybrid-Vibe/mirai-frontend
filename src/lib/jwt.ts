export interface DecodedToken {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
}

/**
 * Safely decodes a standard JWT payload on the client side.
 */
export function decodeJwt(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    const payload = JSON.parse(jsonPayload);

    // Normalize C# backend standard claim types to standard keys
    const roleKey =
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
    const subKey =
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

    const sub = payload.sub || payload[subKey] || payload.nameid;
    const role = payload.role || payload[roleKey];
    const email =
      payload.email ||
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ];
    const exp = payload.exp;

    return { sub, email, role, exp };
  } catch (error) {
    console.error("[JWT] Error decoding token:", error);
    return null;
  }
}

/**
 * Checks if a JWT is expired.
 */
export function isJwtExpired(token: string): boolean {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return true;

  // exp is in seconds, Date.now() is in milliseconds
  const buffer = 10; // 10 second buffer
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime + buffer;
}
