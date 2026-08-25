import { NextRequest, NextResponse } from "next/server";
import {
  adminCookie,
  adminTrustedDeviceCookie,
  createAdminSessionValue,
  isAdminConfigured,
  isSameOrigin,
  trustedAdminDeviceMatches,
} from "@/lib/admin-auth";
import {
  checkAdminRateLimit,
  clearAdminRateLimit,
  recordAdminFailure,
} from "@/lib/admin-rate-limit";
import { getBootstrapOwnerSignInIdentity } from "@/lib/admin-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateHeaders = {
  "Cache-Control": "no-store, private",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

function privateJson(payload: Record<string, unknown>, status = 200, retryAfterSeconds?: number) {
  const headers = new Headers(privateHeaders);
  if (retryAfterSeconds) headers.set("Retry-After", String(retryAfterSeconds));
  return NextResponse.json(payload, { status, headers });
}

function normalizeUsername(value: unknown) {
  if (typeof value !== "string") return undefined;
  const username = value.trim().toLocaleLowerCase("en-US");
  return /^[a-z0-9._-]{3,64}$/.test(username) ? username : undefined;
}

/**
 * Convenience sign-in for a browser that was previously verified with the
 * administrator password. The visible username never becomes a credential:
 * this route also requires a short-lived, HttpOnly trusted-device marker.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return privateJson({ error: "This request could not be verified." }, 403);
  }
  if (!isAdminConfigured()) {
    return privateJson({ error: "Admin access is not configured for this deployment." }, 503);
  }

  const rateLimit = checkAdminRateLimit(request, "username");
  if (!rateLimit.allowed) {
    return privateJson(
      { error: "Too many sign-in attempts. Please wait before trying again." },
      429,
      rateLimit.retryAfterSeconds,
    );
  }

  let username: string | undefined;
  try {
    username = normalizeUsername((await request.json() as { username?: unknown }).username);
  } catch {
    return privateJson({ error: "Enter your administrator username." }, 400);
  }

  const owner = await getBootstrapOwnerSignInIdentity();
  const ownerUsername = owner ? normalizeUsername(owner.username) : undefined;
  const trustedDevice = request.cookies.get(adminTrustedDeviceCookie.name)?.value;
  const matchesOwner = Boolean(owner && owner.status === "active" && username && ownerUsername && username === ownerUsername);

  if (!matchesOwner || !owner || !trustedAdminDeviceMatches(trustedDevice, owner.username)) {
    const outcome = recordAdminFailure(request, "username");
    if (!outcome.allowed) {
      return privateJson(
        { error: "Too many sign-in attempts. Please wait before trying again." },
        429,
        outcome.retryAfterSeconds,
      );
    }
    return privateJson({
      error: "This browser needs your administrator password once before username sign-in is available.",
    }, 401);
  }

  const session = createAdminSessionValue(owner.id);
  if (!session) {
    return privateJson({ error: "Admin access is not configured for this deployment." }, 503);
  }

  clearAdminRateLimit(request, "username");
  const response = privateJson({ ok: true });
  response.cookies.set(adminCookie.name, session, { ...adminCookie.options, maxAge: adminCookie.maxAge });
  return response;
}
