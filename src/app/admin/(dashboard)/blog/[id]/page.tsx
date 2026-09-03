import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { PostEditor } from "../post-editor";

export const metadata: Metadata = { title: "Edit post" };
export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession("TECHNICAL");
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  const tags = Array.isArray(post.tags) ? (post.tags as string[]) : [];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontSize: { xs: "1.6rem", sm: "2.125rem" } }}>
          Edit post
        </Typography>
        <Typography color="text.secondary">{post.title}</Typography>
      </Box>

      <PostEditor
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          body: post.body,
          category: post.category,
          status: post.status,
          tags: tags.join(", "),
          coverImage: post.coverImage,
        }}
      />
    </Stack>
  );
}
