import "server-only";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { del, put } from "@vercel/blob";
import sharp from "sharp";

/** Vercel's filesystem is read-only, so uploads go to Blob when a token is present. */
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const LOCAL_ROOT = path.join(process.cwd(), "public", "uploads");

export const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
]);

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type StoredFile = { url: string };

/** Longest side kept; phone photos arrive at 4000px+ and nobody views them that large. */
const MAX_EDGE = 2560;

/**
 * Re-encodes an upload so nothing but pixels is kept. Phone photos carry EXIF
 * — often the GPS position where a member stood — and sharp writes no
 * metadata unless asked. Orientation is applied first, since dropping the
 * EXIF would otherwise leave portrait shots on their side. Decoding also
 * proves the file really is the image it claims to be.
 */
async function cleanImage(file: File, ext: string): Promise<Buffer> {
  const image = sharp(Buffer.from(await file.arrayBuffer()), { failOn: "error" })
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true });
  switch (ext) {
    case ".png":
      return image.png().toBuffer();
    case ".webp":
      return image.webp({ quality: 88 }).toBuffer();
    case ".avif":
      return image.avif({ quality: 60 }).toBuffer();
    default:
      return image.jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  }
}

/**
 * Persists an uploaded image and returns its public URL.
 * `folder` is a short slug such as "login".
 */
export async function saveImage(file: File, folder: string): Promise<StoredFile> {
  const ext = ALLOWED_IMAGE_TYPES.get(file.type);
  if (!ext) throw new Error("Unsupported image type");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image is too large");

  // Never reuse the client-supplied filename.
  const name = `${randomUUID()}${ext}`;
  const data = await cleanImage(file, ext).catch(() => {
    throw new Error("That file could not be read as an image");
  });

  if (useBlob) {
    const blob = await put(`${folder}/${name}`, data, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return { url: blob.url };
  }

  const dir = path.join(LOCAL_ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), data);
  return { url: `/uploads/${folder}/${name}` };
}

/** Best-effort removal; a missing file should never block the delete. */
export async function deleteImage(url: string): Promise<void> {
  try {
    if (url.startsWith("http")) {
      await del(url);
      return;
    }
    if (url.startsWith("/uploads/")) {
      await unlink(path.join(process.cwd(), "public", url.replace(/^\//, "")));
    }
  } catch {
    // Ignore — the database row is the source of truth.
  }
}
