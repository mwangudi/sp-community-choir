import type { PostCategory } from "@prisma/client";

export const POST_CATEGORIES: PostCategory[] = [
  "NEWS",
  "EVENT",
  "REFLECTION",
  "PATRON_SAINT",
];

export function postCategoryLabel(category: PostCategory): string {
  switch (category) {
    case "EVENT":
      return "Events";
    case "REFLECTION":
      return "Reflections";
    case "PATRON_SAINT":
      return "Patron saints";
    default:
      return "News";
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Rough reading time, used as a hint on post cards. */
export function readingMinutes(body: string): number {
  const text = body.replace(/<[^>]+>/g, " ");
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));
}

/** True when the stored body is legacy plain text rather than HTML. */
export function isPlainText(body: string): boolean {
  return !/<[a-z][\s\S]*>/i.test(body);
}

/** Wraps legacy plain-text bodies in paragraphs so they render consistently. */
export function ensureHtml(body: string): string {
  if (!isPlainText(body)) return body;
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join("");
}
