import type { MassPart } from "@prisma/client";
import { MASS_PLAN_PART_ORDER, type MassPlanPart } from "@/lib/mass-plans";

/** "GOSPEL_PROCESSION" → "Gospel Procession" */
export function massPartLabel(part: MassPart | string): string {
  return part
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** "Gospel Procession" → "GOSPEL_PROCESSION" */
export function toMassPartEnum(part: MassPlanPart | string): MassPart {
  return part.toUpperCase().replaceAll(" ", "_") as MassPart;
}

const ORDER = new Map<string, number>(
  MASS_PLAN_PART_ORDER.map((p, i) => [toMassPartEnum(p), i]),
);

export function massPartOrder(part: MassPart | string): number {
  return ORDER.get(part) ?? ORDER.size;
}
