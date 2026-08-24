import { NextResponse, type NextRequest } from "next/server";

/**
 * Temporary public launch gate. Until a product area is explicitly opened,
 * every public route resolves to the single Trussline launch-updates page.
 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") return NextResponse.next();

  const destination = request.nextUrl.clone();
  destination.pathname = "/learn";
  destination.search = "";
  return NextResponse.redirect(destination);
}

export const config = {
  matcher: ["/((?!learn(?:/|$)|api(?:/|$)|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
