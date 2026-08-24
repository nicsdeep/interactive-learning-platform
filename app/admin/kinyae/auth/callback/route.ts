import { NextResponse } from "next/server";
import {
  adminCookie,
  adminOtpFlowCookie,
  createAdminOtpCallbackClient,
  createAdminSessionValue,
  isAdminOtpConfigured,
  isConfiguredAdminOtpUserEmail,
  readAdminOtpFlowCookieValue,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateHeaders = {
  "Cache-Control": "no-store, private",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

function readCookie(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  const entry = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return entry ? entry.slice(name.length + 1) : undefined;
}

function finish(request: Request, session?: string) {
  const destination = new URL("/admin/kinyae", request.url);
  if (!session) destination.searchParams.set("email-link", "expired");
  const response = NextResponse.redirect(destination);
  for (const [key, value] of Object.entries(privateHeaders)) response.headers.set(key, value);
  response.cookies.set(adminOtpFlowCookie.name, "", { ...adminOtpFlowCookie.options, maxAge: 0 });
  if (session) response.cookies.set(adminCookie.name, session, { ...adminCookie.options, maxAge: adminCookie.maxAge });
  return response;
}

/** Exchanges a single-use Supabase email-link code, then issues only our admin session cookie. */
export async function GET(request: Request) {
  if (!isAdminOtpConfigured()) return finish(request);
  const code = new URL(request.url).searchParams.get("code");
  const verifier = readAdminOtpFlowCookieValue(readCookie(request, adminOtpFlowCookie.name));
  if (!code || !verifier) return finish(request);

  const client = createAdminOtpCallbackClient(verifier);
  if (!client) return finish(request);

  try {
    const { data, error } = await client.auth.exchangeCodeForSession(code);
    const accessToken = data.session?.access_token;
    const verified = accessToken ? await client.auth.getUser(accessToken) : undefined;
    if (error || !verified?.data.user || verified.error || !isConfiguredAdminOtpUserEmail(verified.data.user.email)) {
      return finish(request);
    }

    return finish(request, createAdminSessionValue());
  } catch {
    return finish(request);
  }
}
