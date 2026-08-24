import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "trussline_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
export const MAX_ADMIN_PASSWORD_LENGTH = 512;

type AdminSession = {
  issuedAt: number;
  nonce: string;
};

function secret() {
  return process.env.TRUSSLINE_ADMIN_PASSWORD;
}

function sign(value: string, signingSecret: string) {
  return createHmac("sha256", signingSecret).update(value).digest("base64url");
}

function equal(left: string, right: string) {
  const leftValue = Buffer.from(left);
  const rightValue = Buffer.from(right);
  return leftValue.length === rightValue.length && timingSafeEqual(leftValue, rightValue);
}

function encode(session: AdminSession, signingSecret: string) {
  const payload = `${session.issuedAt}.${session.nonce}`;
  return `${payload}.${sign(payload, signingSecret)}`;
}

function decode(value: string, signingSecret: string): AdminSession | undefined {
  const parts = value.split(".");
  if (parts.length !== 3) return undefined;

  const [issuedAtRaw, nonce, signature] = parts;
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isSafeInteger(issuedAt) || !nonce || !signature) return undefined;
  if (Date.now() - issuedAt > SESSION_TTL_MS || issuedAt > Date.now() + 60_000) return undefined;

  const payload = `${issuedAtRaw}.${nonce}`;
  return equal(signature, sign(payload, signingSecret)) ? { issuedAt, nonce } : undefined;
}

export function isAdminConfigured() {
  return Boolean(secret()?.length);
}

export function passwordMatches(candidate: string) {
  const configuredSecret = secret();
  return Boolean(
    configuredSecret
    && candidate
    && candidate.length <= MAX_ADMIN_PASSWORD_LENGTH
    && equal(candidate, configuredSecret),
  );
}

export function createAdminSessionValue() {
  const configuredSecret = secret();
  if (!configuredSecret) return undefined;
  return encode({ issuedAt: Date.now(), nonce: randomBytes(18).toString("base64url") }, configuredSecret);
}

export async function isAdminAuthenticated() {
  const configuredSecret = secret();
  if (!configuredSecret) return false;

  const stored = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(stored && decode(stored, configuredSecret));
}

export const adminCookie = {
  name: ADMIN_COOKIE,
  maxAge: Math.floor(SESSION_TTL_MS / 1000),
  options: {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
};

/** Reject cross-site mutations even if a browser has an old cookie. */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
