import type { Metadata } from "next";
import { ListMusic } from "lucide-react";
import { SongProposalForm } from "@/components/song-proposal-form";

export const metadata: Metadata = {
  title: "Propose Sunday songs",
  description:
    "Propose songs for an upcoming Sunday Mass and submit them to the choir's technical team for the week's training.",
};

export default function ProposePage() {
  return (
    <>
      <section className="border-b bg-gradient-to-br from-primary via-primary to-secondary/30 text-primary-foreground">
        <div className="container py-12 sm:py-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            <ListMusic className="h-3.5 w-3.5" />
            Song proposals
          </div>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-[1.1] sm:text-5xl">
            Propose songs for a Sunday
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed opacity-90 sm:text-lg">
            Voices from every section help shape our Sunday liturgy. Pick a
            Sunday, propose the songs you&apos;d like us to sing, and send them to
            the technical team — they consolidate the proposals and set what we
            train during the week.
          </p>
        </div>
      </section>

      <SongProposalForm />
    </>
  );
}
