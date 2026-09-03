import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { GALLERY_PREVIEW } from "@/lib/images";
import { LoginForm } from "./login-form";
import type { Slide } from "./login-carousel";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

async function getSlides(): Promise<Slide[]> {
  try {
    const rows = await prisma.slide.findMany({
      where: { placement: "LOGIN", isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length > 0) {
      return rows.map((r) => ({ src: r.src, alt: r.alt ?? "", caption: r.caption }));
    }
  } catch {
    // Fall back to bundled photos when the database is unreachable.
  }
  return GALLERY_PREVIEW.map((p) => ({ src: p.src, alt: p.alt, caption: null }));
}

export default async function LoginPage() {
  const slides = await getSlides();
  return (
    <Suspense>
      <LoginForm slides={slides} />
    </Suspense>
  );
}
