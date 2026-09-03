"use client";

import { useActionState, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ImageUp, Save } from "lucide-react";
import { POST_CATEGORIES, postCategoryLabel } from "@/lib/blog";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  isRequired,
  useFieldValidation,
} from "@/components/admin/use-field-validation";
import { savePost, type PostFormState } from "./actions";

export type PostDraft = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  status: string;
  tags: string;
  coverImage?: string | null;
};

export function PostEditor({ post }: { post: PostDraft }) {
  const [state, formAction, pending] = useActionState<PostFormState, FormData>(
    savePost,
    {},
  );
  const [coverName, setCoverName] = useState<string | null>(null);
  const { formProps, field } = useFieldValidation({
    title: isRequired("Title"),
  });

  return (
    <form action={formAction} {...formProps}>
      {post.id && <input type="hidden" name="id" value={post.id} />}

      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          alignItems: "start",
        }}
      >
        <Card>
          <CardContent>
            <Stack spacing={2.5}>
              <TextField
                name="title"
                label="Title"
                placeholder="e.g. Carols at Mater Hospital 2026"
                defaultValue={post.title}
                fullWidth
                {...field("title")}
              />
              <TextField
                name="slug"
                label="URL slug (optional)"
                placeholder="carols-at-mater-2026"
                defaultValue={post.slug}
                helperText="Leave blank to generate one from the title."
                fullWidth
              />
              <TextField
                name="excerpt"
                label="Excerpt"
                placeholder="One or two sentences shown on the blog listing."
                defaultValue={post.excerpt}
                multiline
                minRows={2}
                fullWidth
              />
              <Box>
                <Typography
                  variant="caption"
                  sx={{ display: "block", mb: 0.75, color: "text.secondary", fontWeight: 600 }}
                >
                  Post *
                </Typography>
                <RichTextEditor
                  name="body"
                  defaultValue={post.body}
                  placeholder="Write the post here — use the toolbar for headings, lists and links."
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Publishing
              </Typography>
              <Stack spacing={2.5}>
                <TextField
                  name="status"
                  label="Status"
                  select
                  defaultValue={post.status}
                  fullWidth
                >
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="PUBLISHED">Published</MenuItem>
                </TextField>
                <TextField
                  name="category"
                  label="Category"
                  select
                  defaultValue={post.category}
                  fullWidth
                >
                  {POST_CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {postCategoryLabel(c)}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  name="tags"
                  label="Tags"
                  placeholder="christmas, outreach, carols"
                  defaultValue={post.tags}
                  helperText="Separate with commas."
                  fullWidth
                />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Cover image
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {post.coverImage ? "Upload a new file to replace the current cover." : "Optional, shown on the listing and at the top of the post."}
              </Typography>
              <Button component="label" variant="outlined" startIcon={<ImageUp size={16} />}>
                {coverName ?? "Choose image"}
                <input
                  type="file"
                  name="cover"
                  hidden
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(e) => setCoverName(e.target.files?.[0]?.name ?? null)}
                />
              </Button>
            </CardContent>
          </Card>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={pending}
            startIcon={<Save size={16} />}
          >
            {pending ? "Saving…" : "Save post"}
          </Button>
        </Stack>
      </Box>
    </form>
  );
}
