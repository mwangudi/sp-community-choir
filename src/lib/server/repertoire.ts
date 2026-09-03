import "server-only";

import { prisma } from "@/lib/db";
import type { LectionaryYear, LiturgicalSeason } from "@/lib/liturgical";
import {
  SONGS,
  type MassPart,
  type Song,
  type SongCopyright,
  type SongLanguage,
  type SongTheme,
} from "@/lib/songs";
import {
  MASS_PLANS,
  type MassPlan,
  type MassPlanPart,
} from "@/lib/mass-plans";

const LANGUAGES: Record<string, SongLanguage> = {
  ENGLISH: "English",
  SWAHILI: "Swahili",
  LATIN: "Latin",
  MALAGASY: "Malagasy",
  OTHER: "Other",
};

const SEASONS: Record<string, LiturgicalSeason> = {
  ADVENT: "Advent",
  CHRISTMAS: "Christmas",
  ORDINARY_TIME: "OrdinaryTime",
  LENT: "Lent",
  TRIDUUM: "Triduum",
  EASTER: "Easter",
};

const COPYRIGHT: Record<string, SongCopyright> = {
  PUBLIC_DOMAIN: "PublicDomain",
  LICENSED: "Licensed",
  COPYRIGHTED: "Copyrighted",
  UNKNOWN: "Unknown",
};

/** The repertoire browser exposes a narrower set of parts than the Mass plans. */
const SONG_PARTS: Record<string, MassPart> = {
  ENTRANCE: "Entrance",
  PENITENTIAL: "Penitential",
  GLORIA: "Gloria",
  RESPONSORIAL_PSALM: "Psalm",
  GOSPEL_ACCLAMATION: "Acclamation",
  OFFERTORY: "Offertory",
  SANCTUS: "Sanctus",
  MYSTERY_OF_FAITH: "MysteryOfFaith",
  GREAT_AMEN: "Amen",
  OUR_FATHER: "OurFather",
  AGNUS_DEI: "AgnusDei",
  COMMUNION: "Communion",
  THANKSGIVING: "Thanksgiving",
  RECESSIONAL: "Recessional",
};

const PLAN_PARTS: Record<string, MassPlanPart> = {
  ENTRANCE: "Entrance",
  KYRIE: "Kyrie",
  GLORIA: "Gloria",
  GOSPEL_PROCESSION: "Gospel Procession",
  RESPONSORIAL_PSALM: "Responsorial Psalm",
  GOSPEL_ACCLAMATION: "Gospel Acclamation",
  CREED: "Creed",
  OFFERTORY: "Offertory",
  PREPARATION_OF_GIFTS: "Preparation of Gifts",
  SANCTUS: "Sanctus",
  MYSTERY_OF_FAITH: "Mystery of Faith",
  GREAT_AMEN: "Great Amen",
  OUR_FATHER: "Our Father",
  SIGN_OF_PEACE: "Sign of Peace",
  AGNUS_DEI: "Agnus Dei",
  COMMUNION: "Communion",
  ANIMA_CHRISTI: "Anima Christi",
  THANKSGIVING: "Thanksgiving",
  RECESSIONAL: "Recessional",
  MARIAN_HYMN: "Marian Hymn",
};

/** MySQL has no scalar lists, so list fields come back as untyped JSON. */
function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function mapped<T>(value: unknown, table: Record<string, T>): T[] {
  return strings(value)
    .map((v) => table[v])
    .filter((v): v is T => Boolean(v));
}

export async function getSongs(): Promise<Song[]> {
  try {
    const rows = await prisma.song.findMany({
      where: { isActive: true },
      orderBy: { title: "asc" },
    });
    if (rows.length === 0) return SONGS;

    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      aliases: strings(r.aliases),
      language: LANGUAGES[r.language] ?? "Other",
      composer: r.composer ?? undefined,
      arranger: r.arranger ?? undefined,
      voicing: r.voicing ?? undefined,
      key: r.musicalKey ?? undefined,
      seasons: mapped(r.seasons, SEASONS),
      massParts: mapped(r.massParts, SONG_PARTS),
      themes: strings(r.themes) as SongTheme[],
      scripture: strings(r.scripture),
      driveFolderId: r.driveFolderId ?? undefined,
      copyright: COPYRIGHT[r.copyrightStatus] ?? "Unknown",
      rightsHolder: r.rightsHolder ?? undefined,
      licenceRef: r.licenceRef ?? undefined,
      notes: r.notes ?? undefined,
    }));
  } catch {
    return SONGS;
  }
}

/** A single song by slug, from the catalogue the public site is showing. */
export async function findSongBySlug(slug: string): Promise<Song | null> {
  const songs = await getSongs();
  return songs.find((s) => s.slug === slug) ?? null;
}

/** The published plan for a given Sunday, or the bundled snapshot. */
export async function getMassPlan(date: Date): Promise<MassPlan | null> {
  const key = date.toISOString().slice(0, 10);

  try {
    const row = await prisma.massPlan.findFirst({
      where: { date: new Date(`${key}T00:00:00.000Z`), status: "PUBLISHED" },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });

    if (row) {
      return {
        date: key,
        name: row.name,
        year: row.year as LectionaryYear,
        setting: row.setting ?? undefined,
        leader: row.leader ?? undefined,
        items: row.items
          .map((it) => ({ part: PLAN_PARTS[it.part], song: it.song }))
          .filter((it): it is { part: MassPlanPart; song: string } => Boolean(it.part)),
      };
    }
  } catch {
    // Fall through to the bundled snapshot.
  }

  return MASS_PLANS.find((p) => p.date === key) ?? null;
}
