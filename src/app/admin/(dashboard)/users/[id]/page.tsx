import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { UserForm } from "../user-form";

export const metadata: Metadata = { title: "Edit user" };
export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession("ADMIN");
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">Edit user</Typography>
        <Typography color="text.secondary">{user.email}</Typography>
      </Box>

      <UserForm
        isSelf={user.id === session.sub}
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          voice: user.voice ?? "",
          isActive: user.isActive,
        }}
      />
    </Stack>
  );
}
