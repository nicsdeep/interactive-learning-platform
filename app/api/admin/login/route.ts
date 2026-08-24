import { NextResponse } from "next/server";
import {
  adminCookie,
  createAdminSessionValue,
  isAdminConfigured,
  isSameOrigin,
  MAX_ADMIN_PASSWORD_LENGTH,
  passwordMatches,
} from "@/lib/admin-auth";
import {
  checkAdminRateLimit,
  clearAdminRateLimit,
  recordAdminFailure,
} from "@/lib/admin-rate-limit";

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

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return privateJson({ error: "This request could not be verified." }, 403);
  }
  if (!isAdminConfigured()) {
    return privateJson({ error: "Admin access is not configured for this deployment." }, 503);
  }

  const rateLimit = checkAdminRateLimit(request, "password");
  if (!rateLimit.allowed) {
    return privateJson(
      { error: "Too many sign-in attempts. Please wait before trying again." },
      429,
      rateLimit.retryAfterSeconds,
    );
  }

  let password = "";
  try {
    const body = await request.json() as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return privateJson({ error: "Enter the administrator password." }, 400);
  }

  if (password.length > MAX_ADMIN_PASSWORD_LENGTH) {
    return privateJson({ error: "We could not verify your access. Check the password and try again." }, 401);
  }

  if (!passwordMatches(password)) {
    const outcome = recordAdminFailure(request, "password");
    if (!outcome.allowed) {
      return privateJson(
        { error: "Too many sign-in attempts. Please wait before trying again." },
        429,
        outcome.retryAfterSeconds,
      );
    }
    return privateJson({ error: "We could not verify your access. Check the password and try again." }, 401);
  }

  clearAdminRateLimit(request, "password");
  const session = createAdminSessionValue();
  if (!session) {
    return privateJson({ error: "Admin access is not configured for this deployment." }, 503);
  }

  const response = privateJson({ ok: true });
  response.cookies.set(adminCookie.name, session, { ...adminCookie.options, maxAge: adminCookie.maxAge });
  return response;
}
