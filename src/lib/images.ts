/**
 * Curated Unsplash image URLs used across the site.
 *
 * Swap any of these for real choir photos as they become available.
 * All URLs are sized for hero/landscape use; the Unsplash CDN handles
 * resizing via the `w` and `auto=format` query params.
 *
 * Host `images.unsplash.com` is whitelisted in `next.config.ts`.
 */

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?w=${w}&auto=format&fit=crop&q=80`;

export const IMAGES = {
  /** Hero — choir / singers. */
  heroChoir: u("photo-1517457373958-b7bdd4587205"),
  /** Secondary hero — sheet music / piano. */
  sheetMusic: u("photo-1507838153414-b4b713384a76"),
  /** Cathedral / chapel interior. */
  cathedralInterior: u("photo-1548276145-69a9521f0499"),
  /** Pews and vaulted ceiling. */
  pews: u("photo-1438232992991-995b7058bbb3"),
  /** Organ pipes. */
  organPipes: u("photo-1465225314224-587cd83d322b"),
  /** Candles / votive lights. */
  candles: u("photo-1519892300165-cb5542fb47c7"),
  /** Conducting hands. */
  conductor: u("photo-1465847899084-d164df4dedc6"),
  /** Microphone / soloist. */
  microphone: u("photo-1493225457124-a3eb161ffa5f"),
  /** Hymn book close-up. */
  hymnBook: u("photo-1481627834876-b7833e8f5570"),
} as const;

export type ImageKey = keyof typeof IMAGES;

/** Photos used in the homepage gallery preview strip. */
export const GALLERY_PREVIEW: { src: string; alt: string }[] = [
  { src: "/gallery/pic-1.avif", alt: "Praise and dance" },
  { src: "/gallery/pic-2.avif", alt: "Exploring music traditions" },
  { src: "/gallery/pic-3.avif", alt: "Eucharistic celebration" },
  { src: "/gallery/pic-4.avif", alt: "Choir moment" },
  { src: "/gallery/pic-5.avif", alt: "Choir moment" },
];

/** Slides used in the homepage hero carousel. */
export const HERO_CAROUSEL: {
  src: string;
  alt: string;
  kicker?: string;
  title?: string;
}[] = [
  {
    src: "/gallery/pic-1.avif",
    alt: "Choir in praise and dance",
    kicker: "Join us in",
    title: "Praise and Dance",
  },
  {
    src: "/gallery/pic-2.avif",
    alt: "Choir exploring different musical traditions",
    kicker: "Explore & learn music…",
    title: "Classical, African, you name it!",
  },
  {
    src: "/gallery/pic-3.avif",
    alt: "The Eucharistic celebration",
    kicker: "Our core",
    title: "Eucharistic Celebration",
  },
  { src: "/gallery/pic-4.avif", alt: "St. Paul's Chapel Community Choir" },
  { src: "/gallery/pic-5.avif", alt: "St. Paul's Chapel Community Choir" },
];
