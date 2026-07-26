import { ImageResponse } from "next/og";
import { CHOIR } from "@/lib/choir";

export const alt = `${CHOIR.name} — ${CHOIR.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social share card (WhatsApp / Facebook / X link previews).
 * Rendered at build time by Next's ImageResponse.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #BC0424 0%, #7d0518 55%, #2b0a10 100%)",
          padding: 72,
          color: "#F7F5F2",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              background: "#B87809",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
            }}
          >
            ♪
          </div>
          <div
            style={{
              fontSize: 24,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#F0C879",
            }}
          >
            {CHOIR.tagline}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 78, fontWeight: 700, lineHeight: 1.05 }}>
            {CHOIR.name}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#EBD9C4", maxWidth: 900 }}>
            {CHOIR.ministersAt.label} · {CHOIR.parish}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#F0C879",
            borderTop: "2px solid rgba(240,200,121,0.35)",
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex" }}>Repertoire · Concerts · Gallery · Join</div>
          <div style={{ display: "flex" }}>stpauls-community-choir.vercel.app</div>
        </div>
      </div>
    ),
    size,
  );
}
