import Link from "next/link";
import { Megaphone } from "lucide-react";
import { getLiveAnnouncements, type Announcement } from "@/lib/server/announcements";

/** Seconds per character, so a long message scrolls at the same pace as a short one. */
const PACE = 0.16;

function Item({ a, copy = false }: { a: Announcement; copy?: boolean }) {
  const external = a.href && /^https?:\/\//.test(a.href);
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span>{a.message}</span>
      {a.href && (
        <Link
          href={a.href}
          {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
          // The looping copy repeats links already reachable in the first.
          tabIndex={copy ? -1 : undefined}
          className="font-semibold text-gold underline-offset-4 hover:underline"
        >
          {a.linkLabel || "Details"} →
        </Link>
      )}
      <span aria-hidden className="px-6 text-gold/70">
        ✦
      </span>
    </span>
  );
}

/** News banner under the main menu, scrolling right to left. */
export async function NewsTicker() {
  const items = await getLiveAnnouncements();
  if (items.length === 0) return null;

  const length = items.reduce((n, a) => n + a.message.length + (a.linkLabel?.length ?? 8) + 6, 0);
  const duration = Math.max(20, Math.round(length * PACE));

  return (
    <section
      aria-label="Announcements"
      className="news-ticker relative flex items-stretch overflow-hidden bg-primary text-sm text-primary-foreground"
    >
      <div className="z-10 flex shrink-0 items-center gap-2 bg-primary-deep px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-gold sm:px-5">
        <Megaphone className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">News</span>
      </div>
      <div className="news-ticker-viewport relative flex-1 overflow-hidden py-2">
        {/* Two copies side by side; the track moves one copy's width and loops seamlessly. */}
        <div
          className="news-ticker-track inline-flex"
          style={{ ["--ticker-duration" as string]: `${duration}s` }}
        >
          <div className="inline-flex shrink-0 pl-6">
            {items.map((a) => (
              <Item key={a.id} a={a} />
            ))}
          </div>
          <div className="news-ticker-copy inline-flex shrink-0 pl-6" aria-hidden>
            {items.map((a) => (
              <Item key={a.id} a={a} copy />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
