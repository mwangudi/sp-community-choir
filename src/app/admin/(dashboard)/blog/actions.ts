"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PostCategory, PostStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { slugify } from "@/lib/blog";
import { htmlToText, sanitizePostHtml } from "@/lib/sanitize";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, deleteImage, saveImage } from "@/lib/storage";

export type PostFormState = { error?: string };

export async function savePost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const session = await requireSession("TECHNICAL");

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const body = sanitizePostHtml(String(formData.get("body") ?? ""));
  if (title.length < 3) return { error: "Give the post a title" };
  if (htmlToText(body).length < 10) return { error: "Write a little more before saving" };

  const status = String(formData.get("status") ?? "DRAFT") as PostStatus;
  const category = String(formData.get("category") ?? "NEWS") as PostCategory;
  const excerpt = String(formData.get("excerpt") ?? "").trim() || null;
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  let slug = slugify(String(formData.get("slug") ?? "") || title);
  const clash = await prisma.post.findFirst({
    where: { slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const cover = formData.get("cover");
  let coverImage: string | undefined;
  if (cover instanceof File && cover.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.has(cover.type)) {
      return { error: "Cover must be a JPG, PNG, WebP or AVIF image" };
    }
    if (cover.size > MAX_IMAGE_BYTES) return { error: "Cover must be under 5 MB" };
    try {
      coverImage = (await saveImage(cover, "blog")).url;
    } catch {
      return { error: "Could not upload the cover image" };
    }
  }

  const data = {
    title,
    slug,
    excerpt,
    body,
    category,
    status,
    tags,
    ...(coverImage ? { coverImage } : {}),
    publishedAt: status === "PUBLISHED" ? new Date() : null,
  };

  if (id) {
    const existing = await prisma.post.findUnique({ where: { id } });
    await prisma.post.update({
      where: { id },
      data: {
        ...data,
        // Keep the original publication date once a post has gone live.
        publishedAt:
          status === "PUBLISHED" ? (existing?.publishedAt ?? new Date()) : null,
      },
    });
    if (coverImage && existing?.coverImage) await deleteImage(existing.coverImage);
  } else {
    await prisma.post.create({ data: { ...data, authorId: session.sub } });
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function deletePost(formData: FormData) {
  await requireSession("ADMIN");
  const id = String(formData.get("id"));
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return;

  await prisma.post.delete({ where: { id } });
  if (post.coverImage) await deleteImage(post.coverImage);

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function togglePublish(formData: FormData) {
  await requireSession("TECHNICAL");
  const id = String(formData.get("id"));
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return;

  const publish = post.status !== "PUBLISHED";
  await prisma.post.update({
    where: { id },
    data: {
      status: publish ? "PUBLISHED" : "DRAFT",
      publishedAt: publish ? (post.publishedAt ?? new Date()) : null,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
