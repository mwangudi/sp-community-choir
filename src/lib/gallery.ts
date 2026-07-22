/**
 * Gallery — photos and videos from choir life and concerts.
 *
 * Two kinds of items:
 *   - `photo` — a JPG/PNG dropped into `/public/gallery/` (then add
 *     the entry below).
 *   - `video` — a YouTube video, referenced by its 11-character ID
 *     (the part after `v=` in the URL, or after `youtu.be/`).
 *
 * The page also embeds the YouTube channel's uploads playlist, so
 * new videos posted to YouTube appear automatically without any
 * code change.
 *
 * To add a photo:
 *   1. Save the file to `/public/gallery/<name>.jpg`
 *   2. Add an entry below:
 *      { kind: "photo", slug: "...", src: "/gallery/name.jpg",
 *        alt: "...", caption: "...", date: "2025-12-20" }
 *
 * To add a video:
 *   1. Copy the YouTube video ID (e.g. `dQw4w9WgXcQ`).
 *   2. Add an entry below:
 *      { kind: "video", slug: "...", youtubeId: "...",
 *        title: "...", caption: "...", date: "..." }
 */

import { CHOIR } from "./choir";

export type GalleryPhoto = {
  kind: "photo";
  slug: string;
  src: string;
  alt: string;
  caption?: string;
  /** ISO date (YYYY-MM-DD). */
  date?: string;
  tags?: string[];
};

export type GalleryVideo = {
  kind: "video";
  slug: string;
  /** YouTube video ID (11 chars). */
  youtubeId: string;
  title: string;
  caption?: string;
  /** ISO date (YYYY-MM-DD). */
  date?: string;
  tags?: string[];
};

export type GalleryItem = GalleryPhoto | GalleryVideo;

/**
 * Seed catalogue. The YouTube channel uploads playlist is
 * embedded separately so videos surface even when this list is
 * sparse.
 */
export const GALLERY_ITEMS: GalleryItem[] = [
  {
    kind: "photo",
    slug: "praise-and-dance",
    src: "/gallery/pic-1.avif",
    alt: "Choir in praise and dance",
    caption: "Join us in praise and dance.",
  },
  {
    kind: "photo",
    slug: "explore-and-learn",
    src: "/gallery/pic-2.avif",
    alt: "Choir exploring different musical traditions",
    caption: "Classical, African — you name it.",
  },
  {
    kind: "photo",
    slug: "eucharistic-celebration",
    src: "/gallery/pic-3.avif",
    alt: "The Eucharistic celebration",
    caption: "Our core: the Eucharistic celebration.",
  },
  {
    kind: "photo",
    slug: "choir-moment-4",
    src: "/gallery/pic-4.avif",
    alt: "St. Paul's Chapel Community Choir",
  },
  {
    kind: "photo",
    slug: "choir-moment-5",
    src: "/gallery/pic-5.avif",
    alt: "St. Paul's Chapel Community Choir",
  },
];

// ---- channel helpers ----

const YOUTUBE_SOCIAL = CHOIR.socials.find((s) => s.icon === "youtube");

/** Public URL of the choir's YouTube channel (from CHOIR.socials). */
export const YOUTUBE_CHANNEL_URL = YOUTUBE_SOCIAL?.href ?? "";

/**
 * Extract the channel ID (UC…) from a channel URL of the form
 * `https://www.youtube.com/channel/<ID>`.
 */
export function extractChannelId(url: string): string | null {
  const m = url.match(/\/channel\/([A-Za-z0-9_-]{20,})/);
  return m ? m[1] : null;
}

/**
 * YouTube exposes every channel's uploads as a special playlist
 * whose ID is the channel ID with the `UC` prefix replaced by `UU`.
 * That playlist can be embedded directly.
 */
export function uploadsPlaylistId(channelId: string): string {
  return "UU" + channelId.slice(2);
}

/** Channel ID resolved from CHOIR.socials, if any. */
export const YOUTUBE_CHANNEL_ID = YOUTUBE_CHANNEL_URL
  ? extractChannelId(YOUTUBE_CHANNEL_URL)
  : null;

/** Uploads playlist ID for the choir's channel, if known. */
export const YOUTUBE_UPLOADS_PLAYLIST_ID = YOUTUBE_CHANNEL_ID
  ? uploadsPlaylistId(YOUTUBE_CHANNEL_ID)
  : null;

/** Embed URL for the uploads playlist (auto-plays the latest first). */
export const YOUTUBE_UPLOADS_EMBED_URL = YOUTUBE_UPLOADS_PLAYLIST_ID
  ? `https://www.youtube.com/embed/videoseries?list=${YOUTUBE_UPLOADS_PLAYLIST_ID}`
  : null;

/** Thumbnail URL for a YouTube video ID. */
export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/** Full watch URL for a YouTube video ID. */
export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** Embed URL for a single YouTube video. */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube.com/embed/${id}`;
}

// ---- filtering ----

export type GalleryFilter = "all" | "photo" | "video";

export function filterGallery(
  items: GalleryItem[],
  kind: GalleryFilter,
): GalleryItem[] {
  if (kind === "all") return items;
  return items.filter((i) => i.kind === kind);
}

export function galleryPhotos(): GalleryPhoto[] {
  return GALLERY_ITEMS.filter((i): i is GalleryPhoto => i.kind === "photo");
}

export function galleryVideos(): GalleryVideo[] {
  return GALLERY_ITEMS.filter((i): i is GalleryVideo => i.kind === "video");
}
