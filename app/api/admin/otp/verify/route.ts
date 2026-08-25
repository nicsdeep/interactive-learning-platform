import { NextResponse } from "next/server";
import {
  adminCookie,
  createAdminOtpVerificationClient,
  createAdminSessionValue,
  getConfiguredAdminOtpEmailForServer,
  isAdminOtpConfigured,
  isConfiguredAdminOtpUserEmail,
  isSameOrigin,
  isValidAdminOtpCode,
} from "@/lib/admin-auth";
import {
  checkAdminRateLimit,
  clearAdminRateLimit,
  recordAdminFailure,
} from "@/lib/admin-rate-limit";
import { syncVerifiedBootstrapOwner } from "@/lib/admin-workspace";

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

/**
 * Optional email-code endpoint. It works when the Supabase email template
 * contains {{ .Token }} rather than (or in addition to) a magic-link URL.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return privateJson({ error: "This request could not be verified." }, 403);
  if (!isAdminOtpConfigured()) return privateJson({ error: "Secure email sign-in is not available right now." }, 503);

  const rateLimit = checkAdminRateLimit(request, "otp-verify");
  if (!rateLimit.allowed) {
    return privateJson(
      { error: "Too many verification attempts. Please wait before trying again." },
      429,
      rateLimit.retryAfterSeconds,
    );
  }

  let code: unknown;
  try {
    code = (await request.json() as { code?: unknown }).code;
  } catch {
    return privateJson({ error: "Enter the code from your email." }, 400);
  }
  if (!isValidAdminOtpCode(code)) {
    const outcome = recordAdminFailure(request, "otp-verify");
    return privateJson(
      { error: "We could not verify that code. Check it and try again." },
      outcome.allowed ? 401 : 429,
      outcome.retryAfterSeconds,
    );
  }

  const email = getConfiguredAdminOtpEmailForServer();
  const client = createAdminOtpVerificationClient();
  if (!email || !client) return privateJson({ error: "Secure email sign-in is not available right now." }, 503);

  try {
    const { data, error } = await client.auth.verifyOtp({ email, token: code, type: "email" });
    const accessToken = data.session?.access_token;
    const verified = accessToken ? await client.auth.getUser(accessToken) : undefined;
    if (error || !verified?.data.user || verified.error || !isConfiguredAdminOtpUserEmail(verified.data.user.email)) {
      const outcome = recordAdminFailure(request, "otp-verify");
      return privateJson(
        { error: "We could not verify that code. Check it and try again." },
        outcome.allowed ? 401 : 429,
        outcome.retryAfterSeconds,
      );
    }

    // The existing verified-email route is the safe bridge from the previous
    // single-owner setup to named administrative membership. It binds only the
    // verified Supabase user to the bootstrap owner; typing a username alone
    // never creates an administrator session.
    await syncVerifiedBootstrapOwner(verified.data.user.id, verified.data.user.email);
    const session = createAdminSessionValue(verified.data.user.id);
    if (!session) return privateJson({ error: "Secure email sign-in is not available right now." }, 503);
    clearAdminRateLimit(request, "otp-verify");
    const response = privateJson({ ok: true });
    response.cookies.set(adminCookie.name, session, { ...adminCookie.options, maxAge: adminCookie.maxAge });
    return response;
  } catch {
    const outcome = recordAdminFailure(request, "otp-verify");
    return privateJson(
      { error: "We could not verify that code. Check it and try again." },
      outcome.allowed ? 401 : 429,
      outcome.retryAfterSeconds,
    );
  }
}
