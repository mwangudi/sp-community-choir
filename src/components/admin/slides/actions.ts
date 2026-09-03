"use server";

import { revalidatePath } from "next/cache";
import type { SlidePlacement } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  deleteImage,
  saveImage,
} from "@/lib/storage";

export type UploadState = { error?: string; ok?: boolean };

/** Pages that show each carousel, so edits appear immediately. */
const AFFECTED: Record<SlidePlacement, string[]> = {
  LOGIN: ["/admin/login-slides", "/admin/login"],
  HERO: ["/admin/hero-slides", "/"],
};

function placementOf(formData: FormData): SlidePlacement {
  return formData.get("placement") === "HERO" ? "HERO" : "LOGIN";
}

function refresh(placement: SlidePlacement) {
  for (const path of AFFECTED[placement]) revalidatePath(path);
}

function text(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

export async function uploadSlides(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  await requireSession("ADMIN");
  const placement = placementOf(formData);

  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Choose at least one image" };

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return { error: `${file.name}: only JPG, PNG, WebP or AVIF are allowed` };
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return { error: `${file.name}: images must be under 5 MB` };
    }
  }

  const last = await prisma.slide.findFirst({
    where: { placement },
    orderBy: { sortOrder: "desc" },
  });
  let order = (last?.sortOrder ?? -1) + 1;

  const folder = placement === "HERO" ? "hero" : "login";

  try {
    for (const file of files) {
      const { url } = await saveImage(file, folder);
      await prisma.slide.create({
        data: {
          placement,
          src: url,
          alt: text(formData, "alt") ?? "St. Paul's Chapel Community Choir",
          caption: text(formData, "caption"),
          kicker: text(formData, "kicker"),
          title: text(formData, "title"),
          focus: text(formData, "focus"),
          sortOrder: order++,
        },
      });
    }
  } catch {
    return { error: "Upload failed — please try again." };
  }

  refresh(placement);
  return { ok: true };
}

export async function updateSlide(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  await requireSession("ADMIN");
  const placement = placementOf(formData);
  const id = String(formData.get("id"));

  await prisma.slide.update({
    where: { id },
    data: {
      alt: text(formData, "alt") ?? "St. Paul's Chapel Community Choir",
      caption: text(formData, "caption"),
      kicker: text(formData, "kicker"),
      title: text(formData, "title"),
      focus: text(formData, "focus"),
    },
  });

  refresh(placement);
  return { ok: true };
}

export async function toggleSlide(formData: FormData) {
  await requireSession("ADMIN");
  const id = String(formData.get("id"));
  const slide = await prisma.slide.findUnique({ where: { id } });
  if (!slide) return;

  await prisma.slide.update({
    where: { id },
    data: { isActive: !slide.isActive },
  });
  refresh(slide.placement);
}

export async function moveSlide(formData: FormData) {
  await requireSession("ADMIN");
  const id = String(formData.get("id"));
  const direction = String(formData.get("direction")) === "up" ? -1 : 1;

  const slide = await prisma.slide.findUnique({ where: { id } });
  if (!slide) return;

  const slides = await prisma.slide.findMany({
    where: { placement: slide.placement },
    orderBy: { sortOrder: "asc" },
  });
  const index = slides.findIndex((s) => s.id === id);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= slides.length) return;

  await prisma.$transaction([
    prisma.slide.update({
      where: { id: slides[index].id },
      data: { sortOrder: target },
    }),
    prisma.slide.update({
      where: { id: slides[target].id },
      data: { sortOrder: index },
    }),
  ]);
  refresh(slide.placement);
}

export async function deleteSlide(formData: FormData) {
  await requireSession("ADMIN");
  const id = String(formData.get("id"));
  const slide = await prisma.slide.findUnique({ where: { id } });
  if (!slide) return;

  await prisma.slide.delete({ where: { id } });
  await deleteImage(slide.src);
  refresh(slide.placement);
}
