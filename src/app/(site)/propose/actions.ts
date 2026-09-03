"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { proposalSchema } from "@/lib/validation";
import { toMassPartEnum } from "@/lib/mass-parts";

export type ProposalSubmitState = {
  ok?: boolean;
  error?: string;
  id?: string;
};

type Input = {
  sundayDate: string;
  sundayName: string;
  lectionaryYear?: string | null;
  proposerName: string;
  proposerEmail?: string | null;
  voice?: string | null;
  note?: string | null;
  items: { part: string; song: string }[];
};

/** Saves a member's song proposal for the technical team to review. */
export async function submitProposal(
  input: Input,
): Promise<ProposalSubmitState> {
  const parsed = proposalSchema.safeParse({
    ...input,
    voice: input.voice ? input.voice.toUpperCase() : null,
    items: input.items.map((item, i) => ({
      part: toMassPartEnum(item.part),
      song: item.song.trim(),
      sortOrder: i,
    })),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  const data = parsed.data;

  try {
    const proposal = await prisma.songProposal.create({
      data: {
        sundayDate: data.sundayDate,
        sundayName: data.sundayName,
        lectionaryYear: data.lectionaryYear ?? null,
        proposerName: data.proposerName,
        proposerEmail: data.proposerEmail || null,
        voice: data.voice ?? null,
        note: data.note ?? null,
        items: { create: data.items },
      },
    });
    revalidatePath("/admin/proposals");
    return { ok: true, id: proposal.id };
  } catch {
    return {
      error:
        "Could not reach the choir database just now — please use WhatsApp or email instead.",
    };
  }
}
