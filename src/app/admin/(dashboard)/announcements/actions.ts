"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export type AnnouncementFormState = { error?: string };

function text(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

/** "" → null; anything else must parse. */
function when(formData: FormData, key: string): Date | null | "invalid" {
  const raw = text(formData, key);
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? "invalid" : d;
}

// The banner sits in the site layout, so every public page shows it.
function refresh() {
  revalidatePath("/admin/announcements");
  revalidatePath("/", "layout");
}

export async function saveAnnouncement(
  _prev: AnnouncementFormState,
  formData: FormData,
): Promise<AnnouncementFormState> {
  await requireSession("TECHNICAL");

  const id = String(formData.get("id") ?? "").trim();
  const message = String(formData.get("message") ?? "").replace(/\s+/g, " ").trim();
  if (message.length < 5) return { error: "Write the announcement" };

  const href = text(formData, "href");
  if (href && !/^(https?:\/\/|\/|mailto:|tel:)/.test(href)) {
    return { error: "The link must start with https://, / (a page on this site), mailto: or tel:" };
  }

  const startsAt = when(formData, "startsAt");
  const endsAt = when(formData, "endsAt");
  if (startsAt === "invalid" || endsAt === "invalid") return { error: "A date is not valid" };
  if (startsAt && endsAt && endsAt <= startsAt) {
    return { error: "It has to stop showing after it starts" };
  }

  const data = {
    message,
    href,
    linkLabel: href ? text(formData, "linkLabel") : null,
    startsAt,
    endsAt,
    isActive: formData.get("isActive") === "on",
    sortOrder: Number(formData.get("sortOrder")) || 0,
  };

  if (id) {
    await prisma.announcement.update({ where: { id }, data });
  } else {
    await prisma.announcement.create({ data });
  }

  refresh();
  redirect("/admin/announcements");
}

export async function toggleAnnouncement(formData: FormData) {
  await requireSession("TECHNICAL");
  const id = String(formData.get("id"));
  const a = await prisma.announcement.findUnique({ where: { id }, select: { isActive: true } });
  if (!a) return;
  await prisma.announcement.update({ where: { id }, data: { isActive: !a.isActive } });
  refresh();
}

export async function deleteAnnouncement(formData: FormData) {
  await requireSession("TECHNICAL");
  await prisma.announcement.delete({ where: { id: String(formData.get("id")) } });
  refresh();
}
