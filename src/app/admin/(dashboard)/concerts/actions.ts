"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { slugify } from "@/lib/blog";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, deleteImage, saveImage } from "@/lib/storage";

export type ConcertFormState = { error?: string };

function text(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

export async function saveConcert(
  _prev: ConcertFormState,
  formData: FormData,
): Promise<ConcertFormState> {
  await requireSession("TECHNICAL");

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2) return { error: "Give the concert a title" };

  const venue = String(formData.get("venue") ?? "").trim();
  if (!venue) return { error: "Where is it? Add a venue" };

  const blurb = String(formData.get("blurb") ?? "").trim();
  if (!blurb) return { error: "Add a short blurb for the listing" };

  const rawStart = String(formData.get("startsAt") ?? "").trim();
  const startsAt = new Date(rawStart);
  if (!rawStart || Number.isNaN(startsAt.getTime())) {
    return { error: "Choose when the concert starts" };
  }

  let slug = slugify(String(formData.get("slug") ?? "") || title);
  const clash = await prisma.concert.findFirst({
    where: { slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  // Blank lines separate paragraphs on the public page.
  const description = String(formData.get("description") ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const upload = formData.get("posterFile");
  let poster: string | undefined;
  if (upload instanceof File && upload.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.has(upload.type)) {
      return { error: "The poster must be a JPG, PNG, WebP or AVIF image" };
    }
    if (upload.size > MAX_IMAGE_BYTES) return { error: "The poster must be under 5 MB" };
    try {
      poster = (await saveImage(upload, "concerts")).url;
    } catch {
      return { error: "Could not upload the poster" };
    }
  }

  const data = {
    slug,
    title,
    startsAt,
    venue,
    blurb,
    description,
    pinned: formData.get("pinned") === "on",
    isPublished: formData.get("isPublished") === "on",
    ctaLabel: text(formData, "ctaLabel"),
    ctaHref: text(formData, "ctaHref"),
    ...(poster ? { poster } : {}),
  };

  if (id) {
    const existing = await prisma.concert.findUnique({ where: { id } });
    await prisma.concert.update({ where: { id }, data });
    if (poster && existing?.poster) await deleteImage(existing.poster);
  } else {
    await prisma.concert.create({ data });
  }

  revalidatePath("/admin/concerts");
  revalidatePath("/concerts");
  redirect("/admin/concerts");
}

export async function deleteConcert(formData: FormData) {
  await requireSession("ADMIN");
  const id = String(formData.get("id"));
  const concert = await prisma.concert.findUnique({ where: { id } });
  if (!concert) return;

  await prisma.concert.delete({ where: { id } });
  if (concert.poster) await deleteImage(concert.poster);

  revalidatePath("/admin/concerts");
  revalidatePath("/concerts");
}
