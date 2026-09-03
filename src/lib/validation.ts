import { z } from "zod";

export const MASS_PARTS = [
  "ENTRANCE",
  "PENITENTIAL",
  "KYRIE",
  "GLORIA",
  "RESPONSORIAL_PSALM",
  "GOSPEL_ACCLAMATION",
  "GOSPEL_PROCESSION",
  "CREED",
  "OFFERTORY",
  "PREPARATION_OF_GIFTS",
  "SANCTUS",
  "MYSTERY_OF_FAITH",
  "GREAT_AMEN",
  "OUR_FATHER",
  "SIGN_OF_PEACE",
  "AGNUS_DEI",
  "COMMUNION",
  "ANIMA_CHRISTI",
  "THANKSGIVING",
  "RECESSIONAL",
  "MARIAN_HYMN",
] as const;

export const VOICES = [
  "SOPRANO",
  "ALTO",
  "TENOR",
  "BASS",
  "INSTRUMENTALIST",
  "CONDUCTOR",
  "OTHER",
] as const;

export const SEASONS = [
  "ADVENT",
  "CHRISTMAS",
  "ORDINARY_TIME",
  "LENT",
  "TRIDUUM",
  "EASTER",
] as const;

export const LANGUAGES = ["ENGLISH", "SWAHILI", "LATIN", "MALAGASY", "OTHER"] as const;

export const COPYRIGHT_STATUSES = [
  "PUBLIC_DOMAIN",
  "LICENSED",
  "COPYRIGHTED",
  "UNKNOWN",
] as const;

export const ROLES = ["ADMIN", "TECHNICAL", "MEMBER"] as const;

export const massPartEnum = z.enum(MASS_PARTS);
export const voiceEnum = z.enum(VOICES);
export const seasonEnum = z.enum(SEASONS);
export const languageEnum = z.enum(LANGUAGES);

// ─────────────────────────── Auth ───────────────────────────

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const userCreateSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(10, "Use at least 10 characters"),
  role: z.enum(["ADMIN", "TECHNICAL", "MEMBER"]).default("MEMBER"),
  voice: voiceEnum.optional().nullable(),
});

export const userUpdateSchema = userCreateSchema
  .partial()
  .omit({ password: true })
  .extend({
    password: z.string().min(10).optional().or(z.literal("")),
    isActive: z.boolean().optional(),
  });

// ──────────────────────── Repertoire ────────────────────────

export const songSchema = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only"),
  title: z.string().min(2, "Title is required"),
  language: languageEnum.default("ENGLISH"),
  composer: z.string().optional().nullable(),
  arranger: z.string().optional().nullable(),
  voicing: z.string().optional().nullable(),
  musicalKey: z.string().optional().nullable(),
  aliases: z.array(z.string()).default([]),
  seasons: z.array(seasonEnum).default([]),
  massParts: z.array(massPartEnum).default([]),
  themes: z.array(z.string()).default([]),
  scripture: z.array(z.string()).default([]),
  driveFolderId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

// ───────────────────────── Mass plans ────────────────────────

export const massPlanItemSchema = z.object({
  part: massPartEnum,
  song: z.string().min(1, "Song is required"),
  songSlug: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const massPlanSchema = z.object({
  date: z.coerce.date(),
  name: z.string().min(2, "Name is required"),
  year: z.enum(["A", "B", "C"]),
  season: seasonEnum.optional().nullable(),
  setting: z.string().optional().nullable(),
  leader: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  items: z.array(massPlanItemSchema).default([]),
});

// ─────────────────────── Song proposals ──────────────────────

export const proposalSchema = z.object({
  sundayDate: z.coerce.date(),
  sundayName: z.string().min(2),
  lectionaryYear: z.enum(["A", "B", "C"]).optional().nullable(),
  proposerName: z.string().min(2, "Your name is required"),
  proposerEmail: z.email().optional().or(z.literal("")).nullable(),
  voice: voiceEnum.optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
  items: z
    .array(
      z.object({
        part: massPartEnum,
        song: z.string().min(1),
        sortOrder: z.number().int().default(0),
      }),
    )
    .min(1, "Propose at least one song"),
});

export const proposalReviewSchema = z.object({
  status: z.enum(["PENDING", "REVIEWED", "ACCEPTED", "DECLINED"]),
  reviewerNote: z.string().max(2000).optional().nullable(),
});

// ───────────────────────── Concerts ──────────────────────────

export const concertSchema = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only"),
  title: z.string().min(2, "Title is required"),
  startsAt: z.coerce.date(),
  venue: z.string().min(2, "Venue is required"),
  blurb: z.string().min(2, "Blurb is required"),
  description: z.array(z.string()).default([]),
  poster: z.string().optional().nullable(),
  pinned: z.boolean().default(false),
  ctaLabel: z.string().optional().nullable(),
  ctaHref: z.string().optional().nullable(),
  isPublished: z.boolean().default(true),
});

// ────────────────────────── Gallery ──────────────────────────

export const galleryItemSchema = z
  .object({
    slug: z.string().min(2),
    kind: z.enum(["PHOTO", "VIDEO"]),
    src: z.string().optional().nullable(),
    youtubeId: z
      .string()
      .regex(/^[A-Za-z0-9_-]{11}$/, "A YouTube id is 11 characters")
      .optional()
      .nullable(),
    title: z.string().optional().nullable(),
    alt: z.string().optional().nullable(),
    caption: z.string().optional().nullable(),
    takenOn: z.coerce.date().optional().nullable(),
    tags: z.array(z.string()).default([]),
    sortOrder: z.number().int().default(0),
    isPublished: z.boolean().default(true),
  })
  .refine((v) => (v.kind === "PHOTO" ? !!v.src : !!v.youtubeId), {
    message: "Photos need a file path; videos need a YouTube id",
    path: ["src"],
  });

// ─────────────────── Members & applications ──────────────────

export const memberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email().optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  voice: voiceEnum.optional().nullable(),
  jumuiya: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  joinedOn: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const joinApplicationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Enter a valid email address"),
  phone: z.string().optional().nullable(),
  voice: voiceEnum.optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  message: z.string().max(2000).optional().nullable(),
});

export const applicationStatusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "ACCEPTED", "DECLINED"]),
});

// ──────────────────────── Site feedback ──────────────────────

export const feedbackSchema = z.object({
  name: z.string().max(120).optional().nullable(),
  email: z.email().optional().or(z.literal("")).nullable(),
  page: z.string().max(200).optional().nullable(),
  message: z.string().min(2, "Message is required").max(4000),
});
