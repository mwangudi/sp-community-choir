/**
 * Repertoire — searchable index over the choir's Google Drive
 * MIDI / score database.
 *
 * Google Drive remains the source of truth for the actual files.
 * Each entry here records metadata so we can search by title /
 * composer / language, filter by season + Mass part, and surface
 * songs that fit the upcoming Sunday's liturgy.
 *
 * To add a song: drop a new entry below and (optionally) paste the
 * folder ID from its Drive URL. To get the folder ID, open the song
 * folder in Drive — the URL ends with `/folders/<ID>`.
 */

import type { LectionaryYear, LiturgicalSeason } from "./liturgical";

// ----- types -----

export type MassPart =
  | "Entrance"
  | "Penitential"
  | "Gloria"
  | "Psalm"
  | "Acclamation"
  | "Offertory"
  | "Sanctus"
  | "MysteryOfFaith"
  | "Amen"
  | "OurFather"
  | "AgnusDei"
  | "Communion"
  | "Thanksgiving"
  | "Recessional";

export type SongTheme =
  | "Praise"
  | "Adoration"
  | "Thanksgiving"
  | "Petition"
  | "Marian"
  | "Eucharist"
  | "Cross"
  | "Resurrection"
  | "HolySpirit"
  | "Trinity"
  | "Kingship"
  | "Mission"
  | "Penitence"
  | "Hope"
  | "Funeral"
  | "Wedding";

export type SongLanguage = "English" | "Swahili" | "Latin" | "Malagasy" | "Other";

/**
 * Rights status of the score/MIDI files. Anything other than PublicDomain is
 * only linked for signed-in members.
 */
export type SongCopyright =
  | "PublicDomain"
  | "Licensed"
  | "Copyrighted"
  | "Unknown";

export type Song = {
  slug: string;
  title: string;
  /** Alternative titles or first lines for search. */
  aliases?: string[];
  language: SongLanguage;
  composer?: string;
  arranger?: string;
  /** SATB, unison, etc. */
  voicing?: string;
  /** Key signature if known. */
  key?: string;
  /** Seasons in which this song is appropriate. */
  seasons: LiturgicalSeason[];
  /** Specific Mass parts the song serves. */
  massParts: MassPart[];
  /** Specific Sunday slugs (e.g. "easter-5", "palm-sunday"). */
  sundays?: string[];
  /** Specific feast keys (e.g. "pentecost", "corpus-christi"). */
  feasts?: string[];
  /** Lectionary cycles where this is especially suited. */
  lectionaryYears?: LectionaryYear[];
  /** Themes / topics. */
  themes: SongTheme[];
  /** Scripture references this draws on. */
  scripture?: string[];
  /** Drive folder ID (the part after `/folders/` in the URL). */
  driveFolderId?: string;
  /** Rights status — defaults to Unknown until someone confirms it. */
  copyright?: SongCopyright;
  /** Composer, publisher or estate holding the rights. */
  rightsHolder?: string;
  /** Licence reference, e.g. a OneLicense/CCLI number. */
  licenceRef?: string;
  /** Free-form notes — voicing tips, when last sung, etc. */
  notes?: string;
};

// ----- config -----

/**
 * Parent Drive folder containing all song subfolders.
 * Replace with the real `/folders/<ID>` link when ready.
 */
export const DRIVE_DATABASE_URL =
  "https://drive.google.com/drive/folders/1-rl5e14iJ2atYy7XwIcu2eT1zeLGirMa";

/** Build a Drive link for a song. Falls back to the database root. */
export function songDriveUrl(song: Song): string {
  if (song.driveFolderId) {
    return `https://drive.google.com/drive/folders/${song.driveFolderId}`;
  }
  return DRIVE_DATABASE_URL;
}

export function songCopyright(song: Song): SongCopyright {
  return song.copyright ?? "Unknown";
}

/** Public visitors only see files for works confirmed as public domain. */
export function isScorePublic(song: Song): boolean {
  return songCopyright(song) === "PublicDomain";
}

// ----- seed catalogue -----
// Bootstrapped from the first screen of the Drive listing.
// Replace `driveFolderId` placeholders with the real folder IDs
// when convenient.

export const SONGS: Song[] = [
  {
    slug: "a-mighty-fortress",
    title: "A Mighty Fortress Is Our God",
    aliases: ["Ein feste Burg"],
    language: "English",
    composer: "Martin Luther",
    voicing: "SATB",
    seasons: ["OrdinaryTime", "Lent"],
    massParts: ["Entrance", "Recessional"],
    themes: ["Praise", "Hope", "Petition"],
    scripture: ["Psalm 46"],
  },
  {
    slug: "a-new-commandment",
    title: "A New Commandment",
    aliases: ["Mandatum novum"],
    language: "English",
    seasons: ["Lent", "Triduum", "OrdinaryTime"],
    massParts: ["Communion", "Offertory"],
    feasts: ["holy-thursday"],
    themes: ["Eucharist"],
    scripture: ["John 13:34"],
  },
  {
    slug: "a-thousand-tongues",
    title: "O for a Thousand Tongues to Sing",
    aliases: ["A Thousand Tongues"],
    language: "English",
    composer: "Charles Wesley",
    seasons: ["OrdinaryTime", "Easter"],
    massParts: ["Entrance", "Recessional"],
    themes: ["Praise", "Mission"],
  },
  {
    slug: "abide-with-me",
    title: "Abide With Me",
    language: "English",
    composer: "Henry F. Lyte",
    seasons: ["Lent", "OrdinaryTime"],
    massParts: ["Communion", "Recessional"],
    themes: ["Petition", "Funeral", "Hope"],
  },
  {
    slug: "aleluya-fourfold",
    title: "Aleluya FourFold",
    aliases: ["Alleluia FourFold"],
    language: "English",
    seasons: ["Easter", "OrdinaryTime"],
    massParts: ["Acclamation"],
    themes: ["Resurrection", "Praise"],
  },
  {
    slug: "aleluya-malgache",
    title: "Aleluya Malgache",
    aliases: ["Malagasy Alleluia"],
    language: "Malagasy",
    seasons: ["OrdinaryTime", "Easter"],
    massParts: ["Acclamation"],
    themes: ["Praise"],
  },
  {
    slug: "aleluya-tumwabudu",
    title: "Aleluya, Tumwabudu Yesu Kristu",
    aliases: ["Tumwabudu Yesu Kristu"],
    language: "Swahili",
    seasons: ["Easter", "OrdinaryTime"],
    massParts: ["Acclamation"],
    themes: ["Resurrection", "Adoration"],
  },
  {
    slug: "alhamisi-kuu",
    title: "Alhamisi Kuu",
    aliases: ["Holy Thursday (Swahili)"],
    language: "Swahili",
    seasons: ["Triduum"],
    massParts: ["Entrance", "Communion"],
    feasts: ["holy-thursday"],
    themes: ["Eucharist"],
  },
  {
    slug: "all-creatures-of-our-god-and-king",
    title: "All Creatures of Our God and King",
    language: "English",
    composer: "Lasst uns erfreuen",
    seasons: ["Easter", "OrdinaryTime"],
    massParts: ["Entrance", "Recessional"],
    themes: ["Praise", "Thanksgiving"],
    scripture: ["Canticle of the Sun"],
  },
  {
    slug: "all-glory-laud-and-honor",
    title: "All Glory, Laud and Honour",
    language: "English",
    composer: "Theodulph of Orléans",
    seasons: ["Lent"],
    massParts: ["Entrance"],
    sundays: ["palm-sunday"],
    feasts: ["palm-sunday"],
    themes: ["Kingship"],
  },
  {
    slug: "all-hail-the-power",
    title: "All Hail the Power of Jesus' Name",
    language: "English",
    composer: "Edward Perronet",
    seasons: ["OrdinaryTime", "Easter"],
    massParts: ["Entrance", "Recessional"],
    feasts: ["christ-the-king"],
    themes: ["Kingship", "Praise"],
  },
  {
    slug: "all-people-that-on-earth",
    title: "All People That on Earth Do Dwell",
    aliases: ["Old 100th"],
    language: "English",
    composer: "Louis Bourgeois",
    seasons: ["OrdinaryTime"],
    massParts: ["Entrance", "Thanksgiving"],
    themes: ["Praise", "Thanksgiving"],
    scripture: ["Psalm 100"],
  },
  {
    slug: "all-the-earth-proclaim-the-lord",
    title: "All the Earth Proclaim the Lord",
    language: "English",
    seasons: ["OrdinaryTime", "Easter"],
    massParts: ["Entrance", "Psalm"],
    themes: ["Mission", "Praise"],
    scripture: ["Psalm 100"],
  },
  {
    slug: "alleluia-sing-to-jesus",
    title: "Alleluia! Sing to Jesus",
    language: "English",
    composer: "William Chatterton Dix",
    seasons: ["Easter", "OrdinaryTime"],
    massParts: ["Communion", "Recessional"],
    feasts: ["corpus-christi", "ascension", "christ-the-king"],
    themes: ["Eucharist", "Kingship", "Resurrection"],
  },
  {
    slug: "amazing-grace",
    title: "Amazing Grace",
    language: "English",
    composer: "John Newton",
    seasons: ["Lent", "OrdinaryTime"],
    massParts: ["Communion", "Recessional"],
    themes: ["Penitence", "Thanksgiving", "Funeral"],
  },
  {
    slug: "ave-maria",
    title: "Ave Maria",
    language: "Latin",
    composer: "Franz Schubert",
    seasons: ["Advent", "OrdinaryTime"],
    massParts: ["Communion", "Offertory"],
    feasts: ["mary-mother-of-god"],
    themes: ["Marian"],
    scripture: ["Luke 1:28"],
  },
  {
    slug: "panis-angelicus",
    title: "Panis Angelicus",
    language: "Latin",
    composer: "César Franck",
    seasons: ["OrdinaryTime", "Easter"],
    massParts: ["Communion"],
    feasts: ["corpus-christi"],
    themes: ["Eucharist", "Adoration"],
  },
  {
    slug: "veni-creator-spiritus",
    title: "Veni Creator Spiritus",
    language: "Latin",
    seasons: ["Easter", "OrdinaryTime"],
    massParts: ["Entrance"],
    feasts: ["pentecost"],
    themes: ["HolySpirit"],
  },
];

// ----- lookups -----

export function findSong(slug: string): Song | undefined {
  return SONGS.find((s) => s.slug === slug);
}

export const ALL_LANGUAGES: SongLanguage[] = [
  "English",
  "Swahili",
  "Latin",
  "Malagasy",
  "Other",
];

export const ALL_SEASONS: LiturgicalSeason[] = [
  "Advent",
  "Christmas",
  "Lent",
  "Triduum",
  "Easter",
  "OrdinaryTime",
];

export const ALL_MASS_PARTS: MassPart[] = [
  "Entrance",
  "Penitential",
  "Gloria",
  "Psalm",
  "Acclamation",
  "Offertory",
  "Sanctus",
  "MysteryOfFaith",
  "Amen",
  "OurFather",
  "AgnusDei",
  "Communion",
  "Thanksgiving",
  "Recessional",
];

export type SongFilters = {
  query?: string;
  season?: LiturgicalSeason;
  massPart?: MassPart;
  language?: SongLanguage;
};

export function searchSongs(songs: Song[], filters: SongFilters): Song[] {
  const q = filters.query?.trim().toLowerCase() ?? "";
  return songs.filter((s) => {
    if (filters.season && !s.seasons.includes(filters.season)) return false;
    if (filters.massPart && !s.massParts.includes(filters.massPart)) return false;
    if (filters.language && s.language !== filters.language) return false;
    if (!q) return true;
    const hay = [
      s.title,
      ...(s.aliases ?? []),
      s.composer ?? "",
      s.arranger ?? "",
      s.language,
      ...s.themes,
      ...(s.scripture ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

/**
 * Songs suited to a particular liturgical context (a Sunday).
 * Matches on: feast key > specific Sunday slug > season.
 * Songs targeting the exact feast or Sunday rank highest.
 */
export function songsForSunday(
  ctx: {
    season: LiturgicalSeason;
    slug: string;
    feast?: string;
    year: LectionaryYear;
  },
  songs: Song[] = SONGS,
): Song[] {
  const scored = songs.map((s) => {
    let score = 0;
    if (ctx.feast && s.feasts?.includes(ctx.feast)) score += 100;
    if (s.sundays?.includes(ctx.slug)) score += 80;
    if (s.seasons.includes(ctx.season)) score += 10;
    if (s.lectionaryYears && !s.lectionaryYears.includes(ctx.year)) score -= 5;
    return { song: s, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.song);
}

export function massPartLabel(p: MassPart): string {
  switch (p) {
    case "MysteryOfFaith":
      return "Mystery of Faith";
    case "OurFather":
      return "Our Father";
    case "AgnusDei":
      return "Agnus Dei";
    default:
      return p;
  }
}
