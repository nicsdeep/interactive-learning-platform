import { createHash } from "node:crypto";

type AdminRateLimitScope = "password" | "username";

type RateLimitRule = {
  maxAttempts: number;
  windowMs: number;
};

type RateLimitEntry = {
  attempts: number;
  startedAt: number;
  lockedUntil?: number;
};

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

const rules: Record<AdminRateLimitScope, RateLimitRule> = {
  password: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
  username: { maxAttempts: 8, windowMs: 15 * 60 * 1000 },
};

const attempts = new Map<string, RateLimitEntry>();

function clientFingerprint(request: Request, scope: AdminRateLimitScope) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const value = forwardedFor || realIp || "unknown";

  // Keep only a short-lived hash in process memory, never the address itself.
  return `${scope}:${createHash("sha256").update(value).digest("base64url")}`;
}

function cleanExpiredEntries(now: number) {
  if (attempts.size < 100) return;
  for (const [key, entry] of attempts) {
    const expired = entry.lockedUntil
      ? entry.lockedUntil <= now
      : entry.startedAt + 30 * 60 * 1000 <= now;
    if (expired) attempts.delete(key);
  }
}

function retryAfterSeconds(lockedUntil: number, now: number) {
  return Math.max(1, Math.ceil((lockedUntil - now) / 1000));
}

/**
 * A short-burst safeguard for the current server instance. Configure an
 * edge/WAF rate limit as well before opening administration to a broad team.
 */
export function checkAdminRateLimit(request: Request, scope: AdminRateLimitScope): RateLimitResult {
  const now = Date.now();
  cleanExpiredEntries(now);
  const entry = attempts.get(clientFingerprint(request, scope));

  if (!entry?.lockedUntil || entry.lockedUntil <= now) return { allowed: true };
  return { allowed: false, retryAfterSeconds: retryAfterSeconds(entry.lockedUntil, now) };
}

export function recordAdminFailure(request: Request, scope: AdminRateLimitScope): RateLimitResult {
  const now = Date.now();
  cleanExpiredEntries(now);
  const key = clientFingerprint(request, scope);
  const rule = rules[scope];
  const previous = attempts.get(key);
  const entry = !previous || previous.startedAt + rule.windowMs <= now || previous.lockedUntil && previous.lockedUntil <= now
    ? { attempts: 0, startedAt: now }
    : previous;

  entry.attempts += 1;
  if (entry.attempts >= rule.maxAttempts) entry.lockedUntil = now + rule.windowMs;
  attempts.set(key, entry);

  return entry.lockedUntil
    ? { allowed: false, retryAfterSeconds: retryAfterSeconds(entry.lockedUntil, now) }
    : { allowed: true };
}

export function clearAdminRateLimit(request: Request, scope: AdminRateLimitScope) {
  attempts.delete(clientFingerprint(request, scope));
}
