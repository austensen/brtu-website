/**
 * Server-only member session (signed cookie). Do not import from client-side components.
 *
 * Sliding refresh (re-issue cookie on each authenticated request to extend Max-Age) is
 * intentionally not implemented in v1; add it in a route middleware or shared layout helper
 * if product wants rolling sessions later.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

/** v1 session cookie name (single source of truth for Set-Cookie + verification). */
export const MEMBER_SESSION_COOKIE = "brtu_member_session";

/** ~180 days (locked decision). */
const SESSION_MAX_AGE_SEC = 180 * 24 * 60 * 60;

type SessionPayload = {
  iat: number;
  exp: number;
};

function getSessionSecret(): string {
  return (
    (import.meta.env.MEMBERS_SESSION_SECRET as string | undefined)?.trim() ||
    process.env.MEMBERS_SESSION_SECRET?.trim() ||
    ""
  );
}

/** Plaintext shared password (server-only env). */
export function getMembersPassword(): string {
  return (
    (import.meta.env.MEMBERS_PASSWORD as string | undefined)?.trim() ||
    process.env.MEMBERS_PASSWORD?.trim() ||
    ""
  );
}

/** Reusable magic-link secret (query param `t`). */
export function getMembersMagicLinkToken(): string {
  return (
    (import.meta.env.MEMBERS_MAGIC_LINK_TOKEN as string | undefined)?.trim() ||
    process.env.MEMBERS_MAGIC_LINK_TOKEN?.trim() ||
    ""
  );
}

function base64UrlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecodeToBuffer(s: string): Buffer | null {
  try {
    const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
    return Buffer.from(b64, "base64");
  } catch {
    return null;
  }
}

/**
 * Constant-time UTF-8 string compare: pads both sides to the same buffer length before
 * `timingSafeEqual`, and requires identical original UTF-8 byte lengths (no throw).
 */
export function constantTimeEqualUtf8(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ua = enc.encode(a);
  const ub = enc.encode(b);
  const len = Math.max(ua.length, ub.length, 1);
  const pa = Buffer.alloc(len);
  const pb = Buffer.alloc(len);
  pa.set(ua);
  pb.set(ub);
  if (ua.length !== ub.length) {
    return false;
  }
  return timingSafeEqual(pa, pb);
}

function signPayload(payloadB64: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(payloadB64, "utf8").digest();
}

function isProd(): boolean {
  return import.meta.env.PROD || process.env.NODE_ENV === "production";
}

/** Full `Set-Cookie` header value (name=value; attributes). `null` if `MEMBERS_SESSION_SECRET` is unset. */
export function createSessionCookie(): string | null {
  const secret = getSessionSecret();
  if (!secret) {
    return null;
  }
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { iat: now, exp: now + SESSION_MAX_AGE_SEC };
  const payloadB64 = base64UrlEncode(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = signPayload(payloadB64, secret);
  const sigB64 = base64UrlEncode(sig);
  const value = `${payloadB64}.${sigB64}`;
  const secure = isProd() ? "; Secure" : "";
  return `${MEMBER_SESSION_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${SESSION_MAX_AGE_SEC}`;
}

/** Clears the member session cookie (Max-Age=0). */
export function clearSessionCookie(): string {
  const secure = isProd() ? "; Secure" : "";
  return `${MEMBER_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=0`;
}

function parseCookieHeader(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k !== name) continue;
    return part.slice(idx + 1).trim();
  }
  return null;
}

/** HMAC-SHA256 over `{ iat, exp }` (base64url payload + signature). No JWT dependency. */
export function getMemberSession(request: Request): { authenticated: boolean } {
  const secret = getSessionSecret();
  if (!secret) {
    return { authenticated: false };
  }
  const raw = parseCookieHeader(request.headers.get("cookie"), MEMBER_SESSION_COOKIE);
  if (!raw) {
    return { authenticated: false };
  }
  let value: string;
  try {
    value = decodeURIComponent(raw);
  } catch {
    return { authenticated: false };
  }
  const dot = value.indexOf(".");
  if (dot <= 0 || dot === value.length - 1) {
    return { authenticated: false };
  }
  const payloadB64 = value.slice(0, dot);
  const sigB64 = value.slice(dot + 1);
  const sigBuf = base64UrlDecodeToBuffer(sigB64);
  const expectedSig = signPayload(payloadB64, secret);
  if (!sigBuf || sigBuf.length !== expectedSig.length) {
    return { authenticated: false };
  }
  if (!timingSafeEqual(sigBuf, expectedSig)) {
    return { authenticated: false };
  }
  let payload: SessionPayload;
  try {
    const jsonBuf = base64UrlDecodeToBuffer(payloadB64);
    if (!jsonBuf) return { authenticated: false };
    payload = JSON.parse(jsonBuf.toString("utf8")) as SessionPayload;
  } catch {
    return { authenticated: false };
  }
  if (
    typeof payload.exp !== "number" ||
    typeof payload.iat !== "number" ||
    !Number.isFinite(payload.exp) ||
    !Number.isFinite(payload.iat)
  ) {
    return { authenticated: false };
  }
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    return { authenticated: false };
  }
  return { authenticated: true };
}
