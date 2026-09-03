"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { applicationStatusSchema } from "@/lib/validation";

export async function setApplicationStatus(formData: FormData) {
  await requireSession("TECHNICAL");
  const parsed = applicationStatusSchema.safeParse({ status: formData.get("status") });
  if (!parsed.success) return;

  await prisma.joinApplication.update({
    where: { id: String(formData.get("id")) },
    data: { status: parsed.data.status },
  });
  revalidatePath("/admin/applications");
}

/** Right-to-erasure: removes the applicant's record entirely. */
export async function deleteApplication(formData: FormData) {
  await requireSession("ADMIN");
  await prisma.joinApplication.delete({
    where: { id: String(formData.get("id")) },
  });
  revalidatePath("/admin/applications");
}
