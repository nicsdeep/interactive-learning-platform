import { NextResponse, type NextRequest } from "next/server";

/**
 * Temporary public launch gate. The Home and About pages are the deliberate
 * public-facing product story; unfinished product areas resolve to the single
 * Trussline launch-updates page.
 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") return NextResponse.next();

  const destination = request.nextUrl.clone();
  destination.pathname = "/learn";
  destination.search = "";
  return NextResponse.redirect(destination);
}

export const config = {
  matcher: ["/((?!learn(?:/|$)|about(?:/|$)|admin(?:/|$)|api(?:/|$)|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
