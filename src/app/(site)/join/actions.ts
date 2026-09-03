"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { joinApplicationSchema } from "@/lib/validation";
import { CONSENT_VERSION } from "@/lib/consent";

export type ApplyState = { ok?: boolean; error?: string };

type Input = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  voice?: string | null;
  startDate?: string | null;
  message?: string | null;
  privacyConsent: boolean;
  mediaConsent: boolean;
};

const VOICE_MAP: Record<string, string> = {
  Soprano: "SOPRANO",
  Alto: "ALTO",
  Tenor: "TENOR",
  Bass: "BASS",
};

export async function submitApplication(input: Input): Promise<ApplyState> {
  if (!input.privacyConsent) {
    return { error: "Please accept the privacy notice so we may hold your details." };
  }

  const parsed = joinApplicationSchema.safeParse({
    ...input,
    phone: input.phone || null,
    voice: input.voice ? (VOICE_MAP[input.voice] ?? "OTHER") : null,
    startDate: input.startDate || null,
    message: input.message || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  try {
    await prisma.joinApplication.create({
      data: {
        ...parsed.data,
        privacyConsent: true,
        mediaConsent: input.mediaConsent,
        consentVersion: CONSENT_VERSION,
        consentAt: new Date(),
      },
    });
    revalidatePath("/admin/applications");
    return { ok: true };
  } catch {
    return {
      error: "Could not reach the choir database just now — please email us instead.",
    };
  }
}
