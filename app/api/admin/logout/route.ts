import { NextResponse } from "next/server";
import { adminCookie, isSameOrigin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const privateHeaders = {
  "Cache-Control": "no-store, private",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "This request could not be verified." },
      { status: 403, headers: privateHeaders },
    );
  }

  const response = NextResponse.json({ ok: true }, { headers: privateHeaders });
  response.cookies.set(adminCookie.name, "", { ...adminCookie.options, maxAge: 0 });
  return response;
}
