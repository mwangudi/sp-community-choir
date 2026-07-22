/**
 * Roman Catholic liturgical calendar utilities.
 *
 * Computes the season, Sunday name and lectionary year (A/B/C) for any
 * date. Used by the repertoire page to surface "songs for this Sunday".
 *
 * Calendar follows the General Roman Calendar with Kenyan adaptations:
 *   - Epiphany transferred to the Sunday between Jan 2-8.
 *   - Baptism of the Lord on the following Sunday (Jan 9-13).
 *   - Corpus Christi transferred to the Sunday after Trinity.
 *   - Ascension on its proper Thursday (40 days after Easter); the
 *     following Sunday remains the 7th Sunday of Easter.
 */

export type LiturgicalSeason =
  | "Advent"
  | "Christmas"
  | "OrdinaryTime"
  | "Lent"
  | "Triduum"
  | "Easter";

export type LectionaryYear = "A" | "B" | "C";

export type LiturgicalColor =
  | "violet"
  | "white"
  | "green"
  | "red"
  | "rose"
  | "gold";

export type LiturgicalContext = {
  /** The Sunday this context describes (always a Sunday, midnight local). */
  date: Date;
  /** Macro season the Sunday belongs to. */
  season: LiturgicalSeason;
  /** Human label, e.g. "5th Sunday of Easter" or "Christ the King". */
  name: string;
  /** Short slug, e.g. "easter-5", "ot-11", "advent-2", "trinity". */
  slug: string;
  /** Sunday number within season where applicable (1-7 Easter, 1-4 Advent, 2-34 OT, 1-5 Lent). */
  weekNumber?: number;
  /** A/B/C lectionary cycle for Sundays. */
  year: LectionaryYear;
  /** Liturgical colour (best-fit). */
  color: LiturgicalColor;
  /** If the Sunday is replaced by a major feast/solemnity, the feast key. */
  feast?: string;
};

// ---------- date helpers ----------

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function weeksBetween(earlier: Date, later: Date): number {
  return Math.round((later.getTime() - earlier.getTime()) / (7 * 86_400_000));
}

/** Sunday on or after `date` (if `date` is Sunday, returns `date`). */
export function nextOrCurrentSunday(date: Date): Date {
  const d = startOfDay(date);
  const offset = (7 - d.getDay()) % 7;
  return addDays(d, offset);
}

// ---------- moveable feasts ----------

/** Gregorian Easter Sunday (Meeus / Jones / Butcher). */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return startOfDay(new Date(year, month - 1, day));
}

/** First Sunday of Advent for the liturgical year that BEGINS in this calendar year. */
export function firstSundayOfAdvent(year: number): Date {
  const christmas = startOfDay(new Date(year, 11, 25));
  // Walk back to the previous Sunday, then back 3 more weeks.
  const sundayBeforeChristmas = addDays(
    christmas,
    -((christmas.getDay() + 7) % 7 || 7),
  );
  return addDays(sundayBeforeChristmas, -21);
}

/** Baptism of the Lord — first Sunday on or after Jan 7. */
export function baptismOfTheLord(year: number): Date {
  const jan7 = startOfDay(new Date(year, 0, 7));
  return nextOrCurrentSunday(jan7);
}

/** Ash Wednesday = Easter − 46 days. */
export function ashWednesday(year: number): Date {
  return addDays(easterSunday(year), -46);
}

export function palmSunday(year: number): Date {
  return addDays(easterSunday(year), -7);
}

export function pentecost(year: number): Date {
  return addDays(easterSunday(year), 49);
}

export function trinitySunday(year: number): Date {
  return addDays(easterSunday(year), 56);
}

export function corpusChristiSunday(year: number): Date {
  // Transferred to the Sunday after Trinity in Kenya.
  return addDays(easterSunday(year), 63);
}

export function christTheKing(year: number): Date {
  return addDays(firstSundayOfAdvent(year), -7);
}

// ---------- lectionary year ----------

/** Calendar year in which the active liturgical year began (its Advent). */
export function liturgicalYearStart(date: Date): number {
  const y = date.getFullYear();
  const advent = firstSundayOfAdvent(y);
  return date >= advent ? y : y - 1;
}

/** A / B / C for Sundays. */
export function lectionaryYear(date: Date): LectionaryYear {
  const y = liturgicalYearStart(date);
  const m = ((y % 3) + 3) % 3;
  return m === 0 ? "A" : m === 1 ? "B" : "C";
}

// ---------- main lookup ----------

/**
 * Build the liturgical context for the upcoming Sunday on/after `from`.
 * Always returns a Sunday (never a weekday).
 */
export function liturgicalContext(from: Date = new Date()): LiturgicalContext {
  const sunday = nextOrCurrentSunday(from);
  const y = sunday.getFullYear();
  const year = lectionaryYear(sunday);

  // ----- Advent (current calendar year, runs Advent 1 .. Dec 24) -----
  const advent1ThisYear = firstSundayOfAdvent(y);
  const christmasEve = startOfDay(new Date(y, 11, 24));
  if (sunday >= advent1ThisYear && sunday <= christmasEve) {
    const w = weeksBetween(advent1ThisYear, sunday) + 1; // 1..4
    return {
      date: sunday,
      season: "Advent",
      name: `${ordinal(w)} Sunday of Advent`,
      slug: `advent-${w}`,
      weekNumber: w,
      year,
      color: w === 3 ? "rose" : "violet",
    };
  }

  // ----- Christmas season (late Dec of current year) -----
  const christmasDay = startOfDay(new Date(y, 11, 25));
  if (sunday >= christmasDay) {
    // Sunday within the octave of Christmas = Holy Family
    // (unless it's Christmas Day itself).
    if (sameDay(sunday, christmasDay)) {
      return {
        date: sunday,
        season: "Christmas",
        name: "Nativity of the Lord (Christmas Day)",
        slug: "christmas-day",
        year,
        color: "white",
        feast: "christmas",
      };
    }
    return {
      date: sunday,
      season: "Christmas",
      name: "Holy Family of Jesus, Mary and Joseph",
      slug: "holy-family",
      year,
      color: "white",
      feast: "holy-family",
    };
  }

  // ----- Christmas season (current calendar year up to Baptism) -----
  const baptism = baptismOfTheLord(y);
  if (sunday <= baptism) {
    // Christmas Day, Holy Family, Mary Mother of God, Epiphany, Baptism.
    // Epiphany = Sunday Jan 2..8.
    const epiphany = nextOrCurrentSunday(startOfDay(new Date(y, 0, 2)));
    if (sameDay(sunday, baptism)) {
      return {
        date: sunday,
        season: "Christmas",
        name: "Baptism of the Lord",
        slug: "baptism-of-the-lord",
        year,
        color: "white",
        feast: "baptism-of-the-lord",
      };
    }
    if (sameDay(sunday, epiphany)) {
      return {
        date: sunday,
        season: "Christmas",
        name: "Epiphany of the Lord",
        slug: "epiphany",
        year,
        color: "white",
        feast: "epiphany",
      };
    }
    // Mary, Mother of God = Jan 1 (if Sunday).
    if (sameDay(sunday, startOfDay(new Date(y, 0, 1)))) {
      return {
        date: sunday,
        season: "Christmas",
        name: "Mary, Mother of God",
        slug: "mary-mother-of-god",
        year,
        color: "white",
        feast: "mary-mother-of-god",
      };
    }
    // Otherwise = Holy Family or Christmas Sunday (treat as Christmas Sunday).
    return {
      date: sunday,
      season: "Christmas",
      name: "Sunday of the Christmas Season",
      slug: "christmas-sunday",
      year,
      color: "white",
    };
  }

  // ----- Lent / Triduum / Easter (this year's Easter) -----
  const easter = easterSunday(y);
  const ash = ashWednesday(y);
  const palm = palmSunday(y);
  const pent = pentecost(y);
  const trinity = trinitySunday(y);
  const corpus = corpusChristiSunday(y);
  const cKing = christTheKing(y);

  if (sunday >= ash && sunday < easter) {
    if (sameDay(sunday, palm)) {
      return {
        date: sunday,
        season: "Lent",
        name: "Palm Sunday of the Lord's Passion",
        slug: "palm-sunday",
        year,
        color: "red",
        feast: "palm-sunday",
      };
    }
    // 1st Sunday of Lent = Sunday after Ash Wednesday.
    const lent1 = nextOrCurrentSunday(addDays(ash, 1));
    const w = weeksBetween(lent1, sunday) + 1; // 1..5
    return {
      date: sunday,
      season: "Lent",
      name: `${ordinal(w)} Sunday of Lent`,
      slug: `lent-${w}`,
      weekNumber: w,
      year,
      color: w === 4 ? "rose" : "violet",
    };
  }

  if (sameDay(sunday, easter)) {
    return {
      date: sunday,
      season: "Easter",
      name: "Easter Sunday of the Resurrection",
      slug: "easter",
      weekNumber: 1,
      year,
      color: "gold",
      feast: "easter",
    };
  }

  if (sunday > easter && sunday < pent) {
    const w = weeksBetween(easter, sunday) + 1; // 2..7
    return {
      date: sunday,
      season: "Easter",
      name: `${ordinal(w)} Sunday of Easter`,
      slug: `easter-${w}`,
      weekNumber: w,
      year,
      color: "white",
    };
  }

  if (sameDay(sunday, pent)) {
    return {
      date: sunday,
      season: "Easter",
      name: "Pentecost Sunday",
      slug: "pentecost",
      year,
      color: "red",
      feast: "pentecost",
    };
  }

  if (sameDay(sunday, trinity)) {
    return {
      date: sunday,
      season: "OrdinaryTime",
      name: "Most Holy Trinity",
      slug: "trinity",
      year,
      color: "white",
      feast: "trinity",
    };
  }

  if (sameDay(sunday, corpus)) {
    return {
      date: sunday,
      season: "OrdinaryTime",
      name: "Most Holy Body and Blood of Christ",
      slug: "corpus-christi",
      year,
      color: "white",
      feast: "corpus-christi",
    };
  }

  if (sameDay(sunday, cKing)) {
    // OT 34.
    return {
      date: sunday,
      season: "OrdinaryTime",
      name: "Our Lord Jesus Christ, King of the Universe",
      slug: "christ-the-king",
      weekNumber: 34,
      year,
      color: "white",
      feast: "christ-the-king",
    };
  }

  // ----- Ordinary Time -----
  // Pre-Lent: from Sunday after Baptism (= OT 2) up to Sunday before Ash Wed.
  if (sunday > baptism && sunday < ash) {
    const ot2 = addDays(baptism, 7);
    const w = weeksBetween(ot2, sunday) + 2; // 2..
    return {
      date: sunday,
      season: "OrdinaryTime",
      name: `${ordinal(w)} Sunday in Ordinary Time`,
      slug: `ot-${w}`,
      weekNumber: w,
      year,
      color: "green",
    };
  }
  // Post-Pentecost: number so that Christ the King = 34.
  if (sunday > pent && sunday < cKing) {
    const w = 34 - weeksBetween(sunday, cKing);
    return {
      date: sunday,
      season: "OrdinaryTime",
      name: `${ordinal(w)} Sunday in Ordinary Time`,
      slug: `ot-${w}`,
      weekNumber: w,
      year,
      color: "green",
    };
  }

  // Fallback (shouldn't hit): treat as OT.
  return {
    date: sunday,
    season: "OrdinaryTime",
    name: "Sunday in Ordinary Time",
    slug: "ot",
    year,
    color: "green",
  };
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ---------- formatting helpers ----------

export function formatSunday(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function seasonLabel(s: LiturgicalSeason): string {
  switch (s) {
    case "OrdinaryTime":
      return "Ordinary Time";
    case "Triduum":
      return "Sacred Triduum";
    default:
      return s;
  }
}
