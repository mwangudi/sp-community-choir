"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitApplication } from "@/app/(site)/join/actions";
import { MEDIA_CONSENT_TEXT, PRIVACY_CONSENT_TEXT } from "@/lib/consent";
import { CHOIR } from "@/lib/choir";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; message: string }
  | { kind: "info"; message: string }
  | { kind: "error"; message: string };

const VOICES = [
  "Soprano",
  "Alto",
  "Tenor",
  "Bass",
  "Not sure — please advise",
] as const;

type Values = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  voice: string;
  startDate: string;
  message: string;
};

type FieldName = keyof Values;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\-\s\d]{7,}$/;

function validateField(name: FieldName, v: Values): string | undefined {
  switch (name) {
    case "firstName":
      if (!v.firstName.trim()) return "First name is required.";
      return;
    case "lastName":
      if (!v.lastName.trim()) return "Last name is required.";
      return;
    case "email":
      if (!v.email.trim()) return "Email is required.";
      if (!EMAIL_RE.test(v.email.trim())) return "Enter a valid email address.";
      return;
    case "phone":
      if (v.phone.trim() && !PHONE_RE.test(v.phone.trim()))
        return "Enter a valid phone number.";
      return;
    case "voice":
      if (!v.voice) return "Choose a voice section.";
      return;
    case "startDate":
      if (v.startDate) {
        const d = new Date(v.startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (d < today) return "Pick today or a later date.";
      }
      return;
    default:
      return;
  }
}

export function JoinForm() {
  const [values, setValues] = useState<Values>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    voice: "",
    startDate: "",
    message: "",
  });
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [mediaConsent, setMediaConsent] = useState(false);

  const setField =
    (name: FieldName) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setValues((p) => ({ ...p, [name]: e.target.value }));

  const blur = (name: FieldName) => () =>
    setTouched((p) => ({ ...p, [name]: true }));

  const errors: Partial<Record<FieldName, string>> = {
    firstName: validateField("firstName", values),
    lastName: validateField("lastName", values),
    email: validateField("email", values),
    phone: validateField("phone", values),
    voice: validateField("voice", values),
    startDate: validateField("startDate", values),
  };

  const shownError = (name: FieldName) =>
    touched[name] ? errors[name] : undefined;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      voice: true,
      startDate: true,
    });
    if (Object.values(errors).some(Boolean)) {
      setStatus({
        kind: "error",
        message: "Please fix the highlighted fields and try again.",
      });
      return;
    }
    if (!privacyConsent) {
      setStatus({
        kind: "error",
        message: "Please accept the privacy notice so we may hold your details.",
      });
      return;
    }

    setStatus({ kind: "sending" });
    const result = await submitApplication({
      ...values,
      privacyConsent,
      mediaConsent,
    });

    if (result.ok) {
      setStatus({
        kind: "sent",
        message:
          "Thank you! Your application is with the choir — we will be in touch soon.",
      });
      return;
    }
    setStatus({ kind: "error", message: result.error ?? "Could not send" });
  };

  const sending = status.kind === "sending";

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-3.5">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="First name" required error={shownError("firstName")}>
          <input
            type="text"
            value={values.firstName}
            onChange={setField("firstName")}
            onBlur={blur("firstName")}
            disabled={sending}
            placeholder="e.g. Mary"
            autoComplete="given-name"
            aria-invalid={Boolean(shownError("firstName"))}
            className={inputCls(Boolean(shownError("firstName")))}
          />
        </Field>
        <Field label="Last name" required error={shownError("lastName")}>
          <input
            type="text"
            value={values.lastName}
            onChange={setField("lastName")}
            onBlur={blur("lastName")}
            disabled={sending}
            placeholder="e.g. Wanjiku"
            autoComplete="family-name"
            aria-invalid={Boolean(shownError("lastName"))}
            className={inputCls(Boolean(shownError("lastName")))}
          />
        </Field>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Email" required error={shownError("email")}>
          <input
            type="email"
            value={values.email}
            onChange={setField("email")}
            onBlur={blur("email")}
            disabled={sending}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={Boolean(shownError("email"))}
            className={inputCls(Boolean(shownError("email")))}
          />
        </Field>
        <Field label="Phone" error={shownError("phone")}>
          <input
            type="tel"
            inputMode="tel"
            value={values.phone}
            onChange={setField("phone")}
            onBlur={blur("phone")}
            disabled={sending}
            placeholder="07XX XXX XXX"
            autoComplete="tel"
            aria-invalid={Boolean(shownError("phone"))}
            className={inputCls(Boolean(shownError("phone")))}
          />
        </Field>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field
          label="Voice I would like to join as"
          required
          error={shownError("voice")}
        >
          <select
            value={values.voice}
            onChange={setField("voice")}
            onBlur={blur("voice")}
            disabled={sending}
            aria-invalid={Boolean(shownError("voice"))}
            className={inputCls(Boolean(shownError("voice")))}
          >
            <option value="" disabled>
              Choose a voice section
            </option>
            {VOICES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Available start date" error={shownError("startDate")}>
          <input
            type="date"
            value={values.startDate}
            onChange={setField("startDate")}
            onBlur={blur("startDate")}
            disabled={sending}
            placeholder="yyyy-mm-dd"
            aria-invalid={Boolean(shownError("startDate"))}
            className={inputCls(Boolean(shownError("startDate")))}
          />
        </Field>
      </div>

      <Field label="Anything else? (optional)">
        <textarea
          value={values.message}
          onChange={setField("message")}
          disabled={sending}
          rows={2}
          placeholder="Choir experience, instruments you play, questions for us…"
          className={`${inputCls(false)} resize-y`}
        />
      </Field>

      <div className="space-y-2.5 rounded-lg border border-border bg-muted/30 p-3.5">
        <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-foreground/85">
          <input
            type="checkbox"
            checked={privacyConsent}
            onChange={(e) => setPrivacyConsent(e.target.checked)}
            disabled={sending}
            className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
          />
          <span>
            {PRIVACY_CONSENT_TEXT}{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Read the privacy notice
            </Link>
            . <span className="text-primary">*</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-foreground/85">
          <input
            type="checkbox"
            checked={mediaConsent}
            onChange={(e) => setMediaConsent(e.target.checked)}
            disabled={sending}
            className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
          />
          <span>{MEDIA_CONSENT_TEXT} (optional)</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button
          type="submit"
          size="lg"
          disabled={sending || status.kind === "sent"}
          className="rounded-full"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending…
            </>
          ) : status.kind === "sent" ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Application sent
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Apply now
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Or email us directly at{" "}
          <a
            href={`mailto:${CHOIR.email}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {CHOIR.email}
          </a>
          .
        </p>
      </div>

      {status.kind === "sent" && (
        <p className="rounded-md border border-emerald-600/30 bg-emerald-600/10 px-3 py-2 text-xs text-emerald-800">
          {status.message}
        </p>
      )}
      {status.kind === "info" && (
        <p className="rounded-md border border-secondary/30 bg-secondary/10 px-3 py-2 text-xs text-foreground/85">
          {status.message}
        </p>
      )}
      {status.kind === "error" && (
        <p className="rounded-md border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-700">
          {status.message}
        </p>
      )}
    </form>
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
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
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
    </label>
  );
}
