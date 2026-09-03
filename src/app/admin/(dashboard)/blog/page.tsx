import type { Metadata } from "next";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { NotebookPen, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { postCategoryLabel } from "@/lib/blog";
import { formatDate } from "@/lib/utils";
import { deletePost, togglePublish } from "./actions";

export const metadata: Metadata = { title: "Blog" };
export const dynamic = "force-dynamic";

export default async function BlogAdminPage() {
  const session = await requireSession("TECHNICAL");
  const posts = await prisma.post.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: { author: { select: { name: true } } },
    take: 200,
  });

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontSize: { xs: "1.6rem", sm: "2.125rem" } }}>
            Blog
          </Typography>
          <Typography color="text.secondary">
            Events, reflections, patron saints and choir news.
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/admin/blog/new"
          variant="contained"
          startIcon={<Plus size={16} />}
        >
          New post
        </Button>
      </Stack>

      {posts.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <NotebookPen size={32} style={{ opacity: 0.35 }} />
            <Typography sx={{ mt: 1, fontWeight: 600 }}>No posts yet</Typography>
            <Typography variant="body2" color="text.secondary">
              Write the first one and publish it when you are ready.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1.5}
                  sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                      <Typography variant="h6" sx={{ fontSize: "1.05rem" }}>
                        {post.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={post.status}
                        color={post.status === "PUBLISHED" ? "success" : "default"}
                      />
                      <Chip size="small" variant="outlined" label={postCategoryLabel(post.category)} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {post.publishedAt
                        ? `Published ${formatDate(post.publishedAt)}`
                        : `Updated ${formatDate(post.updatedAt)}`}
                      {post.author?.name ? ` · ${post.author.name}` : ""}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                    <Button
                      component={Link}
                      href={`/admin/blog/${post.id}`}
                      size="small"
                      variant="outlined"
                      startIcon={<Pencil size={14} />}
                    >
                      Edit
                    </Button>
                    {post.status === "PUBLISHED" && (
                      <Button
                        component={Link}
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        size="small"
                      >
                        View
                      </Button>
                    )}
                    <form action={togglePublish}>
                      <input type="hidden" name="id" value={post.id} />
                      <Button type="submit" size="small">
                        {post.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                      </Button>
                    </form>
                    {session.role === "ADMIN" && (
                      <form action={deletePost}>
                        <input type="hidden" name="id" value={post.id} />
                        <Button type="submit" size="small" color="error">
                          Delete
                        </Button>
                      </form>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
