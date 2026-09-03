import { CHOIR } from "./choir";

export type SettingField = {
  /** Dotted path into the CHOIR defaults, e.g. "support.paybill.number". */
  key: string;
  label: string;
  help?: string;
  multiline?: boolean;
};

export type SettingGroup = {
  title: string;
  description: string;
  fields: SettingField[];
};

export const SETTING_GROUPS: SettingGroup[] = [
  {
    title: "Identity & contact",
    description: "Shown in the header, footer and on the contact page.",
    fields: [
      { key: "tagline", label: "Tagline" },
      { key: "email", label: "Contact email" },
    ],
  },
  {
    title: "Rehearsals",
    description: "Used on the contact, join and about pages.",
    fields: [
      { key: "rehearsals.day", label: "Rehearsal days", help: "e.g. Mon & Wed" },
      { key: "rehearsals.time", label: "Rehearsal time" },
      { key: "rehearsals.sundayWarmUp", label: "Sunday warm-up" },
      { key: "rehearsals.venue", label: "Venue" },
    ],
  },
  {
    title: "Supporting the choir",
    description:
      "Mobile money and bank details shown publicly on the support page. Double-check every digit before saving.",
    fields: [
      { key: "support.paybill.number", label: "Paybill number" },
      { key: "support.paybill.accountName", label: "Paybill account name" },
      { key: "support.paybill.accountRef", label: "Paybill account reference" },
      { key: "support.till.number", label: "Till number" },
      { key: "support.till.name", label: "Till name" },
      { key: "support.sendMoney.number", label: "Send Money number" },
      { key: "support.sendMoney.name", label: "Send Money recipient" },
      { key: "support.bank.name", label: "Bank name" },
      { key: "support.bank.branch", label: "Bank branch" },
      { key: "support.bank.accountName", label: "Bank account name" },
      { key: "support.bank.accountNumber", label: "Bank account number" },
    ],
  },
  {
    title: "About the choir",
    description: "Long-form copy for the home and about pages.",
    fields: [
      { key: "intro", label: "Intro paragraph", multiline: true },
      { key: "about", label: "About paragraph", multiline: true },
      { key: "history", label: "History paragraph", multiline: true },
    ],
  },
];

export const SETTING_KEYS: string[] = SETTING_GROUPS.flatMap((g) =>
  g.fields.map((f) => f.key),
);

/** The bundled value for a dotted key, used when nothing is saved. */
export function defaultSetting(key: string): string {
  let node: unknown = CHOIR;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return "";
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : "";
}

export type ChoirContent = typeof CHOIR;

/** Deep copy of the bundled content with any saved overrides applied. */
export function applyOverrides(overrides: Record<string, string>): ChoirContent {
  const merged = structuredClone(CHOIR) as unknown as Record<string, unknown>;

  for (const key of SETTING_KEYS) {
    const value = overrides[key];
    if (value === undefined || value === "") continue;

    const parts = key.split(".");
    let node = merged;
    for (const part of parts.slice(0, -1)) {
      const next = node[part];
      if (typeof next !== "object" || next === null) break;
      node = next as Record<string, unknown>;
    }
    node[parts[parts.length - 1]] = value;
  }

  return merged as unknown as ChoirContent;
}
