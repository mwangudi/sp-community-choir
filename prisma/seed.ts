import { randomBytes } from "node:crypto";
import { PrismaClient, type MassPart, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SONGS } from "../src/lib/songs";
import { MASS_PLANS } from "../src/lib/mass-plans";
import { CHOIR, CONCERTS } from "../src/lib/choir";
import { GALLERY_ITEMS } from "../src/lib/gallery";

const prisma = new PrismaClient();

const LANGUAGE = {
  English: "ENGLISH",
  Swahili: "SWAHILI",
  Latin: "LATIN",
  Malagasy: "MALAGASY",
  Other: "OTHER",
} as const;

const SEASON = {
  Advent: "ADVENT",
  Christmas: "CHRISTMAS",
  OrdinaryTime: "ORDINARY_TIME",
  Lent: "LENT",
  Triduum: "TRIDUUM",
  Easter: "EASTER",
} as const;

/** songs.ts MassPart → schema MassPart */
const SONG_PART: Record<string, MassPart> = {
  Entrance: "ENTRANCE",
  Penitential: "PENITENTIAL",
  Gloria: "GLORIA",
  Psalm: "RESPONSORIAL_PSALM",
  Acclamation: "GOSPEL_ACCLAMATION",
  Offertory: "OFFERTORY",
  Sanctus: "SANCTUS",
  MysteryOfFaith: "MYSTERY_OF_FAITH",
  Amen: "GREAT_AMEN",
  OurFather: "OUR_FATHER",
  AgnusDei: "AGNUS_DEI",
  Communion: "COMMUNION",
  Thanksgiving: "THANKSGIVING",
  Recessional: "RECESSIONAL",
};

/** mass-plans.ts MassPlanPart → schema MassPart */
function planPart(part: string): MassPart {
  return part.toUpperCase().replaceAll(" ", "_") as MassPart;
}

async function seedAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? CHOIR.email).toLowerCase();
  const generated = !process.env.SEED_ADMIN_PASSWORD;
  const password = process.env.SEED_ADMIN_PASSWORD ?? randomBytes(9).toString("base64url");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    // Only reset an existing password when one was supplied explicitly.
    update: generated ? {} : { passwordHash, isActive: true },
    create: { email, name: "Choir Administrator", role: "ADMIN", passwordHash },
  });

  console.log(`  admin: ${user.email}`);
  if (generated) {
    console.log(`  password (shown once): ${password}`);
    console.log("  → sign in and change it, or set SEED_ADMIN_PASSWORD before seeding");
  }
  return user;
}

async function seedSongs() {
  for (const song of SONGS) {
    const data = {
      title: song.title,
      language: LANGUAGE[song.language] ?? "OTHER",
      composer: song.composer ?? null,
      arranger: song.arranger ?? null,
      voicing: song.voicing ?? null,
      musicalKey: song.key ?? null,
      aliases: (song.aliases ?? []) as Prisma.InputJsonValue,
      seasons: song.seasons.map((s) => SEASON[s]) as Prisma.InputJsonValue,
      massParts: song.massParts
        .map((p) => SONG_PART[p])
        .filter(Boolean) as Prisma.InputJsonValue,
      themes: (song.themes ?? []) as Prisma.InputJsonValue,
      scripture: (song.scripture ?? []) as Prisma.InputJsonValue,
      driveFolderId: song.driveFolderId ?? null,
      notes: song.notes ?? null,
    };
    await prisma.song.upsert({
      where: { slug: song.slug },
      update: data,
      create: { slug: song.slug, ...data },
    });
  }
  console.log(`  songs: ${SONGS.length}`);
}

async function seedMassPlans(createdById: string) {
  for (const plan of MASS_PLANS) {
    const date = new Date(`${plan.date}T00:00:00Z`);
    const existing = await prisma.massPlan.findUnique({ where: { date } });
    if (existing) {
      await prisma.massPlanItem.deleteMany({ where: { planId: existing.id } });
    }

    const items = plan.items.map((item, i) => ({
      part: planPart(item.part),
      song: item.song,
      sortOrder: i,
    }));

    await prisma.massPlan.upsert({
      where: { date },
      update: {
        name: plan.name,
        year: plan.year,
        setting: plan.setting ?? null,
        leader: plan.leader ?? null,
        status: "PUBLISHED",
        items: { create: items },
      },
      create: {
        date,
        name: plan.name,
        year: plan.year,
        setting: plan.setting ?? null,
        leader: plan.leader ?? null,
        status: "PUBLISHED",
        createdById,
        items: { create: items },
      },
    });
  }
  console.log(`  mass plans: ${MASS_PLANS.length}`);
}

async function seedConcerts() {
  for (const c of CONCERTS) {
    const data = {
      title: c.title,
      startsAt: new Date(c.startsAt),
      venue: c.venue,
      blurb: c.blurb,
      description: (c.description ?? []) as Prisma.InputJsonValue,
      poster: c.poster ?? null,
      pinned: c.pinned ?? false,
      ctaLabel: c.ctaLabel ?? null,
      ctaHref: c.ctaHref ?? null,
    };
    await prisma.concert.upsert({
      where: { slug: c.slug },
      update: data,
      create: { slug: c.slug, ...data },
    });
  }
  console.log(`  concerts: ${CONCERTS.length}`);
}

async function seedGallery() {
  let order = 0;
  for (const item of GALLERY_ITEMS) {
    const shared = {
      caption: item.caption ?? null,
      takenOn: item.date ? new Date(`${item.date}T00:00:00Z`) : null,
      tags: (item.tags ?? []) as Prisma.InputJsonValue,
      sortOrder: order++,
    };
    const data =
      item.kind === "photo"
        ? { kind: "PHOTO" as const, src: item.src, alt: item.alt, title: null, youtubeId: null, ...shared }
        : { kind: "VIDEO" as const, youtubeId: item.youtubeId, title: item.title, src: null, alt: null, ...shared };

    await prisma.galleryItem.upsert({
      where: { slug: item.slug },
      update: data,
      create: { slug: item.slug, ...data },
    });
  }
  console.log(`  gallery items: ${GALLERY_ITEMS.length}`);
}

async function main() {
  console.log("Seeding St. Paul's Community Choir database…");
  const admin = await seedAdmin();
  await seedSongs();
  await seedMassPlans(admin.id);
  await seedConcerts();
  await seedGallery();
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
