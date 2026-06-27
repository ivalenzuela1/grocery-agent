import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, verifyToken } from "@/lib/auth";

// Renamed from `middleware` per Next.js 16 (the middleware convention is
// deprecated in favor of `proxy`). Single shared-password gate.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths that must remain reachable while locked.
  if (pathname === "/login") {
    return NextResponse.next();
  }

  const ok = await verifyToken(req.cookies.get(AUTH_COOKIE)?.value);
  if (ok) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
