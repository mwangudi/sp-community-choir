"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  ExternalLink,
  Film,
  ImageOff,
  Play,
  X,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CHOIR } from "@/lib/choir";
import {
  GALLERY_ITEMS,
  YOUTUBE_CHANNEL_URL,
  YOUTUBE_UPLOADS_EMBED_URL,
  filterGallery,
  youtubeEmbedUrl,
  youtubeThumb,
  type GalleryFilter,
  type GalleryItem,
} from "@/lib/gallery";
import { cn } from "@/lib/utils";

const FILTERS: { value: GalleryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "photo", label: "Photos" },
  { value: "video", label: "Videos" },
];

export default function GalleryPage() {
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [active, setActive] = useState<GalleryItem | null>(null);

  const items = useMemo(() => filterGallery(GALLERY_ITEMS, filter), [filter]);

  // Close lightbox on Esc.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <>
      {/* Hero */}
      <section className="border-b bg-muted/30 py-12 sm:py-16">
        <div className="container max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
            <Camera className="h-3.5 w-3.5" />
            Gallery
          </div>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-primary sm:text-5xl">
            Photos &amp; videos
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/85 sm:text-lg">
            Moments from concerts, liturgies, rehearsals and choir trips.
            Subscribe to our YouTube channel to be notified every time we
            release a new recording.
          </p>
        </div>
      </section>

      {/* Channel embed */}
      {YOUTUBE_UPLOADS_EMBED_URL && (
        <section className="border-b py-12 sm:py-14">
          <div className="container">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-primary sm:text-3xl">
                  Latest from our YouTube channel
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Auto-updating playlist — new uploads appear here
                  immediately.
                </p>
              </div>
              <Button asChild variant="outline" className="rounded-full">
                <a
                  href={YOUTUBE_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Youtube className="mr-2 h-4 w-4 text-red-600" />
                  Open channel
                  <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-70" />
                </a>
              </Button>
            </div>
            <div className="mt-6 overflow-hidden rounded-xl border bg-black shadow-sm">
              <div className="relative aspect-video w-full">
                <iframe
                  src={YOUTUBE_UPLOADS_EMBED_URL}
                  title={`${CHOIR.shortName} — YouTube uploads`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter + grid */}
      <section className="py-12 sm:py-16">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-serif text-2xl font-semibold text-primary sm:text-3xl">
              Curated gallery
            </h2>
            <div className="flex gap-1.5">
              {FILTERS.map((f) => {
                const active = filter === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFilter(f.value)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-muted",
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {items.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
              {items.map((item) => (
                <li key={item.slug}>
                  <GalleryTile item={item} onOpen={() => setActive(item)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {active && (
        <Lightbox item={active} onClose={() => setActive(null)} />
      )}
    </>
  );
}

function GalleryTile({
  item,
  onOpen,
}: {
  item: GalleryItem;
  onOpen: () => void;
}) {
  if (item.kind === "photo") {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="group relative block w-full overflow-hidden rounded-xl border bg-muted text-left transition-shadow hover:shadow-md"
      >
        <Image
          src={item.src}
          alt={item.alt}
          width={1200}
          height={900}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="block h-auto w-full transition-transform duration-500 group-hover:scale-105"
        />
        {item.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 text-sm text-white">
            {item.caption}
          </div>
        )}
      </button>
    );
  }

  // video
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block aspect-video w-full overflow-hidden rounded-xl border bg-muted text-left transition-shadow hover:shadow-md"
    >
      <Image
        src={youtubeThumb(item.youtubeId)}
        alt={item.title}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform group-hover:scale-110">
          <Play className="h-6 w-6 translate-x-0.5 fill-current" />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-sm font-medium text-white">
        {item.title}
      </div>
    </button>
  );
}

function Lightbox({
  item,
  onClose,
}: {
  item: GalleryItem;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.kind === "photo" ? item.alt : item.title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl"
      >
        {item.kind === "photo" ? (
          <figure className="space-y-3">
            <div className="relative mx-auto aspect-[4/3] max-h-[80vh] w-full overflow-hidden rounded-xl bg-black">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            {item.caption && (
              <figcaption className="text-center text-sm text-white/90">
                {item.caption}
              </figcaption>
            )}
          </figure>
        ) : (
          <div className="space-y-3">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                src={`${youtubeEmbedUrl(item.youtubeId)}?autoplay=1`}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
            <p className="text-center text-sm font-medium text-white/90">
              {item.title}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="mt-8">
      <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ImageOff className="h-6 w-6 text-muted-foreground" />
        </span>
        <p className="font-serif text-xl font-semibold text-primary">
          The curated gallery is empty
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          We&apos;re still gathering photos and videos. In the meantime,
          everything we&apos;ve published lives on our YouTube channel above —
          subscribe so you don&apos;t miss a release.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Youtube className="mr-2 h-4 w-4 text-red-600" />
              YouTube channel
            </a>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/contact">
              <Film className="mr-2 h-4 w-4" />
              Share a photo/video
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
