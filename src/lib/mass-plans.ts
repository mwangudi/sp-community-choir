/**
 * Sunday Mass plans — the choir's curated order of service.
 *
 * Seeded from the parish "Liturgical Selections" worksheet
 * (docs/Liturgical Selections St. Pauls Chapel Community Choir.xlsx).
 * Each plan lists, in liturgical order, the song chosen for every part
 * of the Mass for a given Sunday, plus the Mass Ordinary setting and the
 * music leader where recorded.
 *
 * The worksheet remains the source of truth; this file is a typed
 * snapshot of the upcoming Sundays. To add Sundays, append entries with
 * the Sunday's ISO date as the key.
 */

import type { LectionaryYear } from "./liturgical";

export type MassPlanPart =
  | "Entrance"
  | "Kyrie"
  | "Gloria"
  | "Gospel Procession"
  | "Responsorial Psalm"
  | "Gospel Acclamation"
  | "Creed"
  | "Offertory"
  | "Preparation of Gifts"
  | "Sanctus"
  | "Mystery of Faith"
  | "Great Amen"
  | "Our Father"
  | "Sign of Peace"
  | "Agnus Dei"
  | "Communion"
  | "Anima Christi"
  | "Thanksgiving"
  | "Recessional"
  | "Marian Hymn";

export type MassPlanItem = {
  part: MassPlanPart;
  /** Song title exactly as recorded by the choir (may be Swahili, Latin, etc.). */
  song: string;
};

export type MassPlan = {
  /** ISO date (YYYY-MM-DD) of the Sunday this plan serves. */
  date: string;
  /** Label from the worksheet, e.g. "13 Sun OT". */
  name: string;
  /** Lectionary cycle. */
  year: LectionaryYear;
  /** Mass Ordinary setting, when one setting covers Kyrie/Gloria/Sanctus/Agnus. */
  setting?: string;
  /** Music leader / conductor for the day, when recorded. */
  leader?: string;
  /** Order of service, top to bottom. */
  items: MassPlanItem[];
};

/** Canonical liturgical order of the parts (for display + sorting). */
export const MASS_PLAN_PART_ORDER: MassPlanPart[] = [
  "Entrance",
  "Kyrie",
  "Gloria",
  "Gospel Procession",
  "Responsorial Psalm",
  "Gospel Acclamation",
  "Creed",
  "Offertory",
  "Preparation of Gifts",
  "Sanctus",
  "Mystery of Faith",
  "Great Amen",
  "Our Father",
  "Sign of Peace",
  "Agnus Dei",
  "Communion",
  "Anima Christi",
  "Thanksgiving",
  "Recessional",
  "Marian Hymn",
];

export function massPlanOrder(part: MassPlanPart): number {
  const i = MASS_PLAN_PART_ORDER.indexOf(part);
  return i === -1 ? MASS_PLAN_PART_ORDER.length : i;
}

export const MASS_PLANS: MassPlan[] = [
  {
    date: "2026-06-28",
    name: "13 Sun OT",
    year: "A",
    setting: "Holy Spirit Mass",
    leader: "Wagaki Ndung'u",
    items: [
      { part: "Entrance", song: "Alfajiri ya kupendeza" },
      { part: "Kyrie", song: "Holy Spirit Mass" },
      { part: "Gloria", song: "Holy Spirit Mass" },
      { part: "Gospel Procession", song: "Nina Neno" },
      { part: "Gospel Acclamation", song: "Kitoro" },
      { part: "Offertory", song: "Heri hao" },
      { part: "Offertory", song: "Mimi ninakuja" },
      { part: "Preparation of Gifts", song: "Let us break bread" },
      { part: "Sanctus", song: "Holy Spirit Mass" },
      { part: "Mystery of Faith", song: "Holy Spirit Mass" },
      { part: "Great Amen", song: "Holy Spirit Mass" },
      { part: "Our Father", song: "Recited" },
      { part: "Sign of Peace", song: "Omorembe" },
      { part: "Agnus Dei", song: "Holy Spirit Mass" },
      { part: "Communion", song: "Ave verum Mozart" },
      { part: "Communion", song: "Abide with me" },
      { part: "Anima Christi", song: "Frisina" },
      { part: "Thanksgiving", song: "Zaeni matunda mema" },
      { part: "Recessional", song: "Love divine" },
      { part: "Marian Hymn", song: "Kumbuka" },
    ],
  },
  {
    date: "2026-07-05",
    name: "14 Sun OT",
    year: "A",
    setting: "Misa Paulo",
    leader: "Joyce Mwangi",
    items: [
      { part: "Entrance", song: "Nyumbani mwa Bwana twende sote kwa shangwe" },
      { part: "Kyrie", song: "Misa Paulo" },
      { part: "Gloria", song: "Misa Paulo" },
      { part: "Gospel Procession", song: "Vanga Yohanna vasaina" },
      { part: "Gospel Acclamation", song: "Misa Paulo" },
      { part: "Offertory", song: "Uipokee" },
      { part: "Offertory", song: "Bino bianwa biefwe" },
      { part: "Preparation of Gifts", song: "In bread we bring you Lord" },
      { part: "Sanctus", song: "Misa Paulo" },
      { part: "Mystery of Faith", song: "Misa Paulo" },
      { part: "Great Amen", song: "Misa Paulo" },
      { part: "Sign of Peace", song: "Omorembe" },
      { part: "Agnus Dei", song: "Misa Paulo" },
      { part: "Communion", song: "Eukaristia ni chakula" },
      { part: "Communion", song: "My Jesus I love thee" },
      { part: "Anima Christi", song: "Recited" },
      { part: "Thanksgiving", song: "Niemonja pendo lako" },
      { part: "Recessional", song: "Go the Mass is ended" },
      { part: "Marian Hymn", song: "Ewe Malkia" },
    ],
  },
  {
    date: "2026-07-12",
    name: "15 Sun OT",
    year: "A",
    leader: "Immaculate Muthoni",
    items: [
      { part: "Entrance", song: "Twende sote nyumbani mwake" },
      { part: "Kyrie", song: "Amecea Mass" },
      { part: "Gloria", song: "Amecea Mass" },
      { part: "Gospel Procession", song: "Inasonga Mbele Injili" },
      { part: "Gospel Acclamation", song: "Alleluya nkembo na yahweh" },
      {
        part: "Offertory",
        song: "Nikupe nini Mungu wangu/Nikupe nini Mungu wangu(mashup)",
      },
      { part: "Offertory", song: "Yamba yamba Yahweh" },
      { part: "Preparation of Gifts", song: "Sala yangu na ipae" },
      { part: "Sanctus", song: "Our Lady of Mercy" },
      { part: "Mystery of Faith", song: "Our Lady of Mercy" },
      { part: "Great Amen", song: "Amecea Mass" },
      { part: "Our Father", song: "Recited" },
      { part: "Sign of Peace", song: "Tutakiane Amani" },
      { part: "Agnus Dei", song: "Missa Paulo" },
      { part: "Communion", song: "Nasikia Yesu waniita" },
      { part: "Communion", song: "Jesus My Lord, My God" },
      { part: "Anima Christi", song: "Recited" },
      { part: "Recessional", song: "Nimeahidi Yesu" },
      { part: "Marian Hymn", song: "Losako Mama mbote" },
    ],
  },
  {
    date: "2026-07-19",
    name: "16 Sun OT",
    year: "A",
    leader: "Petronilla Mwelu",
    items: [
      { part: "Entrance", song: "Nalifurahi Waliponiambia" },
      { part: "Kyrie", song: "Our Lady of Mercy Mass" },
      { part: "Gloria", song: "Our Lady of Mercy Mass" },
      { part: "Gospel Procession", song: "Nimtume Nani" },
      { part: "Gospel Acclamation", song: "Mimi Ninasikia" },
      { part: "Offertory", song: "Bringing in the sheaves" },
      { part: "Offertory", song: "Ndipereka" },
      { part: "Preparation of Gifts", song: "Blest are you lord" },
      { part: "Sanctus", song: "Our Lady of Mercy" },
      { part: "Great Amen", song: "Masithi" },
      { part: "Our Father", song: "Recited" },
      { part: "Sign of Peace", song: "Mulungu ni Mudzo" },
      { part: "Agnus Dei", song: "Fr. Kayetta" },
      { part: "Communion", song: "Kama Ayala" },
      { part: "Communion", song: "I need thee every hour" },
      { part: "Anima Christi", song: "Roho ya Yesu" },
      { part: "Thanksgiving", song: "Mimina" },
      { part: "Recessional", song: "Zaeni Matunda" },
      { part: "Marian Hymn", song: "Tambwisa Ngai" },
    ],
  },
];

/** Local YYYY-MM-DD key for a Date (no UTC shift). */
function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** The curated Mass plan for an exact Sunday date, if one exists. */
export function massPlanForDate(date: Date): MassPlan | undefined {
  const key = dateKey(date);
  return MASS_PLANS.find((p) => p.date === key);
}

/** Items sorted into canonical liturgical order. */
export function orderedItems(plan: MassPlan): MassPlanItem[] {
  return [...plan.items].sort(
    (a, b) => massPlanOrder(a.part) - massPlanOrder(b.part),
  );
}
