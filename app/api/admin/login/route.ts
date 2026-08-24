import { NextResponse } from "next/server";
import { adminCookie, createAdminSessionValue, isAdminConfigured, isSameOrigin, passwordMatches } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin access is not configured for this deployment." }, { status: 503 });
  }

  let password = "";
  try {
    const body = await request.json() as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Enter the administrator password." }, { status: 400 });
  }

  if (!passwordMatches(password)) {
    return NextResponse.json({ error: "The password is not recognised." }, { status: 401 });
  }

  const session = createAdminSessionValue();
  if (!session) {
    return NextResponse.json({ error: "Admin access is not configured for this deployment." }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(adminCookie.name, session, { ...adminCookie.options, maxAge: adminCookie.maxAge });
  return response;
}
