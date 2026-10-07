/**
 * The address visitors actually used. Behind nginx, Next builds request.url
 * from its own origin (localhost:3100), so a redirect built from it sends
 * people nowhere; the proxy's forwarded headers carry the real one.
 */
export function publicOrigin(request: Request): string {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : new URL(request.url).origin;
}
