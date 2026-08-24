import { NextResponse } from "next/server";
import {
  adminOtpFlowCookie,
  createAdminOtpFlowCookieValue,
  createAdminOtpRequestClient,
  isAdminOtpConfigured,
  isSameOrigin,
} from "@/lib/admin-auth";
import { consumeAdminRateLimit } from "@/lib/admin-rate-limit";

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

function providerFailure(error: unknown) {
  const status = typeof error === "object" && error !== null && "status" in error && typeof error.status === "number"
    ? error.status
    : undefined;

  if (status === 429) {
    return {
      error: "A secure link was just requested. Please wait a minute before requesting another.",
      status: 429,
      retryAfterSeconds: 60,
    };
  }

  return {
    error: "We could not prepare a secure sign-in link right now. Please use your password or try again shortly.",
    status: 502,
  };
}

/**
 * Sends a sign-in link only to the single verified administrator configured
 * in server environment variables. It never accepts an email from the client.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return privateJson({ error: "This request could not be verified." }, 403);
  }
  if (!isAdminOtpConfigured()) {
    return privateJson({ error: "Secure email sign-in is not available right now." }, 503);
  }

  const rateLimit = consumeAdminRateLimit(request, "otp-request");
  if (!rateLimit.allowed) {
    return privateJson(
      { error: "Too many email requests. Please wait before trying again." },
      429,
      rateLimit.retryAfterSeconds,
    );
  }

  const originHeader = request.headers.get("origin");
  let callbackUrl: string;
  try {
    callbackUrl = new URL("/admin/kinyae/auth/callback", originHeader ?? "").toString();
  } catch {
    return privateJson({ error: "This request could not be verified." }, 403);
  }

  const flow = createAdminOtpRequestClient();
  if (!flow) return privateJson({ error: "Secure email sign-in is not available right now." }, 503);

  try {
    const { error } = await flow.client.auth.signInWithOtp({
      email: flow.email,
      options: {
        // This endpoint never accepts an email from the browser. Creating the
        // one configured account on first use keeps passwordless activation in
        // the verified inbox rather than requiring an out-of-band password.
        shouldCreateUser: true,
        emailRedirectTo: callbackUrl,
      },
    });
    if (error) {
      const failure = providerFailure(error);
      return privateJson({ error: failure.error }, failure.status, failure.retryAfterSeconds);
    }

    const cookieValue = flow.getVerifier();
    if (!cookieValue) {
      return privateJson({ error: "We could not prepare a secure sign-in link right now. Please use your password or try again shortly." }, 503);
    }

    const encryptedFlow = createAdminOtpFlowCookieValue(cookieValue);
    if (!encryptedFlow) return privateJson({ error: "We could not start secure email sign-in." }, 503);

    const response = privateJson({ ok: true });
    response.cookies.set(adminOtpFlowCookie.name, encryptedFlow, {
      ...adminOtpFlowCookie.options,
      maxAge: adminOtpFlowCookie.maxAge,
    });
    return response;
  } catch {
    return privateJson({ error: "We could not send a secure sign-in link. Please try again shortly." }, 503);
  }
}
