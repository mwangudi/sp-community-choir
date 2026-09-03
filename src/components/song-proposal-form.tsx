"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Copy,
  ListMusic,
  Loader2,
  Mail,
  MessageCircle,
  RotateCcw,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { submitProposal } from "@/app/(site)/propose/actions";
import { CHOIR } from "@/lib/choir";
import {
  formatSunday,
  liturgicalContext,
  seasonLabel,
  type LiturgicalContext,
} from "@/lib/liturgical";
import {
  MASS_PLANS,
  MASS_PLAN_PART_ORDER,
  massPlanForDate,
  orderedItems,
  type MassPlanPart,
} from "@/lib/mass-plans";
import { SONGS } from "@/lib/songs";

/**
 * Where finished proposals are submitted. Defaults to the choir inbox;
 * swap in a dedicated technical-team address when one exists.
 */
const TECH_TEAM_EMAIL = CHOIR.email;

const VOICES = [
  "Soprano",
  "Alto",
  "Tenor",
  "Bass",
  "Instrumentalist",
  "Conductor / Trainer",
  "Other",
] as const;

/** Set by the lectionary for each Sunday, so there is nothing to propose. */
const FIXED_PARTS: MassPlanPart[] = ["Responsorial Psalm"];

/** Parts most members propose — shown first, the rest under "more parts". */
const PRIMARY_PARTS: MassPlanPart[] = [
  "Entrance",
  "Gospel Acclamation",
  "Gospel Procession",
  "Offertory",
  "Preparation of Gifts",
  "Communion",
  "Anima Christi",
  "Thanksgiving",
  "Recessional",
  "Marian Hymn",
];
const SECONDARY_PARTS: MassPlanPart[] = MASS_PLAN_PART_ORDER.filter(
  (p) => !PRIMARY_PARTS.includes(p) && !FIXED_PARTS.includes(p),
);

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** The next `count` Sundays with their liturgical context. */
function upcomingSundays(count: number): LiturgicalContext[] {
  const out: LiturgicalContext[] = [];
  let from = new Date();
  for (let i = 0; i < count; i++) {
    const ctx = liturgicalContext(from);
    out.push(ctx);
    from = new Date(ctx.date);
    from.setDate(from.getDate() + 7);
  }
  return out;
}

type SubmitState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "copied" }
  | { kind: "error"; message: string };

export function SongProposalForm() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sundays = useMemo(
    () => (mounted ? upcomingSundays(12) : []),
    [mounted],
  );

  const [sundayKey, setSundayKey] = useState("");
  useEffect(() => {
    if (sundays.length && !sundayKey) setSundayKey(dateKey(sundays[0].date));
  }, [sundays, sundayKey]);

  const [name, setName] = useState("");
  const [voice, setVoice] = useState("");
  const [songs, setSongs] = useState<Partial<Record<MassPlanPart, string>>>({});
  const [showMore, setShowMore] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  const selected = useMemo(
    () => sundays.find((c) => dateKey(c.date) === sundayKey),
    [sundays, sundayKey],
  );

  const existingPlan = useMemo(
    () => (selected ? massPlanForDate(selected.date) : undefined),
    [selected],
  );

  /** Autocomplete pool: catalogued songs + every song the choir has used in a plan. */
  const suggestions = useMemo(() => {
    const set = new Set<string>();
    for (const s of SONGS) {
      set.add(s.title);
      for (const a of s.aliases ?? []) set.add(a);
    }
    for (const plan of MASS_PLANS) {
      for (const it of plan.items) {
        if (it.song && !/^recit/i.test(it.song)) set.add(it.song);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, []);

  const setPart = (part: MassPlanPart, value: string) =>
    setSongs((prev) => ({ ...prev, [part]: value }));

  const loadCurrentPlan = () => {
    if (!existingPlan) return;
    const next: Partial<Record<MassPlanPart, string>> = {};
    for (const it of orderedItems(existingPlan)) {
      if (/^recit/i.test(it.song)) continue;
      if (FIXED_PARTS.includes(it.part)) continue;
      next[it.part] = next[it.part] ? `${next[it.part]} / ${it.song}` : it.song;
    }
    setSongs(next);
    setShowMore(true);
  };

  const reset = () => {
    setSongs({});
    setState({ kind: "idle" });
  };

  const filledParts = MASS_PLAN_PART_ORDER.filter(
    (p) => songs[p]?.trim() && !FIXED_PARTS.includes(p),
  );
  const canSubmit =
    Boolean(name.trim()) && Boolean(voice) && filledParts.length > 0 && !!selected;

  const proposalText = useMemo(() => {
    if (!selected) return "";
    const lines = [
      "St. Paul's Community Choir — Song proposal",
      "",
      `Sunday: ${selected.name}`,
      `Date: ${formatSunday(selected.date)} · ${seasonLabel(selected.season)} · Year ${selected.year}`,
      `Proposed by: ${name.trim() || "(name)"}${voice ? ` (${voice})` : ""}`,
      "",
      ...filledParts.map((p) => `${p}: ${songs[p]!.trim()}`),
      "",
      "Submitted via the choir website.",
    ];
    return lines.join("\n");
  }, [selected, name, voice, filledParts, songs]);

  const tryStart = (): boolean => {
    setSubmitted(true);
    if (!canSubmit) {
      setState({
        kind: "error",
        message:
          "Add your name, your voice and at least one proposed song first.",
      });
      return false;
    }
    setState({ kind: "idle" });
    return true;
  };

  const onSend = async () => {
    if (!tryStart() || !selected) return;
    setState({ kind: "sending" });
    const result = await submitProposal({
      sundayDate: dateKey(selected.date),
      sundayName: selected.name,
      lectionaryYear: selected.year,
      proposerName: name.trim(),
      voice: voice || null,
      items: filledParts.map((part) => ({ part, song: songs[part]!.trim() })),
    });
    if (result.ok) {
      setState({ kind: "sent" });
    } else {
      setState({ kind: "error", message: result.error ?? "Could not send" });
    }
  };

  const onEmail = () => {
    if (!tryStart() || !selected) return;
    const subject = `Song proposal — ${selected.name} (${formatSunday(selected.date)})`;
    window.location.href = `mailto:${TECH_TEAM_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(proposalText)}`;
  };

  const onWhatsApp = () => {
    if (!tryStart()) return;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(proposalText)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const onCopy = async () => {
    if (!tryStart()) return;
    try {
      await navigator.clipboard.writeText(proposalText);
      setState({ kind: "copied" });
      window.setTimeout(() => setState({ kind: "idle" }), 2500);
    } catch {
      setState({ kind: "error", message: "Couldn't copy — select and copy the preview text." });
    }
  };

  if (!mounted) {
    return (
      <div className="container py-12">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="container grid gap-8 py-10 lg:grid-cols-[1fr_22rem] lg:py-12">
      {/* Builder */}
      <div className="space-y-7">
        {/* Who + when */}
        <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-primary">
            <CalendarDays className="h-5 w-5 text-secondary" />
            Who&apos;s proposing, and for when
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Your name" required error={submitted && !name.trim() ? "Required." : undefined}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mary Wanjiku"
                autoComplete="name"
                className={inputCls(submitted && !name.trim())}
              />
            </Field>
            <Field
              as="div"
              label="Your voice / section"
              required
              error={submitted && !voice ? "Required." : undefined}
            >
              <SearchableSelect
                value={voice}
                onChange={setVoice}
                options={VOICES.map((v) => ({ value: v, label: v }))}
                placeholder="Choose…"
                ariaLabel="Your voice or section"
                error={submitted && !voice}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field as="div" label="Sunday / feast" required>
              <SearchableSelect
                value={sundayKey}
                onChange={setSundayKey}
                options={sundays.map((c) => ({
                  value: dateKey(c.date),
                  label: `${c.name} — ${formatSunday(c.date)}`,
                }))}
                ariaLabel="Sunday or feast"
              />
            </Field>
            {selected && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-secondary/15 px-2.5 py-1 font-semibold text-secondary">
                  {seasonLabel(selected.season)}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 font-semibold text-foreground/70">
                  Year {selected.year}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 font-semibold capitalize text-foreground/70">
                  Colour: {selected.color}
                </span>
                {existingPlan && (
                  <button
                    type="button"
                    onClick={loadCurrentPlan}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    <ListMusic className="h-3.5 w-3.5" />
                    Start from current plan
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Songs */}
        <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-primary">
              <ListMusic className="h-5 w-5 text-secondary" />
              Proposed songs
            </h2>
            {filledParts.length > 0 && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill only the parts you want to propose. Start typing to pick from the
            repertoire, or enter any song. Separate two songs with a slash ( / ).
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {PRIMARY_PARTS.map((part) => (
              <PartInput
                key={part}
                part={part}
                value={songs[part] ?? ""}
                onChange={(v) => setPart(part, v)}
                suggestions={suggestions}
              />
            ))}
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowMore((s) => !s)}
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              {showMore ? "Hide" : "Show"} Mass Ordinary &amp; other parts (
              {SECONDARY_PARTS.length})
            </button>
            {showMore && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {SECONDARY_PARTS.map((part) => (
                  <PartInput
                    key={part}
                    part={part}
                    value={songs[part] ?? ""}
                    onChange={(v) => setPart(part, v)}
                    suggestions={suggestions}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Preview + submit */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border bg-primary p-5 text-primary-foreground shadow-sm sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest opacity-80">
            Submission preview
          </h2>
          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-primary-foreground/10 p-3 text-xs leading-relaxed">
            {selected ? proposalText : "Choose a Sunday to begin."}
          </pre>

          <div className="mt-4 grid gap-2">
            <Button
              type="button"
              onClick={onSend}
              disabled={state.kind === "sending"}
              className="w-full rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              {state.kind === "sending" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                </>
              ) : state.kind === "sent" ? (
                <>
                  <Check className="h-4 w-4" /> Sent to the technical team
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Send to technical team
                </>
              )}
            </Button>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onEmail}
                className="w-full rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Mail className="h-4 w-4" /> Email
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onWhatsApp}
                className="w-full rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCopy}
                className="w-full rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                {state.kind === "copied" ? (
                  <>
                    <Check className="h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {state.kind === "sent" && (
            <p className="mt-3 rounded-md bg-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-50">
              Thank you! Your proposal is now with the technical team.
            </p>
          )}

          {state.kind === "error" && (
            <p className="mt-3 rounded-md bg-red-500/15 px-3 py-2 text-xs font-medium text-red-100">
              {state.message}
            </p>
          )}
          <p className="mt-3 text-[11px] leading-relaxed opacity-70">
            Your proposal goes to the technical team to plan the week&apos;s
            training. The same text can be pasted into the choir&apos;s Google
            Sheet.
          </p>
        </div>
      </aside>
    </div>
  );
}

function PartInput({
  part,
  value,
  onChange,
  suggestions,
}: {
  part: MassPlanPart;
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
}) {
  return (
    <Field label={part}>
      <Combobox
        value={value}
        onChange={onChange}
        options={suggestions}
        placeholder="Search or type a song…"
        ariaLabel={part}
      />
    </Field>
  );
}

function inputCls(hasError: boolean) {
  return [
    "w-full rounded-md border bg-background px-3 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 disabled:opacity-60",
    hasError
      ? "border-red-600 focus:border-red-600 focus:ring-red-600/20"
      : "border-border focus:border-primary focus:ring-primary/20",
  ].join(" ");
}

function Field({
  label,
  required,
  error,
  children,
  as = "label",
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  as?: "label" | "div";
}) {
  const Tag = as;
  return (
    <Tag className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-[11px] font-medium text-red-700">
          {error}
        </span>
      )}
    </Tag>
  );
}
