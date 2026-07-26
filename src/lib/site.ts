/**
 * Canonical public URL of the deployed site.
 *
 * Vercel exposes the production domain as `NEXT_PUBLIC_SITE_URL` when set;
 * otherwise we fall back to the project's default vercel.app domain.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://stpauls-community-choir.vercel.app";

/** Whether search engines may index this deployment. */
export const ALLOW_INDEXING = process.env.NEXT_PUBLIC_ALLOW_INDEXING !== "false";
