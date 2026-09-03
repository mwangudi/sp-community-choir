"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { LiturgicalSeason, MassPart, PlanStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export type PlanFormState = { error?: string };

type IncomingItem = { part: string; song: string; songSlug?: string | null };

function text(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

export async function saveMassPlan(
  _prev: PlanFormState,
  formData: FormData,
): Promise<PlanFormState> {
  const session = await requireSession("TECHNICAL");

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Give the Sunday a name" };

  const rawDate = String(formData.get("date") ?? "").trim();
  if (!rawDate) return { error: "Choose the date this plan serves" };
  const date = new Date(`${rawDate}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return { error: "That date is not valid" };

  const clash = await prisma.massPlan.findFirst({
    where: { date, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) return { error: "There is already a plan for that Sunday" };

  let items: IncomingItem[] = [];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]")) as IncomingItem[];
  } catch {
    return { error: "The order of service could not be read" };
  }
  const rows = items
    .filter((i) => i.part && i.song?.trim())
    .map((i, index) => ({
      part: i.part as MassPart,
      song: i.song.trim(),
      songSlug: i.songSlug || null,
      sortOrder: index,
    }));

  const data = {
    date,
    name,
    year: String(formData.get("year") ?? "A"),
    season: (text(formData, "season") as LiturgicalSeason | null) ?? null,
    setting: text(formData, "setting"),
    leader: text(formData, "leader"),
    notes: text(formData, "notes"),
    status: String(formData.get("status") ?? "DRAFT") as PlanStatus,
  };

  if (id) {
    // Rows have no stable identity in the form, so replace them wholesale.
    await prisma.$transaction([
      prisma.massPlanItem.deleteMany({ where: { planId: id } }),
      prisma.massPlan.update({
        where: { id },
        data: { ...data, items: { create: rows } },
      }),
    ]);
  } else {
    await prisma.massPlan.create({
      data: { ...data, createdById: session.sub, items: { create: rows } },
    });
  }

  revalidatePath("/admin/mass-plans");
  redirect("/admin/mass-plans");
}

export async function deleteMassPlan(formData: FormData) {
  await requireSession("ADMIN");
  const id = String(formData.get("id"));

  await prisma.massPlan.delete({ where: { id } });

  revalidatePath("/admin/mass-plans");
}

export async function togglePlanStatus(formData: FormData) {
  await requireSession("TECHNICAL");
  const id = String(formData.get("id"));
  const plan = await prisma.massPlan.findUnique({ where: { id } });
  if (!plan) return;

  await prisma.massPlan.update({
    where: { id },
    data: { status: plan.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
  });

  revalidatePath("/admin/mass-plans");
}
