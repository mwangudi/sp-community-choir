"use client";

import { useState, type FormEvent, type ReactNode } from "react";

export type FieldRule = (value: string, form: FormData) => string | null;

export const isRequired =
  (label: string): FieldRule =>
  (value) =>
    value.trim() ? null : `${label} is required.`;

export const isEmail: FieldRule = (value) => {
  const v = value.trim();
  if (!v) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    ? null
    : "That email address does not look right.";
};

/** Runs each rule in turn and reports the first failure. */
export const all =
  (...rules: FieldRule[]): FieldRule =>
  (value, form) => {
    for (const rule of rules) {
      const message = rule(value, form);
      if (message) return message;
    }
    return null;
  };

/**
 * Replaces the browser's HTML5 validation bubbles with messages rendered
 * beneath each field. Spread `formProps` on the <form> and `field(name)` on
 * each TextField.
 */
export function useFieldValidation(rules: Record<string, FieldRule>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (form: HTMLFormElement) => {
    const data = new FormData(form);
    const found: Record<string, string> = {};

    for (const [name, rule] of Object.entries(rules)) {
      const message = rule(String(data.get(name) ?? ""), data);
      if (message) found[name] = message;
    }

    setErrors(found);

    const [firstInvalid] = Object.keys(found);
    if (firstInvalid) {
      form
        .querySelector<HTMLElement>(`[name="${CSS.escape(firstInvalid)}"]`)
        ?.focus();
    }

    return Object.keys(found).length === 0;
  };

  const formProps = {
    noValidate: true,
    onSubmit: (event: FormEvent<HTMLFormElement>) => {
      if (!validate(event.currentTarget)) event.preventDefault();
    },
  };

  const clear = (name: string) =>
    setErrors((prev) => {
      if (!(name in prev)) return prev;
      const { [name]: _cleared, ...rest } = prev;
      return rest;
    });

  const field = (name: string, helperText?: ReactNode) => ({
    error: Boolean(errors[name]),
    helperText: errors[name] ?? helperText,
    onChange: () => clear(name),
  });

  return { errors, formProps, field, clear };
}
