"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  src: string;
  alt: string;
  kicker?: string;
  title?: string;
  /**
   * CSS object-position for this photo, e.g. "center 30%".
   * Lets each image be anchored on its faces, since the photos have
   * very different aspect ratios (square group shots vs. wide panoramas).
   */
  focus?: string;
};

export function HeroCarousel({
  slides,
  intervalMs = 5000,
  className = "",
}: {
  slides: Slide[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [paused, intervalMs, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl bg-muted shadow-xl ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Choir photos"
    >
      {slides.map((s, i) => (
        <div
          key={s.src}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={s.src}
            alt={s.alt}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 60vw, 100vw"
            style={{ objectPosition: s.focus ?? "center" }}
            className="object-cover"
          />
          {(s.kicker || s.title) && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/85 via-primary/40 to-transparent p-5 pb-6 text-right sm:p-8 sm:pb-8">
              <div className="ml-auto max-w-[70%] sm:max-w-[65%]">
                {s.kicker && (
                  <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold sm:text-xs">
                    {s.kicker}
                  </div>
                )}
                {s.title && (
                  <div className="mt-1 font-serif text-2xl font-semibold leading-tight text-primary-foreground drop-shadow sm:text-3xl lg:text-4xl">
                    {s.title}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Tint */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-transparent" />

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-primary shadow opacity-0 transition-opacity hover:bg-background group-hover:opacity-100 sm:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-primary shadow opacity-0 transition-opacity hover:bg-background group-hover:opacity-100 sm:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-6 bg-background"
                  : "w-1.5 bg-background/60 hover:bg-background/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
