import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/material";
import { requireSession } from "@/lib/auth";
import { PostEditor } from "../post-editor";

export const metadata: Metadata = { title: "New post" };

export default async function NewPostPage() {
  await requireSession("TECHNICAL");

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontSize: { xs: "1.6rem", sm: "2.125rem" } }}>
          New post
        </Typography>
        <Typography color="text.secondary">
          Save as a draft first if you would like someone to read it over.
        </Typography>
      </Box>

      <PostEditor
        post={{
          title: "",
          slug: "",
          excerpt: "",
          body: "",
          category: "NEWS",
          status: "DRAFT",
          tags: "",
        }}
      />
    </Stack>
  );
}
