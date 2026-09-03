import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, NotebookPen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { ensureHtml, postCategoryLabel, readingMinutes } from "@/lib/blog";
import { sanitizePostHtml } from "@/lib/sanitize";
import { formatDate } from "@/lib/utils";

type Params = { slug: string };

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  return prisma.post
    .findFirst({
      where: { slug, status: "PUBLISHED" },
      include: { author: { select: { name: true } } },
    })
    .catch(() => null);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const html = sanitizePostHtml(ensureHtml(post.body));
  const tags = Array.isArray(post.tags) ? (post.tags as string[]) : [];

  return (
    <article>
      <section className="border-b bg-muted/30 py-10 sm:py-14">
        <div className="container max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to the blog
          </Link>
          <div className="mt-4">
            <Badge variant="secondary">{postCategoryLabel(post.category)}</Badge>
          </div>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-primary sm:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-lg leading-relaxed text-foreground/80">
              {post.excerpt}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {post.publishedAt ? formatDate(post.publishedAt) : ""}
            <span>·</span>
            {readingMinutes(post.body)} min read
            {post.author?.name && (
              <>
                <span>·</span>
                <span>{post.author.name}</span>
              </>
            )}
          </div>
        </div>
      </section>

      {post.coverImage && (
        <div className="container max-w-4xl">
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted">
            <Image
              src={post.coverImage}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 900px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}

      <section className="py-10 sm:py-14">
        <div className="container max-w-3xl">
          {html.length === 0 ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <NotebookPen className="h-4 w-4" /> This post has no content yet.
            </p>
          ) : (
            <div
              className="choir-prose"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}

          {tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2 border-t pt-6">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </section>
    </article>
  );
}
