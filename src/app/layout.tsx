import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { CHOIR } from "@/lib/choir";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

// Choir site goes public independently of the parish website, so by
// default we DO allow indexing here. Set `NEXT_PUBLIC_ALLOW_INDEXING=false`
// to temporarily hide it (e.g. during a major redesign).
const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING !== "false";

export const metadata: Metadata = {
  title: {
    default: `${CHOIR.name} — ${CHOIR.tagline}`,
    template: `%s — ${CHOIR.shortName}`,
  },
  description: CHOIR.intro,
  metadataBase: new URL("https://spchoir1.wixsite.com"),
  openGraph: {
    title: CHOIR.name,
    description: CHOIR.intro,
    siteName: CHOIR.name,
    type: "website",
  },
  robots: allowIndexing
    ? undefined
    : { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#2d1e55" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
