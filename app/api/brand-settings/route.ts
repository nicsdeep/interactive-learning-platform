import { NextResponse } from "next/server";
import { getSiteBrandSettings } from "@/lib/site-brand-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Deliberately public and minimal: clients only need the visual logo setting
 * in order to keep an already-open learning page current. No admin state,
 * account data, or configuration secrets are returned here.
 */
export async function GET() {
  const settings = await getSiteBrandSettings();

  return NextResponse.json(
    { logoScale: settings.logoScale },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
