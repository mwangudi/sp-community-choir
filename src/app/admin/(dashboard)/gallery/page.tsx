import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Image as ImageIcon, Pencil, Plus, Youtube } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { PhotoPreview } from "./photo-preview";
import { deleteGalleryItem, toggleGalleryPublished } from "./actions";

export const metadata: Metadata = { title: "Gallery" };
export const dynamic = "force-dynamic";

const PER_PAGE = 24;

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
] as const;

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await requireSession("TECHNICAL");

  const { page: rawPage, status: rawStatus } = await searchParams;
  const status = STATUS_FILTERS.some((f) => f.value === rawStatus)
    ? (rawStatus as string)
    : "all";
  const where =
    status === "all" ? {} : { isPublished: status === "published" };

  const total = await prisma.galleryItem.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(Math.max(Number(rawPage) || 1, 1), pageCount);

  const items = await prisma.galleryItem.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    skip: (page - 1) * PER_PAGE,
    take: PER_PAGE,
  });

  const counts = {
    all: await prisma.galleryItem.count(),
    published: await prisma.galleryItem.count({ where: { isPublished: true } }),
    hidden: await prisma.galleryItem.count({ where: { isPublished: false } }),
  };

  return (
    <Stack spacing={6}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={4}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography variant="h4">Gallery</Typography>
          <Typography color="text.secondary">
            Photos and videos shown on the public gallery.
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/admin/gallery/new"
          variant="contained"
          startIcon={<Plus size={16} />}
        >
          Add an item
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 2 }}>
        {STATUS_FILTERS.map((f) => (
          <Chip
            key={f.value}
            component={Link}
            href={f.value === "all" ? "/admin/gallery" : `/admin/gallery?status=${f.value}`}
            clickable
            label={`${f.label} (${counts[f.value]})`}
            color={status === f.value ? "primary" : "default"}
            variant={status === f.value ? "filled" : "outlined"}
          />
        ))}
      </Stack>

      {items.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 12 }}>
            <ImageIcon size={32} style={{ opacity: 0.35 }} />
            <Typography sx={{ mt: 2 }}>Nothing in the gallery yet</Typography>
            <Button
              component={Link}
              href="/admin/gallery/new"
              sx={{ mt: 3 }}
              variant="contained"
            >
              Add the first one
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 6,
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" },
          }}
        >
          {items.map((item) => (
            <Card key={item.id}>
              <Box sx={{ position: "relative", aspectRatio: "16 / 10", bgcolor: "action.hover" }}>
                {item.kind === "PHOTO" && item.src ? (
                  <Image
                    src={item.src}
                    alt={item.alt ?? ""}
                    fill
                    sizes="(min-width: 1200px) 25vw, 50vw"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <Box sx={{ display: "grid", placeItems: "center", height: "100%" }}>
                    <Youtube size={28} opacity={0.4} />
                  </Box>
                )}
              </Box>
              <CardContent>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                  <Chip size="small" variant="outlined" label={item.kind} />
                  {!item.isPublished && <Chip size="small" color="warning" label="Hidden" />}
                </Stack>
                <Typography variant="body2" sx={{ mt: 2, fontWeight: 500 }}>
                  {item.title ?? item.alt ?? item.slug}
                </Typography>
                {item.caption && (
                  <Typography variant="caption" color="text.secondary">
                    {item.caption}
                  </Typography>
                )}
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 3, alignItems: "center", justifyContent: "flex-end" }}
                >
                  <form action={toggleGalleryPublished} style={{ marginRight: "auto" }}>
                    <input type="hidden" name="id" value={item.id} />
                    <Button type="submit" size="small" variant="outlined">
                      {item.isPublished ? "Hide" : "Publish"}
                    </Button>
                  </form>
                  {item.kind === "PHOTO" && item.src && (
                    <PhotoPreview
                      src={item.src}
                      alt={item.alt ?? ""}
                      title={item.title ?? item.alt ?? item.slug}
                      caption={item.caption}
                      takenOn={item.takenOn?.toISOString().slice(0, 10) ?? null}
                    />
                  )}
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      component={Link}
                      href={`/admin/gallery/${item.id}`}
                      aria-label={`Edit ${item.title ?? item.slug}`}
                    >
                      <Pencil size={16} />
                    </IconButton>
                  </Tooltip>
                  <ConfirmDelete
                    action={deleteGalleryItem}
                    id={item.id}
                    name={item.title ?? item.slug}
                    note="The item is removed from the gallery, and any uploaded file is deleted."
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {items.length > 0 && (
        <PaginationBar
          page={page}
          pageCount={pageCount}
          total={total}
          shown={items.length}
          basePath="/admin/gallery"
          params={{ status: status === "all" ? undefined : status }}
          label="items"
        />
      )}
    </Stack>
  );
}
