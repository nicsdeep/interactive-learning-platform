import "server-only";

import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "trussline_admin_session";
const ADMIN_TRUSTED_DEVICE_COOKIE = "trussline_admin_trusted_device";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const TRUSTED_DEVICE_TTL_MS = 1000 * 60 * 60 * 24 * 30;
export const MAX_ADMIN_PASSWORD_LENGTH = 512;

type AdminSession = {
  issuedAt: number;
  nonce: string;
  /** Reserved for a future named-member authentication rollout. */
  actorId?: string;
};

type TrustedAdminDevice = {
  issuedAt: number;
  nonce: string;
  username: string;
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

function validActorId(value: string | undefined) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function normaliseUsername(value: string) {
  const username = value.trim().toLocaleLowerCase("en-US");
  return /^[a-z0-9._-]{3,64}$/.test(username) ? username : undefined;
}

function encode(session: AdminSession, signingSecret: string) {
  const payload = session.actorId && validActorId(session.actorId)
    ? `${session.issuedAt}.${session.nonce}.${session.actorId}`
    : `${session.issuedAt}.${session.nonce}`;
  return `${payload}.${sign(payload, signingSecret)}`;
}

function decode(value: string, signingSecret: string): AdminSession | undefined {
  const parts = value.split(".");
  if (parts.length !== 3 && parts.length !== 4) return undefined;

  const [issuedAtRaw, nonce, actorIdOrSignature, optionalSignature] = parts;
  const actorId = optionalSignature ? actorIdOrSignature : undefined;
  const signature = optionalSignature ?? actorIdOrSignature;
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isSafeInteger(issuedAt) || !nonce || !signature) return undefined;
  if (actorId && !validActorId(actorId)) return undefined;
  if (Date.now() - issuedAt > SESSION_TTL_MS || issuedAt > Date.now() + 60_000) return undefined;

  const payload = actorId ? `${issuedAtRaw}.${nonce}.${actorId}` : `${issuedAtRaw}.${nonce}`;
  return equal(signature, sign(payload, signingSecret)) ? { issuedAt, nonce, actorId } : undefined;
}

function encodeTrustedDevice(device: TrustedAdminDevice, signingSecret: string) {
  const payload = Buffer.from(JSON.stringify(device), "utf8").toString("base64url");
  return `${payload}.${sign(payload, signingSecret)}`;
}

function decodeTrustedDevice(value: string, signingSecret: string): TrustedAdminDevice | undefined {
  const parts = value.split(".");
  if (parts.length !== 2) return undefined;

  const [payload, signature] = parts;
  if (!payload || !signature || !equal(signature, sign(payload, signingSecret))) return undefined;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<TrustedAdminDevice>;
    const username = typeof decoded.username === "string" ? normaliseUsername(decoded.username) : undefined;
    if (!username || typeof decoded.issuedAt !== "number" || !Number.isSafeInteger(decoded.issuedAt) || typeof decoded.nonce !== "string") return undefined;
    if (Date.now() - decoded.issuedAt > TRUSTED_DEVICE_TTL_MS || decoded.issuedAt > Date.now() + 60_000) return undefined;
    return { issuedAt: decoded.issuedAt, nonce: decoded.nonce, username };
  } catch {
    return undefined;
  }
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

export function createAdminSessionValue(actorId?: string) {
  const configuredSecret = secret();
  if (!configuredSecret) return undefined;
  return encode({ issuedAt: Date.now(), nonce: randomBytes(18).toString("base64url"), actorId }, configuredSecret);
}

/**
 * A trusted-device marker is issued only after a successful password login.
 * It lets this one browser use the visible owner handle for a short period,
 * while the handle remains useless on any other browser or device.
 */
export function createTrustedAdminDeviceValue(username: string) {
  const configuredSecret = secret();
  const normalised = normaliseUsername(username);
  if (!configuredSecret || !normalised) return undefined;
  return encodeTrustedDevice({
    issuedAt: Date.now(),
    nonce: randomBytes(18).toString("base64url"),
    username: normalised,
  }, configuredSecret);
}

export function trustedAdminDeviceMatches(value: string | undefined, username: string) {
  const configuredSecret = secret();
  const normalised = normaliseUsername(username);
  if (!configuredSecret || !value || !normalised) return false;
  return decodeTrustedDevice(value, configuredSecret)?.username === normalised;
}

export async function isAdminAuthenticated() {
  return Boolean(await getAdminSession());
}

/** Server-only identity information for the named-admin migration. */
export async function getAdminSession() {
  const configuredSecret = secret();
  if (!configuredSecret) return undefined;

  const stored = (await cookies()).get(ADMIN_COOKIE)?.value;
  return stored ? decode(stored, configuredSecret) : undefined;
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

export const adminTrustedDeviceCookie = {
  name: ADMIN_TRUSTED_DEVICE_COOKIE,
  maxAge: Math.floor(TRUSTED_DEVICE_TTL_MS / 1000),
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
