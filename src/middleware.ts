import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

/**
 * Behind nginx, Next builds request.url from its own origin, so redirecting
 * against it sends people to localhost:3100. Middleware insists the location
 * be absolute, so build it from the headers the proxy actually sets.
 */
function redirectTo(request: NextRequest, path: string) {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const base = host ? `${proto}://${host}` : request.url;
  return NextResponse.redirect(new URL(path, base));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (PUBLIC_ADMIN_PATHS.includes(pathname)) {
    if (session) {
      return redirectTo(request, "/admin");
    }
    return NextResponse.next();
  }

  if (!session) {
    return redirectTo(request, `/admin/login?next=${encodeURIComponent(pathname)}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
