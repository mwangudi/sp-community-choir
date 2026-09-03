"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { proposalReviewSchema } from "@/lib/validation";

export async function reviewProposal(formData: FormData) {
  const session = await requireSession("TECHNICAL");

  const parsed = proposalReviewSchema.safeParse({
    status: formData.get("status"),
    reviewerNote: formData.get("reviewerNote") || null,
  });
  if (!parsed.success) return;

  const id = String(formData.get("id"));
  await prisma.songProposal.update({
    where: { id },
    data: {
      status: parsed.data.status,
      reviewerNote: parsed.data.reviewerNote,
      reviewedById: session.sub,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/admin/proposals");
}
