const ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * Accepts a bare id or any of the usual YouTube URL shapes
 * (watch?v=, youtu.be/, /live/, /embed/, /shorts/).
 */
export function youtubeId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (ID.test(value)) return value;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.slice(1);
      return ID.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = url.searchParams.get("v");
      if (v && ID.test(v)) return v;

      const match = url.pathname.match(/^\/(?:live|embed|shorts)\/([^/?]+)/);
      if (match && ID.test(match[1])) return match[1];
    }
  } catch {
    // Not a URL — fall through.
  }

  return null;
}

export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
