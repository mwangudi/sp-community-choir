"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Box, Typography } from "@mui/material";

export type Slide = { src: string; alt: string; caption: string | null };

export function LoginCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      6000,
    );
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <Box sx={{ position: "absolute", inset: 0 }}>
      {slides.map((slide, i) => (
        <Box
          key={slide.src}
          sx={{
            position: "absolute",
            inset: 0,
            opacity: i === index ? 1 : 0,
            transition: "opacity 900ms ease",
          }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            sizes="50vw"
            style={{ objectFit: "cover" }}
          />
        </Box>
      ))}

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(140,3,27,0.75) 0%, rgba(140,3,27,0.55) 45%, rgba(30,6,10,0.92) 100%)",
        }}
      />

      {slides[index]?.caption && (
        <Typography
          sx={{
            position: "absolute",
            right: 48,
            bottom: 78,
            textAlign: "right",
            color: "#FDB321",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {slides[index].caption}
        </Typography>
      )}

      {slides.length > 1 && (
        <Box
          sx={{
            position: "absolute",
            right: 48,
            bottom: 52,
            display: "flex",
            justifyContent: "flex-end",
            gap: 0.75,
          }}
        >
          {slides.map((s, i) => (
            <Box
              key={s.src}
              onClick={() => setIndex(i)}
              sx={{
                width: i === index ? 26 : 8,
                height: 4,
                borderRadius: 2,
                cursor: "pointer",
                bgcolor: i === index ? "#FDB321" : "rgba(255,255,255,0.45)",
                transition: "all 300ms ease",
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
