"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  CopyrightStatus,
  LiturgicalSeason,
  MassPart,
  SongLanguage,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { slugify } from "@/lib/blog";

export type SongFormState = { error?: string };

function list(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function text(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

export async function saveSong(
  _prev: SongFormState,
  formData: FormData,
): Promise<SongFormState> {
  await requireSession("TECHNICAL");

  const originalSlug = String(formData.get("originalSlug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2) return { error: "Give the song a title" };

  const slug = slugify(String(formData.get("slug") ?? "") || title);
  if (!slug) return { error: "Could not build a URL slug from that title" };

  const clash = await prisma.song.findFirst({
    where: { slug, ...(originalSlug ? { NOT: { slug: originalSlug } } : {}) },
    select: { slug: true },
  });
  if (clash) return { error: `Another song already uses the slug “${slug}”` };

  const copyrightStatus = String(
    formData.get("copyrightStatus") ?? "UNKNOWN",
  ) as CopyrightStatus;

  const data = {
    slug,
    title,
    language: String(formData.get("language") ?? "ENGLISH") as SongLanguage,
    composer: text(formData, "composer"),
    arranger: text(formData, "arranger"),
    voicing: text(formData, "voicing"),
    musicalKey: text(formData, "musicalKey"),
    aliases: list(formData.get("aliases")),
    seasons: list(formData.get("seasons")) as LiturgicalSeason[],
    massParts: list(formData.get("massParts")) as MassPart[],
    themes: list(formData.get("themes")),
    scripture: list(formData.get("scripture")),
    driveFolderId: text(formData, "driveFolderId"),
    notes: text(formData, "notes"),
    isActive: formData.get("isActive") === "on",
    copyrightStatus,
    rightsHolder: text(formData, "rightsHolder"),
    licenceRef: text(formData, "licenceRef"),
    sourceUrl: text(formData, "sourceUrl"),
    rightsCheckedAt: copyrightStatus === "UNKNOWN" ? null : new Date(),
  };

  if (originalSlug) {
    await prisma.song.update({ where: { slug: originalSlug }, data });
  } else {
    await prisma.song.create({ data });
  }

  revalidatePath("/admin/songs");
  revalidatePath("/repertoire");
  redirect("/admin/songs");
}

export async function deleteSong(formData: FormData) {
  await requireSession("ADMIN");
  const slug = String(formData.get("id"));

  await prisma.song.delete({ where: { slug } });

  revalidatePath("/admin/songs");
  revalidatePath("/repertoire");
}
