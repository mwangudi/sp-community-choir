import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FolderOpen, Lock, Music2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { seasonLabel } from "@/lib/liturgical";
import {
  isScorePublic,
  massPartLabel,
  songCopyright,
  songDriveUrl,
} from "@/lib/songs";
import { findSongBySlug } from "@/lib/server/repertoire";

type Params = { slug: string };

// Songs are admin-managed, so the set of valid slugs is not known at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const song = await findSongBySlug(slug);
  if (!song) return { title: "Song not found" };
  return {
    title: song.title,
    description: [
      song.composer ? `Composed by ${song.composer}.` : null,
      `Sung by the St. Paul's Community Choir.`,
    ]
      .filter(Boolean)
      .join(" "),
  };
}

export default async function SongPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const song = await findSongBySlug(slug);
  if (!song) notFound();

  const driveUrl = songDriveUrl(song);
  const rights = songCopyright(song);
  const signedIn = Boolean(await getSession());
  const canOpenScores = isScorePublic(song) || signedIn;

  return (
    <>
      <section className="border-b bg-muted/30 py-10 sm:py-14">
        <div className="container max-w-4xl">
          <Link
            href="/repertoire"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to repertoire
          </Link>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
            <Music2 className="h-3.5 w-3.5" />
            {song.language}
            {song.voicing ? ` · ${song.voicing}` : ""}
          </div>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-primary sm:text-5xl">
            {song.title}
          </h1>
          {song.aliases && song.aliases.length > 0 && (
            <p className="mt-2 text-sm italic text-muted-foreground">
              Also known as: {song.aliases.join(" · ")}
            </p>
          )}
          {song.composer && (
            <p className="mt-4 text-base text-foreground/85">
              <span className="text-muted-foreground">Composer: </span>
              <span className="font-medium">{song.composer}</span>
              {song.arranger ? (
                <>
                  <span className="text-muted-foreground"> · Arranged by </span>
                  <span className="font-medium">{song.arranger}</span>
                </>
              ) : null}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {canOpenScores ? (
              <Button asChild>
                <a href={driveUrl} target="_blank" rel="noopener noreferrer">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Open in Drive
                  <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-80" />
                </a>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href={`/admin/login?next=/repertoire/${song.slug}`}>
                  <Lock className="mr-2 h-4 w-4" />
                  Members: sign in for the score
                </Link>
              </Button>
            )}
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              {rights === "PublicDomain"
                ? "This work is in the public domain."
                : rights === "Licensed"
                  ? `Used under licence${song.rightsHolder ? ` from ${song.rightsHolder}` : ""}. Scores are for choir rehearsal use only.`
                  : rights === "Copyrighted"
                    ? `${song.rightsHolder ? `© ${song.rightsHolder}. ` : ""}Scores are for choir rehearsal use only and must not be redistributed.`
                    : "Copyright status has not been confirmed, so files are restricted to choir members."}
            </span>
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container max-w-4xl">
          {song.lyrics && (
            <div className="mb-10 rounded-lg border bg-muted/20 p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-semibold text-primary">
                Lyrics
              </h2>
              <div
                className="choir-prose mt-4"
                dangerouslySetInnerHTML={{ __html: song.lyrics }}
              />
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-2">
            <DetailBlock label="Liturgical seasons">
              {song.seasons.map((s) => (
                <Badge key={s} variant="secondary">
                  {seasonLabel(s)}
                </Badge>
              ))}
            </DetailBlock>

            <DetailBlock label="Mass parts">
              {song.massParts.map((m) => (
                <Badge key={m} variant="outline">
                  {massPartLabel(m)}
                </Badge>
              ))}
            </DetailBlock>

            {song.themes.length > 0 && (
              <DetailBlock label="Themes">
                {song.themes.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </DetailBlock>
            )}

            {song.feasts && song.feasts.length > 0 && (
              <DetailBlock label="Feasts">
                {song.feasts.map((f) => (
                  <Badge key={f} variant="outline">
                    {f.replace(/-/g, " ")}
                  </Badge>
                ))}
              </DetailBlock>
            )}

            {song.scripture && song.scripture.length > 0 && (
              <DetailBlock label="Scripture">
                {song.scripture.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-muted px-2 py-1 text-sm"
                  >
                    {s}
                  </span>
                ))}
              </DetailBlock>
            )}

            {song.key && (
              <DetailBlock label="Key">
                <span className="rounded-md bg-muted px-2 py-1 text-sm font-medium">
                  {song.key}
                </span>
              </DetailBlock>
            )}
          </div>

          {song.notes && (
            <div className="mt-10 rounded-lg border bg-muted/30 p-6">
              <h2 className="font-serif text-lg font-semibold text-primary">
                Notes
              </h2>
              <p className="mt-2 text-foreground/85">{song.notes}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function DetailBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </h2>
      <div className="mt-3 flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
