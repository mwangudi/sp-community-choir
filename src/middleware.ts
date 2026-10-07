import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";
import { publicOrigin } from "@/lib/public-origin";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

/** Middleware insists on an absolute location; see publicOrigin for why. */
function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, publicOrigin(request)));
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
