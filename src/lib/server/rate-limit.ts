import "server-only";

import { headers } from "next/headers";

/**
 * Fixed-window counters kept in memory. The site runs as one Node process
 * behind nginx, so this is enough to slow password guessing and form spam;
 * a restart simply clears it.
 */
type Window = { count: number; limit: number; resetAt: number };
const windows = new Map<string, Window>();

/** nginx sets X-Real-IP; fall back to the first X-Forwarded-For hop. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function sweep(now: number) {
  if (windows.size < 5_000) return;
  for (const [key, w] of windows) if (w.resetAt <= now) windows.delete(key);
}

/** Minutes until `key` may try again, or 0 when it is still allowed. */
export function blockedFor(key: string): number {
  const w = windows.get(key);
  const now = Date.now();
  if (!w || w.resetAt <= now || w.count < w.limit) return 0;
  return Math.ceil((w.resetAt - now) / 60_000);
}

/** Counts one attempt against `key`, allowing `limit` per `windowMs`. */
export function hit(key: string, limit: number, windowMs: number): void {
  const now = Date.now();
  sweep(now);
  const w = windows.get(key);
  if (!w || w.resetAt <= now) {
    windows.set(key, { count: 1, limit, resetAt: now + windowMs });
  } else {
    w.count += 1;
  }
}

export function reset(key: string) {
  windows.delete(key);
}
