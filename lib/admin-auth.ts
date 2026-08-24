import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "trussline_admin_session";
const ADMIN_OTP_COOKIE = "trussline_admin_otp_pkce";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const OTP_FLOW_TTL_MS = 1000 * 60 * 15;
export const MAX_ADMIN_PASSWORD_LENGTH = 512;
const MAX_OTP_CODE_LENGTH = 64;

type AdminSession = {
  issuedAt: number;
  nonce: string;
};

function secret() {
  return process.env.TRUSSLINE_ADMIN_PASSWORD;
}

function configuredOtpEmail() {
  const value = process.env.TRUSSLINE_ADMIN_OTP_EMAIL?.trim();
  if (!value || value.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return undefined;
  return value.toLocaleLowerCase("en-US");
}

function serverEnvironmentValue(name: string) {
  // Bracket access deliberately keeps protected runtime configuration from
  // being compiled into a static browser bundle or a stale build-time value.
  return process.env[name]?.trim();
}

function supabaseAuthConfig() {
  const url = serverEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL");
  // Supabase's current project connection screen issues a publishable key.
  // Retain the legacy anon-key fallback for projects that have not migrated.
  const publicKey = serverEnvironmentValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
    ?? serverEnvironmentValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !publicKey) return undefined;

  try {
    new URL(url);
    return { url, anonKey: publicKey };
  } catch {
    return undefined;
  }
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

/** Safe for server-rendered UI: it intentionally exposes no email address. */
export function getAdminAccessMethods() {
  return {
    passwordEnabled: isAdminConfigured(),
    emailLinkEnabled: isAdminOtpConfigured(),
  } as const;
}

/** Whether the verified email sign-in path has every required server setting. */
export function isAdminOtpConfigured() {
  return Boolean(isAdminConfigured() && configuredOtpEmail() && supabaseAuthConfig());
}

export function isValidAdminOtpCode(value: unknown): value is string {
  return typeof value === "string"
    && value.length >= 6
    && value.length <= MAX_OTP_CODE_LENGTH
    && /^[A-Za-z0-9]+$/.test(value);
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

type AuthStorage = {
  isServer?: boolean;
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

function createAdminSupabaseAuthClient(storage?: AuthStorage) {
  const config = supabaseAuthConfig();
  if (!config) return undefined;

  return createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      flowType: "pkce",
      storage,
    },
  });
}

/**
 * Starts a server-held PKCE flow. The verifier is captured so it can be placed
 * in an encrypted, HttpOnly callback-only cookie rather than browser storage.
 */
export function createAdminOtpRequestClient() {
  let verifier: string | undefined;
  const storage: AuthStorage = {
    isServer: true,
    getItem: async () => null,
    setItem: async (key, value) => {
      if (key.endsWith("-code-verifier")) verifier = value;
    },
    removeItem: async () => undefined,
  };
  const client = createAdminSupabaseAuthClient(storage);
  if (!client || !configuredOtpEmail()) return undefined;

  return {
    client,
    email: configuredOtpEmail()!,
    getVerifier: () => verifier,
  };
}

/** Client for exchanging a returned email-link code using its original PKCE verifier. */
export function createAdminOtpCallbackClient(verifier: string) {
  const storage: AuthStorage = {
    isServer: true,
    getItem: async (key) => key.endsWith("-code-verifier") ? verifier : null,
    setItem: async () => undefined,
    removeItem: async () => undefined,
  };
  return createAdminSupabaseAuthClient(storage);
}

/** Client for a six-digit email OTP flow, if the project email template is configured for codes. */
export function createAdminOtpVerificationClient() {
  return createAdminSupabaseAuthClient({
    isServer: true,
    getItem: async () => null,
    setItem: async () => undefined,
    removeItem: async () => undefined,
  });
}

export function getConfiguredAdminOtpEmailForServer() {
  return configuredOtpEmail();
}

export function isConfiguredAdminOtpUserEmail(email: string | null | undefined) {
  const expected = configuredOtpEmail();
  return Boolean(email && expected && email.toLocaleLowerCase("en-US") === expected);
}

function otpEncryptionKey() {
  const configuredSecret = secret();
  if (!configuredSecret) return undefined;
  return createHash("sha256")
    .update("trussline-admin-otp-pkce:v1\u0000")
    .update(configuredSecret)
    .digest();
}

/** Encrypt a short-lived PKCE verifier before it is sent back to the browser. */
export function createAdminOtpFlowCookieValue(verifier: string) {
  const key = otpEncryptionKey();
  if (!key || !verifier || verifier.length > 1024) return undefined;

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const cleartext = Buffer.from(JSON.stringify({ issuedAt: Date.now(), verifier }), "utf8");
  const ciphertext = Buffer.concat([cipher.update(cleartext), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((value) => value.toString("base64url")).join(".");
}

export function readAdminOtpFlowCookieValue(value: string | undefined) {
  const key = otpEncryptionKey();
  if (!key || !value) return undefined;

  try {
    const parts = value.split(".");
    if (parts.length !== 3) return undefined;
    const [ivRaw, tagRaw, ciphertextRaw] = parts;
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivRaw, "base64url"));
    decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
    const decoded = Buffer.concat([
      decipher.update(Buffer.from(ciphertextRaw, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    const payload = JSON.parse(decoded) as { issuedAt?: unknown; verifier?: unknown };
    const issuedAt = payload.issuedAt;
    if (typeof issuedAt !== "number" || !Number.isSafeInteger(issuedAt) || typeof payload.verifier !== "string") return undefined;
    if (Date.now() - issuedAt > OTP_FLOW_TTL_MS || issuedAt > Date.now() + 60_000) return undefined;
    return payload.verifier.length > 0 && payload.verifier.length <= 1024 ? payload.verifier : undefined;
  } catch {
    return undefined;
  }
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

/** Lax is required for an email link's top-level return navigation. */
export const adminOtpFlowCookie = {
  name: ADMIN_OTP_COOKIE,
  maxAge: Math.floor(OTP_FLOW_TTL_MS / 1000),
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/admin/kinyae/auth/callback",
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
