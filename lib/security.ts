import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_MAX_AGE_MS = 8 * 60 * 60 * 1000;

export function generateAdminToken(secret: string): string {
  const timestamp = Date.now().toString();
  const sig = createHmac("sha256", secret).update(timestamp).digest("hex");
  return `${timestamp}.${sig}`;
}

export function verifyAdminToken(token: string, secret: string): boolean {
  if (!token || typeof token !== "string") return false;
  const [timestamp, sig] = token.split(".");
  if (!timestamp || !sig) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Date.now() - ts > TOKEN_MAX_AGE_MS) return false;

  const expected = createHmac("sha256", secret).update(timestamp).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}
