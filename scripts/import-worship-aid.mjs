/**
 * Imports the 22nd Sunday OT Year A worship aid (docs/22nd Sunday OT Year A.pdf)
 * as Song records with lyrics plus the Mass plan that orders them.
 *
 *   node scripts/import-worship-aid.mjs
 *
 * Safe to re-run: songs are upserted by slug and the plan by date. Existing
 * lyrics are only overwritten for the songs listed here.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLAN = {
  date: "2026-08-30",
  name: "22nd Sunday in Ordinary Time",
  year: "A",
  season: "ORDINARY_TIME",
  setting: "Our Lady of Mercy Mass",
  notes:
    "This Sunday the Choir Family prays with Tess Kang'ethe for her intentions and Choir intentions — thank you, Tess, for the song selections.",
};

/** Each entry is one line of the order of service, in liturgical order. */
const ITEMS = [
  {
    part: "ENTRANCE",
    slug: "hoya-he-natufurahi-siku-ya-leo",
    title: "Hoya He! Natufurahi Siku Ya Leo",
    language: "SWAHILI",
    verses: [
      [
        "1. V: Hoya he, (hmm hmm) hoya he, natufurahi siku ya leo *2",
        "V: Aleluya.",
        "W: Hoye, tulitukuze jina la Bwana. *2",
        "V: Hoya he, (hmm hmm) hoya he, natufurahi siku ya leo. (natufurahi siku ya leo *2)",
        "W: Tulitukuze jina la Bwana.",
      ],
      [
        "2. V: Hoya he, (hmm hmm), hoya he, Mungu wetu ndiwe Baba mfariji *2",
        "V: Aleluya,",
        "W: Hoye, kazi zako zote zinakusifu. *2",
        "V: Hoya he, (hmm hmm) hoya he, Mungu wetu ndiwe Baba mfariji, (Mungu wetu ndiwe Baba mfariji *2)",
        "W: Kazi zako zote zinakusifu.",
      ],
      [
        "3. V: Hoya he, (hmm hmm), hoya he, tumshukuru kwa ajili ya Yesu *2",
        "V: Aleluya,",
        "W: Hoye, aliye nasi lake taifa. *2",
        "V: Hoya he, hoya he, tumshukuru kwa ajili ya Yesu, (tumshukuru kwa ajili ya Yesu *2)",
        "W: Aliye nasi lake taifa.",
      ],
      [
        "4. V: Hoya he, (hmm hmm), hoya he, tuyakumbuke mapenzi ya Yesu *2",
        "V: Aleluya,",
        "W: Hoye, aliyoyaleta Yeye mwenyewe. *2",
        "V: Hoya he, hoya he, tuyakumbuke mapenzi ya Yesu, (Tuyakumbuke mapenzi ya Yesu *2)",
        "W: Aliyoyaleta Yeye mwenyewe.",
      ],
      [
        "5. V: Hoya he, (hmm hmm) hoya he, tumpe Mungu sifa, enzi, tukuzo. *2",
        "V: Aleluya.",
        "W: Hoye, nguvu na heshima hata milele. *2",
        "V: Hoya he, hoya he, tumpe Mungu sifa, enzi, tukuzo (tumpe Mungu sifa, enzi, tukuzo *2)",
        "W: Nguvu na heshima hata milele.",
      ],
    ],
  },
  {
    part: "KYRIE",
    slug: "mass-of-reverence",
    title: "Mass of Reverence",
    language: "ENGLISH",
    massParts: ["KYRIE"],
    verses: [["Kyrie eleison; *2", "Christe eleison; *2", "Kyrie eleison *2"]],
  },
  {
    part: "GLORIA",
    slug: "mass-of-reverence-gloria",
    title: "Mass of Reverence — Gloria",
    language: "ENGLISH",
    massParts: ["GLORIA"],
    verses: [
      [
        "Glory to God in the highest,",
        "And on earth peace to people of good will.",
        "We praise you, we bless you, we adore you, we glorify you.",
        "We give you thanks for your great glory,",
        "Lord God, heavenly King, O God, almighty Father.",
        "Lord Jesus Christ, only Begotten Son,",
        "Lord God, Lamb of God, Son of the Father,",
        "You take away the sins of the world have mercy on us;",
        "You take away the sins of the world, receive our prayer;",
        "You are seated at the right hand of the Father:",
        "Have mercy on us *4",
        "For you alone are the Holy One,",
        "You alone are the Lord,",
        "You alone are the Most High, Jesus Christ,",
        "With the Holy Spirit, in the glory of God the Father",
        "Amen, amen.",
      ],
    ],
  },
  {
    part: "GOSPEL_PROCESSION",
    slug: "bwana-asema",
    title: "Bwana Asema",
    language: "SWAHILI",
    verses: [
      [
        "1. Bwana asema, nitume nani.",
        "Na ninani atakaye kwenda badala yangu?",
        "Nitume mimi Bwana, Nitume mimi Bwana,",
        "Nitume mimi Bwana, Nitume mimi Bwana.",
      ],
      ["2. Midomo yangu, ni chafu sana,", "Uichome kwa kaa la moto uitakase *2"],
      [
        "3. Ninaogopa, kuwa mdogo",
        "Kuhubiri neno lake Bwana pote niendako *2",
      ],
      [
        "4. Waniambia mimi nisiogope,",
        "Nitapata ujasiri mwingi kutoka kwako",
      ],
    ],
  },
  {
    part: "RESPONSORIAL_PSALM",
    slug: "psalm-63-for-you-my-soul-is-thirsting",
    title: "Psalm 63 — For you my soul is thirsting",
    language: "ENGLISH",
    scripture: ["Ps 63"],
    verses: [
      ["R. For you my soul is thirsting, O Lord, my God."],
      [
        "O God, you are my God; at dawn I seek you;",
        "For you my soul is thirsting.",
        "For you my flesh is pining,",
        "Like a dry, weary land without water. R.",
      ],
      [
        "I have come before you in the sanctuary,",
        "To behold your strength and your glory.",
        "Your loving mercy is better than life;",
        "My lips will speak your praise. R.",
      ],
      [
        "I will bless you all my life;",
        "In your name I will lift up my hands.",
        "My soul shall be filled as with a banquet;",
        "With joyful lips, my mouth shall praise you. R.",
      ],
      [
        "For you have been my strength,",
        "In the shadow of your wings I rejoice.",
        "My soul clings fast to you;",
        "Your right hand upholds me. R.",
      ],
    ],
  },
  {
    part: "GOSPEL_ACCLAMATION",
    slug: "dan-1-alleluia",
    title: "Dan 1 — Alleluia",
    language: "LATIN",
    massParts: ["GOSPEL_ACCLAMATION", "GREAT_AMEN"],
    verses: [["Alleluia *n"]],
  },
  {
    part: "OFFERTORY",
    slug: "anu-fafa",
    title: "Anu Fafa",
    language: "OTHER",
    verses: [
      [
        "Anu Fafa me lago be agni",
        "A bo suama si kwal-gba bue ma",
        "i ka ni ni no le boje cianiko, o lago namala neniko",
      ],
      ["1. I kani koma le a-yi-co oo lago oooo A-yi-co, a-yi-co, a-yi-co"],
      ["2. A na nunigbe ka na ze oo lago oooo A-yi-co, a-yi-co, a-yi-co"],
      ["3. I kani kita le a-yi-co oo lago oooo A-yi-co, a-yi-co, a-yi-co"],
      [
        "(Translation — Our Lord, receive our offerings; Receive the offerings of bread and wine)",
      ],
    ],
  },
  {
    part: "OFFERTORY",
    slug: "ndipereka",
    title: "Ndipereka",
    language: "OTHER",
    verses: [
      [
        "1. Ndilibe mphotso ine zopereka kwa Mulungu wanga",
        "Ndipereka ine? Ndipereka moyo wanga *2",
        "Ndipereka ine? Ndipereka moyo wanga? *4",
      ],
      [
        "2. Ndilibe chuma ine chopereka kwa Mulungu wanga",
        "Ndipereka ine? Ndipereka moyo wanga *2",
      ],
      [
        "3. Ndilibe mwana ine wopereka kwa Mulungu wanga",
        "Ndipereka ine? Ndipereka moyo wanga *2",
      ],
      [
        "(Translation: What will I offer? I will offer my life. I don't have a gift, wealth or child to offer — I offer my life)",
      ],
    ],
  },
  {
    part: "PREPARATION_OF_GIFTS",
    slug: "lord-accept-the-gifts-we-offer",
    title: "Lord Accept the Gifts We Offer",
    language: "ENGLISH",
    verses: [
      [
        "1. Lord accept the gift we offer at this Eucharistic feast",
        "Bread and wine to be transformed now; Through the action of thy priest",
        "Take us too Lord and transform us Be thy grace in us increased.",
      ],
      [
        "2. May our souls be pure and spotless as the host of wheat so fine",
        "May all stain of sin be crushed out like the grape that forms the wine",
        "As we too become partakers In this sacrifice divine",
      ],
      [
        "3. Take our gift Almighty Father Living God eternal true",
        "Which we give through Christ our Savior pleading here for us anew",
        "Grant salvation to all present and our faith and love renew",
      ],
    ],
  },
  {
    part: "SANCTUS",
    slug: "our-lady-of-mercy-mass",
    title: "Our Lady of Mercy Mass",
    language: "SWAHILI",
    massParts: ["SANCTUS", "MYSTERY_OF_FAITH", "AGNUS_DEI"],
    verses: [
      [
        "Sanctus",
        "Mtakatifu, mtakatifu, mtakatifu Bwana Mungu (Mungu) wa majeshi",
        "Mbingu na dunia zimejaa, zimejaa sifa zako",
        "Hosanna *2 Hosanna juu mbinguni *2",
        "Mbarikiwa anayekuja kwa jina lake Bwana",
        "Hosanna *2 Hosanna juu mbinguni *2",
      ],
      [
        "Mysterium Fidei",
        "Kristu, Kristu alikufa; Kristu, Kristu alifufuka",
        "Kristu, atakuja tena",
      ],
      [
        "Agnus Dei",
        "Mwanakondoo wa Mungu, Mwanakondoo wa Mungu",
        "Uondoaye dhambi, za dunia, tuhurumie *2",
        "Mwanakondoo wa Mungu",
        "Uondoaye dhambi, za dunia, (utujalie, tujalie amani *2)",
      ],
    ],
  },
  { part: "MYSTERY_OF_FAITH", slug: "our-lady-of-mercy-mass", reuse: true },
  { part: "GREAT_AMEN", slug: "dan-1-alleluia", reuse: true, song: "Dan 1 — Amina *n" },
  { part: "OUR_FATHER", song: "Recited" },
  {
    part: "SIGN_OF_PEACE",
    slug: "amani-yako-bwana-isambae",
    title: "Amani Yako Bwana Isambae",
    language: "SWAHILI",
    verses: [["1. Amani | 2. Upendo | 3. Fadhili | 4. Baraka | 5. Neema"]],
  },
  { part: "AGNUS_DEI", slug: "our-lady-of-mercy-mass", reuse: true },
  {
    part: "COMMUNION",
    slug: "o-bread-of-heaven",
    title: "O Bread of Heaven",
    language: "ENGLISH",
    verses: [
      [
        "1. O Bread of Heaven, beneath this veil",
        "Thou dost my very God conceal:",
        "My Jesus, dearest treasure, hail!",
        "I love Thee and, adoring, kneel;",
        "Each loving soul by Thee is fed",
        "With Thine own Self in form of Bread.",
      ],
      [
        "2. O food of life, Thou Who dost give",
        "The pledge of immortality;",
        "I live, no 'tis not I that live;",
        "God gives me life, God lives in me:",
        "He feeds my soul, He guides my ways,",
        "And every grief with joy repays.",
      ],
      [
        "3. O Bond of love that dost unite",
        "The servant to his living Lord;",
        "Could I dare live and not requite",
        "Such love - then death were meet reward:",
        "I cannot live unless to prove",
        "Some love for such unmeasured love.",
      ],
      [
        "4. Beloved Lord, in Heaven above",
        "There, Jesus, Thou awaitest me,",
        "To gaze on Thee with endless love;",
        "Yes, thus I hope, thus shall it be:",
        "For how can He deny me Heaven,",
        "Who here on earth Himself hath given?",
      ],
    ],
  },
  {
    part: "COMMUNION",
    slug: "as-the-deer",
    title: "As the Deer",
    language: "ENGLISH",
    verses: [
      [
        "1. As the deer panteth for the water",
        "So my soul longeth after Thee; You alone are my heart's desire",
        "And I long to worship Thee",
        "You alone are my Strength, my Shield",
        "To You alone may my spirit yield",
        "You alone are my heart's desire",
        "And I long to worship Thee",
      ],
      [
        "2. You're my Friend and You are my Brother",
        "Even though You are a King; I love You more than any other",
        "So much more than anything",
      ],
      [
        "3. I want You more than gold or silver",
        "Only You can satisfy; You alone are the real joy-giver",
        "And the apple of my eye",
      ],
    ],
  },
  { part: "ANIMA_CHRISTI", song: "Frisina" },
  {
    part: "THANKSGIVING",
    slug: "ninyonete-thengiu-ngai",
    title: "Nĩ Nyonete (Thengiu Ngai)",
    language: "OTHER",
    verses: [
      [
        "Nĩ nyonete, urĩa Ngai wĩkaga, arĩa makwĩhokete,",
        "(Nĩ nguraha magegania na tha ciaku, thengiu Ngai urotugĩra) *2",
      ],
      [
        "1. Ndarĩ murwaru, ugĩuka kuhonia - thengiu Ngai urotugĩra",
        "Mahĩndĩ makwa ukĩmacokania - thengiu Ngai urotugĩra",
        "Amukĩra ngatho ciakwa Baba - thengiu Ngai urotugĩra",
      ],
      [
        "2. Ndacokia ngatho nĩundu wa kuhe mucii -",
        "Ndacokia ngatho, nĩundu wa kuhe ciana -",
        "Magitagĩre no mamenyagĩrĩre -",
      ],
      [
        "3. Nĩ kĩ nii Ngai ingĩguthukĩra -",
        "Nii no nguinĩire, rwĩmbo rwa ugooci -",
        "Ngumo na ugoci i'rogucokerera -",
      ],
      [
        "4. Nii na nyumba yakwa tugutura -",
        "tukugoocaga tene ona tene -",
        "kurĩ mawega ona kwĩ mauuru -",
      ],
    ],
  },
  {
    part: "RECESSIONAL",
    slug: "lord-i-want-to-be-a-christian",
    title: "Lord I Want to Be a Christian",
    language: "ENGLISH",
    verses: [
      [
        "1. Lord I want to be a Christian in my heart in my heart",
        "Lord I want to be a Christian in my heart in my heart",
        "In my heart in my heart",
        "Lord I want to be a Christian in my heart in my heart",
      ],
      [
        "2. Lord I want to be more loving in my heart in my heart",
        "Lord I want to be more loving in my heart in my heart",
        "In my heart in my heart",
        "Lord I want to be more loving in my heart in my heart",
      ],
      [
        "3. Lord I want to be more holy in my heart in my heart",
        "Lord I want to be more holy in my heart in my heart",
        "In my heart in my heart",
        "Lord I want to be more holy in my heart in my heart",
        "(In my heart in my heart *4)",
        "Lord I want to be more holy in my heart in my heart",
      ],
    ],
  },
  {
    part: "MARIAN_HYMN",
    slug: "kumbuka",
    title: "Kumbuka",
    language: "SWAHILI",
    themes: ["Marian"],
    verses: [
      [
        "Kumbuka, ee Bikira Maria mpole sana",
        "Haijasikika bado hata mara moja",
        "Kwamba ulimwacha mtu, aliyekimbilia ulinzi wako",
        "Aliyeomba msaada na maombezi yako-o",
        "{Kumbuka *3 Eeh Bikira Maria aah} *2",
      ],
      [
        "Kwa matumaini hayo, tunakimbilia wewe eh Mama",
        "Bikira wa mabikira, kwa matumaini hayo",
        "Tunasimama mbele yako, tukilalamika si wakosefu",
        "eeh Bikira twaja kwako",
        "{Kumbuka *3 Eeh Bikira Maria aah} *2",
      ],
      [
        "Eeh Mama wa neno la Mungu, usiyakatae maneno yetu",
        "Bali upende kuyasikia, Na kuyasikiliza",
        "{Kumbuka *3 Eeh Bikira Maria aah} *2",
      ],
    ],
  },
];

const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Verse blocks become paragraphs; lines within a verse become <br />. */
const toHtml = (verses) =>
  verses.map((lines) => `<p>${lines.map(escape).join("<br />")}</p>`).join("");

async function main() {
  const seen = new Set();
  let songs = 0;

  for (const item of ITEMS) {
    if (!item.slug || !item.verses || seen.has(item.slug)) continue;
    seen.add(item.slug);

    const data = {
      title: item.title,
      language: item.language,
      lyrics: toHtml(item.verses),
      massParts: item.massParts ?? [item.part],
      seasons: ["ORDINARY_TIME"],
      themes: item.themes ?? [],
      scripture: item.scripture ?? [],
      isActive: true,
    };

    await prisma.song.upsert({
      where: { slug: item.slug },
      update: data,
      create: { slug: item.slug, ...data },
    });
    songs += 1;
  }

  const date = new Date(`${PLAN.date}T00:00:00.000Z`);
  const planData = {
    name: PLAN.name,
    year: PLAN.year,
    season: PLAN.season,
    setting: PLAN.setting,
    notes: PLAN.notes,
    status: "PUBLISHED",
  };

  const plan = await prisma.massPlan.upsert({
    where: { date },
    update: planData,
    create: { date, ...planData },
  });

  // Rebuild the order of service so re-runs don't duplicate rows.
  // Entries that reuse an earlier song carry only a slug, so look the title up.
  const titleBySlug = new Map(
    ITEMS.filter((i) => i.slug && i.title).map((i) => [i.slug, i.title]),
  );

  await prisma.massPlanItem.deleteMany({ where: { planId: plan.id } });
  await prisma.massPlanItem.createMany({
    data: ITEMS.map((item, index) => ({
      planId: plan.id,
      part: item.part,
      song:
        item.song ??
        item.title ??
        (item.slug ? titleBySlug.get(item.slug) : null) ??
        "Recited",
      songSlug: item.slug ?? null,
      sortOrder: index,
    })),
  });

  console.log(`Imported ${songs} songs with lyrics.`);
  console.log(`Mass plan "${PLAN.name}" (${PLAN.date}) has ${ITEMS.length} items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
