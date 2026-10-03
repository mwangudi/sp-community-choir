import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { renderPagePdf } from "@/lib/server/pdf";
import { contentDisposition, worshipAidFileName } from "@/lib/worship-aid";

// Spawns a browser, so this cannot run on the edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireSession("TECHNICAL");

  const { id } = await params;
  const plan = await prisma.massPlan.findUnique({
    where: { id },
    select: { date: true, kind: true, name: true, year: true },
  });
  if (!plan) notFound();

  const url = new URL(request.url);
  const download = url.searchParams.get("download") === "1";
  const name = worshipAidFileName(plan);

  // Render over loopback rather than the public URL: the browser has to fetch
  // the page's own assets, and the domain may not resolve from the server.
  const origin = `http://127.0.0.1:${process.env.PORT ?? 3100}`;

  try {
    const pdf = await renderPagePdf(
      `${origin}/admin/worship-aid/${id}`,
      request.headers.get("cookie") ?? "",
    );

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition(download ? "attachment" : "inline", name),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    // The reason is for the server log; the reader gets something actionable.
    console.error("worship aid PDF failed:", error);
    return new Response(
      "The PDF could not be produced. Use Print and choose Save as PDF instead.",
      { status: 500, headers: { "Content-Type": "text/plain" } },
    );
  }
}
