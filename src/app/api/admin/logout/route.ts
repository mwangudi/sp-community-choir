import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { publicOrigin } from "@/lib/public-origin";

export async function GET(request: Request) {
  // Built from request.url this sent everyone to https://localhost:3100.
  const url = new URL("/admin/login", publicOrigin(request));
  const response = NextResponse.redirect(url);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
