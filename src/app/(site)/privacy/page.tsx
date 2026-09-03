import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { CHOIR } from "@/lib/choir";
import { CONSENT_VERSION } from "@/lib/consent";

export const metadata: Metadata = {
  title: "Privacy & data protection",
  description:
    "How St. Paul's Chapel Community Choir collects, uses and protects your personal data, in line with Kenya's Data Protection Act, 2019.",
};

const UPDATED = "August 2026";

export default function PrivacyPage() {
  return (
    <>
      <section className="border-b bg-muted/30 py-14 sm:py-16">
        <div className="container max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Privacy
          </div>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-primary sm:text-5xl">
            Privacy &amp; data protection
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/85 sm:text-lg">
            We take care with the personal information you share with us. This
            notice explains what we collect, why, and the choices you have.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated {UPDATED} · Consent version {CONSENT_VERSION}
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container max-w-3xl space-y-10">
          <Block title="Who we are">
            <p>
              {CHOIR.name} is the parish choir at {CHOIR.parish}. For questions
              about your data, write to{" "}
              <a
                href={`mailto:${CHOIR.email}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {CHOIR.email}
              </a>
              .
            </p>
          </Block>

          <Block title="What we collect">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Membership enquiries</strong> — name, email, phone,
                voice part, availability and any message you send us.
              </li>
              <li>
                <strong>Song proposals</strong> — your name, voice part and the
                songs you suggest for a Sunday.
              </li>
              <li>
                <strong>Photos and recordings</strong> — images and video from
                rehearsals, Masses and concerts, where you have consented.
              </li>
              <li>
                <strong>Website analytics</strong> — anonymous, aggregated page
                statistics. We do not use advertising cookies or track you
                across other websites.
              </li>
            </ul>
          </Block>

          <Block title="Why we use it">
            <p>
              To respond to enquiries, organise rehearsals and liturgy, plan the
              music we sing, and share the life of the choir with the parish. We
              rely on your consent, and on our legitimate interest in running
              the choir.
            </p>
          </Block>

          <Block title="Media consent">
            <p>
              We photograph and record choir activities. We ask members to give
              consent before their image is used publicly, and you may withdraw
              it at any time by writing to us — we will stop using new material
              and remove existing items from our own channels where reasonably
              possible.
            </p>
            <p className="mt-3">
              <a
                href={CHOIR.consentFormHref}
                download
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Download the media consent form
              </a>
            </p>
          </Block>

          <Block title="Who we share it with">
            <p>
              Nobody outside the choir&apos;s leadership and technical team. We
              do not sell personal data. Our website is hosted by Vercel and our
              records are held in a database controlled by the choir.
            </p>
          </Block>

          <Block title="How long we keep it">
            <p>
              Membership records are kept while you sing with us and for a
              reasonable period afterwards. Enquiries that do not lead to
              membership are removed once they are no longer needed.
            </p>
          </Block>

          <Block title="Your rights">
            <p>
              Under Kenya&apos;s Data Protection Act, 2019 you may ask to see
              the data we hold about you, correct it, have it deleted, or object
              to how we use it. Write to{" "}
              <a
                href={`mailto:${CHOIR.email}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {CHOIR.email}
              </a>{" "}
              and we will respond as soon as we reasonably can.
            </p>
          </Block>

          <Block title="Children">
            <p>
              Where a chorister is under 18, we ask a parent or guardian to give
              consent on their behalf.
            </p>
          </Block>

          <p className="text-sm text-muted-foreground">
            Questions? <Link href="/contact" className="text-primary underline-offset-4 hover:underline">Contact us</Link>.
          </p>
        </div>
      </section>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold text-primary">{title}</h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-foreground/85">
        {children}
      </div>
    </div>
  );
}
