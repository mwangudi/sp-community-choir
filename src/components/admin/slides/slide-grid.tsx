import Image from "next/image";
import type { Slide } from "@prisma/client";
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { ArrowDown, ArrowUp, Eye, EyeOff, ImageIcon, Trash2 } from "lucide-react";
import { SlideEditor } from "./slide-editor";
import { deleteSlide, moveSlide, toggleSlide } from "./actions";

export function SlideGrid({
  slides,
  placement,
  emptyHint,
}: {
  slides: Slide[];
  placement: "LOGIN" | "HERO";
  emptyHint: string;
}) {
  if (slides.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: "center", py: 12 }}>
          <ImageIcon size={32} style={{ opacity: 0.35 }} />
          <Typography sx={{ mt: 2, fontWeight: 600 }}>No photos yet</Typography>
          <Typography variant="body2" color="text.secondary">
            {emptyHint}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gap: 6,
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
      }}
    >
      {slides.map((slide, i) => (
        <Card key={slide.id}>
          <Box sx={{ position: "relative", aspectRatio: "16 / 10", bgcolor: "action.hover" }}>
            <Image
              src={slide.src}
              alt={slide.alt ?? ""}
              fill
              sizes="(min-width: 1200px) 33vw, (min-width: 600px) 50vw, 100vw"
              style={{
                objectFit: "cover",
                objectPosition: slide.focus ?? "center",
                opacity: slide.isActive ? 1 : 0.4,
              }}
            />
            {!slide.isActive && (
              <Chip
                size="small"
                label="Hidden"
                sx={{ position: "absolute", top: 8, left: 8 }}
              />
            )}
          </Box>
          <CardContent>
            {placement === "HERO" && (slide.kicker || slide.title) && (
              <Box sx={{ mb: 2 }}>
                {slide.kicker && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      color: "secondary.dark",
                      fontWeight: 600,
                    }}
                  >
                    {slide.kicker}
                  </Typography>
                )}
                {slide.title && (
                  <Typography sx={{ fontWeight: 500 }}>{slide.title}</Typography>
                )}
              </Box>
            )}
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {slide.caption || "No caption"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Position {i + 1} of {slides.length}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 3, flexWrap: "wrap", gap: 1 }}>
              <form action={moveSlide}>
                <input type="hidden" name="id" value={slide.id} />
                <input type="hidden" name="direction" value="up" />
                <Button type="submit" size="small" disabled={i === 0}>
                  <ArrowUp size={15} />
                </Button>
              </form>
              <form action={moveSlide}>
                <input type="hidden" name="id" value={slide.id} />
                <input type="hidden" name="direction" value="down" />
                <Button type="submit" size="small" disabled={i === slides.length - 1}>
                  <ArrowDown size={15} />
                </Button>
              </form>
              <form action={toggleSlide}>
                <input type="hidden" name="id" value={slide.id} />
                <Button type="submit" size="small">
                  {slide.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                </Button>
              </form>
              <SlideEditor
                placement={placement}
                slide={{
                  id: slide.id,
                  alt: slide.alt ?? "",
                  caption: slide.caption ?? "",
                  kicker: slide.kicker ?? "",
                  title: slide.title ?? "",
                  focus: slide.focus ?? "",
                }}
              />
              <form action={deleteSlide}>
                <input type="hidden" name="id" value={slide.id} />
                <Button type="submit" size="small" color="error">
                  <Trash2 size={15} />
                </Button>
              </form>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
