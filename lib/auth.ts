// Single shared-password auth. The cookie stores an HMAC of a fixed token signed
// with AUTH_SECRET, so it proves "the password was entered" and can't be forged.
// Uses Web Crypto so it runs in both middleware and server actions.

export const AUTH_COOKIE = "gc_auth";
export const AUTH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const TOKEN_PAYLOAD = "authorized";

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

async function hmacHex(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Value to store in the auth cookie once the password is verified. */
export function signedToken(): Promise<string> {
  return hmacHex(TOKEN_PAYLOAD);
}

/** Whether a cookie value is a valid signed token. */
export async function verifyToken(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  return safeEqual(value, await signedToken());
}

/** Whether the submitted password matches APP_PASSWORD. */
export function checkPassword(input: string): boolean {
  const expected = process.env.APP_PASSWORD;
  if (!expected) throw new Error("APP_PASSWORD is not set");
  return safeEqual(input, expected);
}
