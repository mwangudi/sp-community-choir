"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Building2,
  Check,
  Copy,
  HeartHandshake,
  Loader2,
  Mail,
  Send,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChoirContent } from "@/lib/settings";

export default function SupportContent({
  support,
  email,
}: {
  support: ChoirContent["support"];
  email: string;
}) {
  const s = support;

  return (
    <>
      {/* Hero */}
      <section className="border-b bg-gradient-to-br from-background via-background to-secondary/5">
        <div className="container max-w-6xl py-12 sm:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
                <HeartHandshake className="h-3.5 w-3.5" />
                Support the choir
              </div>
              <h1 className="mt-4 font-serif text-4xl font-semibold text-primary sm:text-5xl">
                Help us keep singing
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/85 sm:text-lg">
                Your gift helps cover sheet music, instrument hire, transport
                to outreach concerts, and refreshments at rehearsals. Every
                shilling keeps the chapel alive with song.
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border border-border/60 shadow-sm">
                <Image
                  src="/gallery/pic-7.avif"
                  alt="The choir in song"
                  width={1200}
                  height={1500}
                  className="block h-auto w-full"
                  priority
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent p-4">
                  <p className="text-right text-xs font-semibold uppercase tracking-widest text-gold">
                    Asante sana
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ways to give */}
      <section className="border-b bg-muted/30 py-12 sm:py-16">
        <div className="container max-w-5xl">
          <h2 className="font-serif text-2xl font-semibold text-primary sm:text-3xl">
            Ways to give
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Use the M-Pesa option that&apos;s easiest for you. Tap any value to
            copy it to your clipboard.
          </p>

          {/* STK Push (placeholder) */}
          <StkPushCard />

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {/* Paybill */}
            <Card className="border-secondary/30 bg-background">
              <CardHeader>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary">
                  <Smartphone className="h-4 w-4" />
                  M-Pesa Paybill
                </div>
                <CardTitle className="text-lg text-primary">
                  Lipa na M-Pesa · Paybill
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Field label="Paybill number" value={s.paybill.number} mono />
                <Field
                  label="Account / Reference"
                  value={s.paybill.accountRef}
                  mono
                />
                <p className="text-xs text-muted-foreground">
                  Goes to: {s.paybill.accountName}
                </p>
                <Steps
                  steps={[
                    "Go to M-Pesa → Lipa na M-Pesa → Paybill",
                    `Business no: ${s.paybill.number}`,
                    `Account no: ${s.paybill.accountRef}`,
                    "Enter amount, then your PIN",
                  ]}
                />
              </CardContent>
            </Card>

            {/* Till */}
            <Card className="border-secondary/30 bg-background">
              <CardHeader>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary">
                  <Smartphone className="h-4 w-4" />
                  M-Pesa Till (Buy Goods)
                </div>
                <CardTitle className="text-lg text-primary">
                  Lipa na M-Pesa · Buy Goods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Field label="Till number" value={s.till.number} mono />
                <p className="text-xs text-muted-foreground">
                  Goes to: {s.till.name}
                </p>
                <Steps
                  steps={[
                    "Go to M-Pesa → Lipa na M-Pesa → Buy Goods and Services",
                    `Till no: ${s.till.number}`,
                    "Enter amount, then your PIN",
                  ]}
                />
              </CardContent>
            </Card>

            {/* Send money to phone */}
            <Card className="border-secondary/30 bg-background">
              <CardHeader>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary">
                  <Smartphone className="h-4 w-4" />
                  M-Pesa Send Money
                </div>
                <CardTitle className="text-lg text-primary">
                  Send directly to a phone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Field label="Phone number" value={s.sendMoney.number} mono />
                <p className="text-xs text-muted-foreground">
                  {s.sendMoney.name}
                </p>
                <Steps
                  steps={[
                    "Go to M-Pesa → Send Money",
                    `Phone: ${s.sendMoney.number}`,
                    "Enter amount, then your PIN",
                  ]}
                />
              </CardContent>
            </Card>

            {/* Bank */}
            <Card className="border-border bg-background">
              <CardHeader>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary">
                  <Building2 className="h-4 w-4" />
                  Bank transfer
                </div>
                <CardTitle className="text-lg text-primary">
                  Direct deposit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Field label="Bank" value={s.bank.name} />
                <Field label="Branch" value={s.bank.branch} />
                <Field label="Account name" value={s.bank.accountName} />
                <Field label="Account number" value={s.bank.accountNumber} mono />
              </CardContent>
            </Card>
          </div>

          {/* Other ways */}
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <Card className="border-secondary/30 bg-secondary/5">
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary">
                  <Sparkles className="h-4 w-4" />
                  Sponsor a concert
                </div>
                <h3 className="font-serif text-lg font-semibold text-primary">
                  Partner with a concert or outreach
                </h3>
                <p className="text-sm text-foreground/85">
                  Cover the costs of a specific concert, season recording, or
                  outreach visit (Mater Hospital carols, parish missions). We
                  can acknowledge your support in the programme.
                </p>
                <Button asChild className="rounded-full">
                  <a
                    href={`mailto:${email}?subject=Concert%20sponsorship%20enquiry`}
                  >
                    <Mail className="h-4 w-4" /> Email us
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-background">
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary">
                  <HeartHandshake className="h-4 w-4" />
                  In-kind gifts
                </div>
                <h3 className="font-serif text-lg font-semibold text-primary">
                  Instruments, transport, refreshments
                </h3>
                <p className="text-sm text-foreground/85">
                  Hymnals and sheet music, keyboard or amplifier hire, bus
                  transport for outreach, or simply tea for rehearsals — all
                  warmly received.
                </p>
                <Button asChild variant="outline" className="rounded-full">
                  <a
                    href={`mailto:${email}?subject=In-kind%20gift%20to%20the%20choir`}
                  >
                    <Mail className="h-4 w-4" /> Get in touch
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            Numbers marked <strong>TBC</strong> are placeholders while the
            committee confirms the official accounts. Please contact us by email
            in the meantime.
          </p>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <button
        type="button"
        onClick={copy}
        className="mt-1 inline-flex w-full items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-3 py-2 text-left transition-colors hover:border-secondary/50 hover:bg-secondary/5"
        aria-label={`Copy ${label}`}
      >
        <span
          className={
            mono
              ? "font-mono text-base font-semibold text-primary"
              : "text-base font-semibold text-primary"
          }
        >
          {value}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-secondary" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </span>
      </button>
    </div>
  );
}

function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-2">
          <span className="font-semibold text-primary">{i + 1}.</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

type StkStatus =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "info"; message: string }
  | { kind: "error"; message: string };

function StkPushCard() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<StkStatus>({ kind: "idle" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9) {
      setStatus({ kind: "error", message: "Enter a valid M-Pesa phone number." });
      return;
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 1) {
      setStatus({ kind: "error", message: "Enter an amount of at least KES 1." });
      return;
    }
    setStatus({ kind: "sending" });
    // Placeholder — real Daraja STK Push will be wired after approval.
    window.setTimeout(() => {
      setStatus({
        kind: "info",
        message:
          "STK Push is not live yet. Once enabled, you'll receive a prompt on your phone to confirm KES " +
          amt.toLocaleString() +
          ". In the meantime, please use Paybill, Till, or Send Money below.",
      });
    }, 900);
  };

  const sending = status.kind === "sending";

  return (
    <Card className="mt-8 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <CardHeader>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <Smartphone className="h-4 w-4" />
          M-Pesa STK Push
          <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-[10px] text-secondary">
            Coming soon
          </span>
        </div>
        <CardTitle className="text-lg text-primary">
          Give in one tap from your phone
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Enter your M-Pesa number and an amount. We&apos;ll send a prompt to
          your phone — just enter your PIN to confirm.
        </p>
        <form
          onSubmit={onSubmit}
          noValidate
          className="grid gap-3 sm:grid-cols-[1fr_140px_auto]"
        >
          <label className="block">
            <span className="sr-only">Phone number</span>
            <input
              type="tel"
              inputMode="tel"
              placeholder="07XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={sending}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-primary placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </label>
          <label className="block">
            <span className="sr-only">Amount</span>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                KES
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={sending}
                className="w-full rounded-md border border-border bg-background py-2 pl-12 pr-3 text-sm font-medium text-primary placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              />
            </div>
          </label>
          <Button type="submit" disabled={sending} className="rounded-md">
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Send prompt
              </>
            )}
          </Button>
        </form>

        {status.kind === "info" && (
          <p className="mt-3 rounded-md border border-secondary/30 bg-secondary/10 px-3 py-2 text-xs text-foreground/85">
            {status.message}
          </p>
        )}
        {status.kind === "error" && (
          <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {status.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
