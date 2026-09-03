/**
 * Community Choir static data — content folded in from the legacy
 * Wix site (https://spchoir1.wixsite.com/choir).
 *
 * Single source of truth for the standalone choir website. Mirrors
 * the parish site's `src/lib/choirs.ts` so both stay in sync until
 * we wire either project to a Sanity backend.
 *
 * Values flagged "TBC" still need confirmation from the choir team
 * (intake questions sent to the WhatsApp group on 2026-05-27).
 */

export type ChoirSocial = {
  label: string;
  href: string;
  /** Lucide icon name. */
  icon: "facebook" | "instagram" | "youtube" | "twitter" | "mail" | "globe";
};

export type ChoirHighlight = {
  title: string;
  blurb: string;
  /** Year or season the event last ran. */
  when: string;
};

export type ChoirTestimonial = {
  quote: string;
  attribution: string;
};

export type ChoirConcert = {
  slug: string;
  title: string;
  /** ISO string with +03:00 (EAT) offset. */
  startsAt: string;
  venue: string;
  blurb: string;
  description?: string[];
  poster?: string;
  pinned?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
};

export const CHOIR = {
  name: "St. Paul's Chapel Community Choir",
  shortName: "Community Choir",
  parish: "St. Paul's Catholic Parish & UoN Chaplaincy",
  tagline: "Arise and Evangelize",
  verse: {
    text: "I will sing praises to my God, when I have my being.",
    ref: "Psalm 146:2",
  },
  intro:
    "St. Paul's Chapel Community Choir is the parish choir at St. Paul's Catholic Parish & UoN Chaplaincy. We animate the 11:30 am Sunday Mass and major parish celebrations, drawing voices from across our jumuiyas into one body of praise.",
  about:
    "Made up of parishioners from every walk of life, the choir is a place where music, prayer, and friendship meet. We rehearse seriously, sing prayerfully, and serve the liturgy first — but we also love a good concert, a charity drive, and the long tea afterwards.",
  history:
    "The choir has ministered at St. Paul's for decades, drawing students, working professionals, and resident parishioners into a single body of praise. Through the years we've taken our voice from the chapel to charity concerts across Nairobi and even abroad — most notably representing St. Paul's at the Cornerstone Arts Festival in Liverpool.",
  rehearsals: {
    day: "Mon & Wed",
    time: "6:00 pm – 8:00 pm",
    sundayWarmUp: "Sundays 10:15 am (before the 11:30 am Mass)",
    venue: "St. Paul's Chapel (TBC)",
  },
  ministersAt: {
    label: "11:30 am Sunday Mass",
    note: "Plus major liturgies — Triduum, Christmas, parish feast days.",
  },
  email: "stpaulscommunitychoir@gmail.com",
  consentFormHref: "/community-choir-media-consent.pdf",
  parishSiteHref: "https://www.stpaulschapelnbi.org/choirs/community",
  /**
   * Mobile-money / bank details for supporting the choir.
   * Replace the `TBC` placeholders with the real numbers when confirmed.
   */
  support: {
    paybill: {
      number: "TBC",
      accountName: "St. Paul's Chapel Community Choir",
      accountRef: "CHOIR",
    },
    till: {
      number: "TBC",
      name: "St. Paul's Chapel Community Choir",
    },
    sendMoney: {
      number: "+254 7XX XXX XXX",
      name: "Choir Treasurer (TBC)",
    },
    bank: {
      name: "TBC",
      branch: "TBC",
      accountName: "St. Paul's Chapel Community Choir",
      accountNumber: "TBC",
    },
  },
  socials: [
    {
      label: "Facebook",
      href: "https://www.facebook.com/StPaulsChapelConcertsKE/",
      icon: "facebook",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/stpaulschapelcommchoir/",
      icon: "instagram",
    },
    {
      label: "YouTube",
      href: "https://www.youtube.com/channel/UCTFlnl91duWB5Fdbfx4G1aw",
      icon: "youtube",
    },
    {
      label: "Twitter / X",
      href: "https://twitter.com/StPaulsComChoir",
      icon: "twitter",
    },
    {
      label: "The Psalter",
      href: "https://stpaulspsalter.wordpress.com/",
      icon: "globe",
    },
  ] satisfies ChoirSocial[],
  testimonial: {
    quote:
      "The choir radiates an infectious warmth that permeates the entire congregation as it belts out favourites after favourites of well-chosen, diverse and all-inclusive songs, thereby enriching not just the quality of fellowship but also the wholesomeness of the entire liturgical experience.",
    attribution: "Caxton Kinuthia, Parishioner",
  } satisfies ChoirTestimonial,
  highlights: [
    {
      title: "St. Paul's Christmas Carols",
      blurb:
        "An annual evening of carols, readings and reflection that closes the academic year and welcomes the Christmas season.",
      when: "Advent",
    },
    {
      title: "Corpus Christi Adoration",
      blurb:
        "Solemn adoration and Eucharistic procession marking the Solemnity of the Most Holy Body and Blood of Christ.",
      when: "June",
    },
    {
      title: "African Concert",
      blurb:
        "A celebration of African sacred music — drums, kayamba, harmonies and dance in the service of the liturgy.",
      when: "August",
    },
    {
      title: "Rhythm and Praise Charity Concert",
      blurb:
        "A choir-led charity concert raising support for parish outreach and student welfare causes.",
      when: "Past",
    },
    {
      title: "Cornerstone Arts Festival",
      blurb:
        "Representing St. Paul's at the Cornerstone Arts Festival in Liverpool — taking our voice beyond the chapel.",
      when: "Past",
    },
  ] satisfies ChoirHighlight[],
} as const;

/**
 * Upcoming and recent concerts. Keep in chronological order;
 * `getUpcomingConcerts` / `getPastConcerts` filter by date at runtime.
 */
export const CONCERTS: ChoirConcert[] = [
  {
    slug: "corpus-christi-procession-2026",
    title: "Corpus Christi Adoration & Procession",
    startsAt: "2026-06-07T15:00:00+03:00",
    venue: "St. Paul's Catholic Chapel, University Way",
    blurb:
      "Solemn adoration, choral reflection and the Eucharistic procession around the chapel grounds.",
    pinned: true,
  },
  {
    slug: "african-concert-2026",
    title: "African Concert",
    startsAt: "2026-08-16T17:00:00+03:00",
    venue: "St. Paul's Catholic Chapel",
    blurb:
      "Drums, kayamba, harmonies and dance — African sacred music in the service of the liturgy.",
  },
  {
    slug: "st-pauls-christmas-carols-2026",
    title: "St. Paul's Christmas Carols",
    startsAt: "2026-12-20T18:30:00+03:00",
    venue: "St. Paul's Catholic Chapel",
    blurb:
      "Our annual evening of carols, readings and reflection that closes the academic year.",
  },
  {
    slug: "mater-hospital-carols-2026",
    title: "Carols at Mater Hospital",
    startsAt: "2026-12-13T15:00:00+03:00",
    venue: "Mater Misericordiae Hospital, South B",
    blurb:
      "Bringing Christmas carols to patients, staff and visitors at Mater Hospital.",
  },
];

const now = () => new Date();

export function isUpcoming(c: ChoirConcert) {
  return new Date(c.startsAt).getTime() >= now().getTime();
}

/** Pass admin-managed concerts in; defaults to the bundled fallback list. */
export function getUpcomingConcerts(concerts: ChoirConcert[] = CONCERTS) {
  return concerts
    .filter(isUpcoming)
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    });
}

export function getPastConcerts(concerts: ChoirConcert[] = CONCERTS) {
  return concerts
    .filter((c) => !isUpcoming(c))
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
}

export function formatConcertDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatConcertTime(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}
