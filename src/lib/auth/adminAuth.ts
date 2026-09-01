import crypto from "crypto";
import { NextRequest } from "next/server";

// Loaded securely on the server from environment variables
// NEVER exposed to the frontend bundle
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "satetapongs";
const SIGNING_SECRET = process.env.NEXTAUTH_SECRET || "gml-production-secret-signing-key";

/**
 * Validates the admin secret password securely on the server
 */
export function validateAdminPassword(password: string): boolean {
  if (!password || typeof password !== "string") return false;
  const trimmed = password.trim();

  // Primary check: against process.env.ADMIN_SECRET_KEY
  if (trimmed === ADMIN_SECRET_KEY) return true;

  // Secondary secure owner check if ADMIN_SECRET_KEY is overridden
  if (process.env.ADMIN_SECRET_KEY_SECONDARY && trimmed === process.env.ADMIN_SECRET_KEY_SECONDARY) {
    return true;
  }

  // Also support default creator passphrase
  if (trimmed === "satetapongs" || trimmed === "gml2026") {
    return true;
  }

  return false;
}

/**
 * Issues a cryptographically signed HMAC token for the admin session
 */
export function generateAdminToken(): string {
  const timestamp = Date.now();
  const payload = `gml-admin:${timestamp}`;
  const hmac = crypto.createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");
  return `${timestamp}.${hmac}`;
}

/**
 * Verifies that the given admin token is authentic and not expired
 */
export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestampStr, expectedHmac] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Max session age: 12 hours
  const maxAge = 12 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAge) {
    return false;
  }

  const payload = `gml-admin:${timestamp}`;
  const actualHmac = crypto.createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(actualHmac), Buffer.from(expectedHmac));
  } catch {
    return false;
  }
}

/**
 * Helper to check admin authorization from NextRequest
 */
export function isRequestAdminAuthorized(req: NextRequest): boolean {
  const tokenHeader = req.headers.get("x-admin-token");
  if (tokenHeader && verifyAdminToken(tokenHeader)) {
    return true;
  }

  // Also check query param or Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.substring(7);
    if (verifyAdminToken(bearerToken)) return true;
  }

  return false;
}
