"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Voice } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { CONSENT_VERSION } from "@/lib/consent";

export type MemberFormState = { error?: string };

function text(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

export async function saveMember(
  _prev: MemberFormState,
  formData: FormData,
): Promise<MemberFormState> {
  await requireSession("TECHNICAL");

  const id = String(formData.get("id") ?? "").trim();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  if (!firstName || !lastName) return { error: "First and last name are required" };

  const email = text(formData, "email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "That email address does not look right" };
  }

  const joinedOnRaw = String(formData.get("joinedOn") ?? "").trim();
  const mediaConsent = formData.get("mediaConsent") === "on";

  const existing = id
    ? await prisma.member.findUnique({ where: { id }, select: { mediaConsent: true } })
    : null;

  const data = {
    firstName,
    lastName,
    email,
    phone: text(formData, "phone"),
    voice: (text(formData, "voice") as Voice | null) ?? null,
    jumuiya: text(formData, "jumuiya"),
    notes: text(formData, "notes"),
    isActive: formData.get("isActive") === "on",
    mediaConsent,
    joinedOn: joinedOnRaw ? new Date(`${joinedOnRaw}T00:00:00.000Z`) : null,
    // Stamp the version and date only when consent is newly given.
    ...(mediaConsent && !existing?.mediaConsent
      ? { consentVersion: CONSENT_VERSION, consentAt: new Date() }
      : {}),
    ...(!mediaConsent ? { consentVersion: null, consentAt: null } : {}),
  };

  if (id) {
    await prisma.member.update({ where: { id }, data });
  } else {
    await prisma.member.create({ data });
  }

  revalidatePath("/admin/members");
  redirect("/admin/members");
}

export async function deleteMember(formData: FormData) {
  await requireSession("ADMIN");
  const id = String(formData.get("id"));

  await prisma.member.delete({ where: { id } });

  revalidatePath("/admin/members");
}
