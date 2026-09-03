import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { MemberForm } from "../member-form";

export const metadata: Metadata = { title: "Edit member" };
export const dynamic = "force-dynamic";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession("TECHNICAL");
  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) notFound();

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">Edit member</Typography>
        <Typography color="text.secondary">
          {member.firstName} {member.lastName}
        </Typography>
      </Box>

      <MemberForm
        member={{
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email ?? "",
          phone: member.phone ?? "",
          voice: member.voice ?? "",
          jumuiya: member.jumuiya ?? "",
          joinedOn: member.joinedOn ? member.joinedOn.toISOString().slice(0, 10) : "",
          notes: member.notes ?? "",
          isActive: member.isActive,
          mediaConsent: member.mediaConsent,
        }}
      />
    </Stack>
  );
}
