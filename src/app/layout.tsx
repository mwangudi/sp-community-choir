import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CHOIR } from "@/lib/choir";
import { ALLOW_INDEXING, SITE_URL } from "@/lib/site";
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
const allowIndexing = ALLOW_INDEXING;

export const metadata: Metadata = {
  title: {
    default: `${CHOIR.name} — ${CHOIR.tagline}`,
    template: `%s — ${CHOIR.shortName}`,
  },
  description: CHOIR.intro,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  applicationName: CHOIR.shortName,
  keywords: [
    "Catholic choir",
    "Nairobi",
    "St. Paul's Chapel",
    "University of Nairobi",
    "sacred music",
    "church choir",
    "liturgical music",
  ],
  openGraph: {
    title: CHOIR.name,
    description: CHOIR.intro,
    siteName: CHOIR.name,
    url: SITE_URL,
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: CHOIR.name,
    description: CHOIR.intro,
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: CHOIR.name,
    alternateName: CHOIR.shortName,
    url: SITE_URL,
    description: CHOIR.intro,
    email: CHOIR.email,
    genre: ["Sacred music", "Liturgical music", "Choral"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nairobi",
      addressCountry: "KE",
    },
    memberOf: { "@type": "Organization", name: CHOIR.parish },
    sameAs: CHOIR.socials.map((s) => s.href),
  };

  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
