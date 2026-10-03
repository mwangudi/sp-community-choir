/**
 * Special Masses — weddings, requiems, feasts — planned by the admin on any
 * day, outside the Sunday proposal flow. Kept free of server imports so the
 * plan form can use it.
 */

import type { MassKind, MassPart } from "@prisma/client";

export const MASS_KINDS = ["SUNDAY", "WEDDING", "REQUIEM", "FEAST", "OTHER"] as const;

export const SPECIAL_KINDS = MASS_KINDS.filter(
  (k): k is Exclude<MassKind, "SUNDAY"> => k !== "SUNDAY",
);

const LABELS: Record<MassKind, string> = {
  SUNDAY: "Sunday Mass",
  WEDDING: "Wedding Mass",
  REQUIEM: "Requiem Mass",
  FEAST: "Feast or solemnity",
  OTHER: "Other Mass",
};

export function massKindLabel(kind: MassKind | string): string {
  return LABELS[kind as MassKind] ?? LABELS.OTHER;
}

export function isMassKind(value: string): value is MassKind {
  return (MASS_KINDS as readonly string[]).includes(value);
}

/** Parts sung only at special Masses, so the Sunday form leaves them out. */
export const OCCASION_PARTS: readonly MassPart[] = [
  "RITE_OF_MARRIAGE",
  "SIGNING_OF_REGISTER",
  "FINAL_COMMENDATION",
];

const STANDARD: MassPart[] = [
  "ENTRANCE",
  "KYRIE",
  "GLORIA",
  "GOSPEL_ACCLAMATION",
  "OFFERTORY",
  "SANCTUS",
  "MYSTERY_OF_FAITH",
  "GREAT_AMEN",
  "SIGN_OF_PEACE",
  "AGNUS_DEI",
  "COMMUNION",
  "THANKSGIVING",
  "RECESSIONAL",
];

/** Starter order of service for each occasion; the admin edits from here. */
export const OUTLINES: Record<MassKind, MassPart[]> = {
  SUNDAY: STANDARD,
  WEDDING: [
    "ENTRANCE",
    "KYRIE",
    "GLORIA",
    "RESPONSORIAL_PSALM",
    "GOSPEL_ACCLAMATION",
    "RITE_OF_MARRIAGE",
    "OFFERTORY",
    "SANCTUS",
    "MYSTERY_OF_FAITH",
    "GREAT_AMEN",
    "SIGN_OF_PEACE",
    "AGNUS_DEI",
    "COMMUNION",
    "THANKSGIVING",
    "SIGNING_OF_REGISTER",
    "RECESSIONAL",
  ],
  // The funeral Mass has no Gloria, and the commendation replaces the dismissal.
  REQUIEM: [
    "ENTRANCE",
    "KYRIE",
    "RESPONSORIAL_PSALM",
    "GOSPEL_ACCLAMATION",
    "OFFERTORY",
    "SANCTUS",
    "MYSTERY_OF_FAITH",
    "GREAT_AMEN",
    "AGNUS_DEI",
    "COMMUNION",
    "THANKSGIVING",
    "FINAL_COMMENDATION",
    "RECESSIONAL",
  ],
  FEAST: STANDARD,
  OTHER: STANDARD,
};

/** Admin section that owns a plan of this kind. */
export function plansHref(kind: MassKind | string): string {
  return kind === "SUNDAY" ? "/admin/mass-plans" : "/admin/special-masses";
}
