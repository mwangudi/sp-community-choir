import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NewsTicker } from "@/components/news-ticker";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <NewsTicker />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
