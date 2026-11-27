import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "~@/lib/auth";

const marketingPaths = new Set(["/", "/features", "/how-it-works", "/pricing"]);

export async function proxy(request: NextRequest) {
  const hasSessionCookie = Boolean(getSessionCookie(request));
  const { pathname } = request.nextUrl;

  if (marketingPaths.has(pathname)) {
    if (!hasSessionCookie) return NextResponse.next();
    const session = await auth.api.getSession({ headers: request.headers });
    return session ? NextResponse.redirect(new URL("/documents", request.url)) : NextResponse.next();
  }

  if (!hasSessionCookie) {
    const home = new URL("/", request.url);
    home.searchParams.set("login", "");
    home.searchParams.set("next", pathname);
    return NextResponse.redirect(home);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/features", "/how-it-works", "/pricing", "/documents/:path*", "/library/:path*"],
};
