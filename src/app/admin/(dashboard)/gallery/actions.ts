"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { GalleryKind } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { slugify } from "@/lib/blog";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, deleteImage, saveImage } from "@/lib/storage";

export type GalleryFormState = { error?: string };

function text(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

export async function saveGalleryItem(
  _prev: GalleryFormState,
  formData: FormData,
): Promise<GalleryFormState> {
  await requireSession("TECHNICAL");

  const id = String(formData.get("id") ?? "").trim();
  const kind = String(formData.get("kind") ?? "PHOTO") as GalleryKind;
  const title = String(formData.get("title") ?? "").trim();

  let slug = slugify(String(formData.get("slug") ?? "") || title || `item-${Date.now()}`);
  const clash = await prisma.galleryItem.findFirst({
    where: { slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const upload = formData.get("imageFile");
  let uploadedSrc: string | undefined;
  if (upload instanceof File && upload.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.has(upload.type)) {
      return { error: "Photos must be JPG, PNG, WebP or AVIF" };
    }
    if (upload.size > MAX_IMAGE_BYTES) return { error: "Photos must be under 5 MB" };
    try {
      uploadedSrc = (await saveImage(upload, "gallery")).url;
    } catch {
      return { error: "Could not upload the photo" };
    }
  }

  const src = uploadedSrc ?? text(formData, "src");
  const youtubeId = text(formData, "youtubeId");

  if (kind === "PHOTO" && !src) {
    return { error: "Upload a photo or give the path to one" };
  }
  if (kind === "VIDEO" && !youtubeId) {
    return { error: "Videos need a YouTube id" };
  }
  if (kind === "VIDEO" && youtubeId && !/^[A-Za-z0-9_-]{11}$/.test(youtubeId)) {
    return { error: "A YouTube id is 11 characters" };
  }

  const takenOnRaw = String(formData.get("takenOn") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  const data = {
    slug,
    kind,
    src: kind === "PHOTO" ? src : null,
    youtubeId: kind === "VIDEO" ? youtubeId : null,
    title: title || null,
    alt: text(formData, "alt"),
    caption: text(formData, "caption"),
    takenOn: takenOnRaw ? new Date(`${takenOnRaw}T00:00:00.000Z`) : null,
    tags: String(formData.get("tags") ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    isPublished: formData.get("isPublished") === "on",
  };

  if (id) {
    const existing = await prisma.galleryItem.findUnique({ where: { id } });
    await prisma.galleryItem.update({ where: { id }, data });
    // Only bin the old file when a replacement was actually uploaded.
    if (uploadedSrc && existing?.src && existing.src !== uploadedSrc) {
      await deleteImage(existing.src);
    }
  } else {
    await prisma.galleryItem.create({ data });
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  redirect("/admin/gallery");
}

export async function deleteGalleryItem(formData: FormData) {
  await requireSession("ADMIN");
  const id = String(formData.get("id"));
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) return;

  await prisma.galleryItem.delete({ where: { id } });
  if (item.src) await deleteImage(item.src);

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function toggleGalleryPublished(formData: FormData) {
  await requireSession("TECHNICAL");
  const id = String(formData.get("id"));
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) return;

  await prisma.galleryItem.update({
    where: { id },
    data: { isPublished: !item.isPublished },
  });

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}
