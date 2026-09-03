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

/** Accept or decline a single proposed song. */
export async function reviewProposalItem(formData: FormData) {
  const session = await requireSession("TECHNICAL");

  const itemId = String(formData.get("itemId"));
  const status = String(formData.get("status"));
  if (status !== "ACCEPTED" && status !== "DECLINED" && status !== "PENDING") return;

  const item = await prisma.songProposalItem.update({
    where: { id: itemId },
    data: { status },
    select: { proposalId: true },
  });

  // Once every song has been looked at, the proposal itself is no longer pending.
  const pending = await prisma.songProposalItem.count({
    where: { proposalId: item.proposalId, status: "PENDING" },
  });
  if (pending === 0) {
    const accepted = await prisma.songProposalItem.count({
      where: { proposalId: item.proposalId, status: "ACCEPTED" },
    });
    await prisma.songProposal.update({
      where: { id: item.proposalId },
      data: {
        status: accepted > 0 ? "ACCEPTED" : "DECLINED",
        reviewedById: session.sub,
        reviewedAt: new Date(),
      },
    });
  }

  revalidatePath("/admin/proposals");
}

/**
 * Copies the accepted songs into the Mass plan for that Sunday, creating the
 * plan if it does not exist yet. Songs already in the plan are left alone.
 */
export async function addAcceptedToPlan(formData: FormData) {
  const session = await requireSession("TECHNICAL");
  const proposalId = String(formData.get("id"));

  const proposal = await prisma.songProposal.findUnique({
    where: { id: proposalId },
    include: {
      items: { where: { status: "ACCEPTED" }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!proposal || proposal.items.length === 0) return;

  const plan = await prisma.massPlan.upsert({
    where: { date: proposal.sundayDate },
    update: {},
    create: {
      date: proposal.sundayDate,
      name: proposal.sundayName,
      year: proposal.lectionaryYear ?? "A",
      status: "DRAFT",
      createdById: session.sub,
    },
    include: { items: true },
  });

  const key = (part: string, song: string) => `${part}|${song.trim().toLowerCase()}`;
  const already = new Set(plan.items.map((i) => key(i.part, i.song)));
  const missing = proposal.items.filter((i) => !already.has(key(i.part, i.song)));
  if (missing.length === 0) return;

  const nextOrder = plan.items.reduce((n, i) => Math.max(n, i.sortOrder + 1), 0);
  await prisma.massPlanItem.createMany({
    data: missing.map((i, index) => ({
      planId: plan.id,
      part: i.part,
      song: i.song,
      sortOrder: nextOrder + index,
    })),
  });

  revalidatePath("/admin/proposals");
  revalidatePath("/admin/mass-plans");
}
