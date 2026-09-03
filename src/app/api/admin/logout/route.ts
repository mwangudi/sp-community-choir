import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { SITE_URL } from "@/lib/site";

export async function GET(request: Request) {
  const url = new URL("/admin/login", request.url || SITE_URL);
  const response = NextResponse.redirect(url);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
