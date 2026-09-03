import "server-only";

import { prisma } from "@/lib/db";
import { CHOIR } from "@/lib/choir";
import {
  applyOverrides,
  defaultSetting,
  SETTING_KEYS,
  type ChoirContent,
} from "@/lib/settings";

async function loadOverrides(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: SETTING_KEYS } },
    });
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    return {};
  }
}

/**
 * Bundled choir content with admin overrides applied. Use in place of the
 * static CHOIR object anywhere a server component renders editable copy.
 */
export async function getChoir(): Promise<ChoirContent> {
  const overrides = await loadOverrides();
  return Object.keys(overrides).length === 0 ? CHOIR : applyOverrides(overrides);
}

/** Current value for every editable field, for the admin form. */
export async function getSettingValues(): Promise<Record<string, string>> {
  const overrides = await loadOverrides();
  return Object.fromEntries(
    SETTING_KEYS.map((key) => [key, overrides[key] ?? defaultSetting(key)]),
  );
}
