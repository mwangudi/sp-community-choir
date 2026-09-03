import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { PostCategory } from "@prisma/client";
import { CalendarDays, NotebookPen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { POST_CATEGORIES, postCategoryLabel, readingMinutes } from "@/lib/blog";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "News, event write-ups, reflections and patron saint features from St. Paul's Chapel Community Choir.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = POST_CATEGORIES.includes(category as PostCategory)
    ? (category as PostCategory)
    : undefined;

  const posts = await prisma.post
    .findMany({
      where: { status: "PUBLISHED", ...(active ? { category: active } : {}) },
      orderBy: { publishedAt: "desc" },
      include: { author: { select: { name: true } } },
      take: 60,
    })
    .catch(() => []);

  return (
    <>
      <section className="border-b bg-muted/30 py-14 sm:py-16">
        <div className="container max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
            <NotebookPen className="h-3.5 w-3.5" />
            Blog
          </div>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-primary sm:text-5xl">
            From the choir
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/85 sm:text-lg">
            Event write-ups, reflections on the music we sing, and the saints
            who keep us company.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <CategoryChip href="/blog" label="All" active={!active} />
            {POST_CATEGORIES.map((c) => (
              <CategoryChip
                key={c}
                href={`/blog?category=${c}`}
                label={postCategoryLabel(c)}
                active={active === c}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container">
          {posts.length === 0 ? (
            <p className="text-muted-foreground">
              No posts here yet — check back soon.
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-[16/10] w-full bg-muted">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-primary/5">
                          <NotebookPen className="h-8 w-8 text-primary/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <Badge variant="secondary" className="w-fit">
                        {postCategoryLabel(post.category)}
                      </Badge>
                      <h2 className="mt-3 font-serif text-xl font-semibold leading-snug text-primary">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground/75">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {post.publishedAt ? formatDate(post.publishedAt) : "Draft"}
                        <span>·</span>
                        {readingMinutes(post.body)} min read
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

function CategoryChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
          : "rounded-full border px-3 py-1.5 text-sm font-medium text-foreground/80 hover:bg-muted"
      }
    >
      {label}
    </Link>
  );
}
