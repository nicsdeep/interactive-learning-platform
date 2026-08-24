import { NextResponse } from "next/server";
import { isAdminAuthenticated, isSameOrigin } from "@/lib/admin-auth";
import { getSiteBrandSettings, isSiteBrandPersistenceConfigured, normalizeLogoScale, updateSiteBrandSettings } from "@/lib/site-brand-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function noStore(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

async function requireAdmin() {
  return isAdminAuthenticated();
}

export async function GET() {
  if (!(await requireAdmin())) return noStore({ error: "Sign in required." }, 401);
  const settings = await getSiteBrandSettings();
  return noStore({ ...settings, persistenceConfigured: isSiteBrandPersistenceConfigured() });
}

export async function PUT(request: Request) {
  if (!isSameOrigin(request)) return noStore({ error: "This request could not be verified." }, 403);
  if (!(await requireAdmin())) return noStore({ error: "Sign in required." }, 401);
  if (!isSiteBrandPersistenceConfigured()) {
    return noStore({ error: "Saving is not configured for this deployment." }, 503);
  }

  let logoScale: number | undefined;
  try {
    const body = await request.json() as { logoScale?: unknown };
    logoScale = normalizeLogoScale(body.logoScale);
  } catch {
    return noStore({ error: "Use a valid logo size." }, 400);
  }
  if (!logoScale) return noStore({ error: "Choose a logo size between 80% and 400%." }, 400);

  try {
    const result = await updateSiteBrandSettings(logoScale);
    if (!result.ok) return noStore({ error: "The appearance change could not be saved." }, 502);
    return noStore({ ok: true, ...result.settings });
  } catch {
    return noStore({ error: "The appearance change could not be saved." }, 502);
  }
}
