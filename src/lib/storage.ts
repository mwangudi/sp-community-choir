import "server-only";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { del, put } from "@vercel/blob";

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

  if (useBlob) {
    const blob = await put(`${folder}/${name}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return { url: blob.url };
  }

  const dir = path.join(LOCAL_ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
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
