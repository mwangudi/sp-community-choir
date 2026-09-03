"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { defaultSetting, SETTING_KEYS } from "@/lib/settings";

export type SettingsFormState = { error?: string; saved?: boolean };

/** Every public page that renders editable copy. */
const AFFECTED = ["/", "/about", "/contact", "/join", "/support"];

export async function saveSettings(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requireSession("ADMIN");

  const email = String(formData.get("email") ?? "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "That contact email address does not look right" };
  }

  await prisma.$transaction(
    SETTING_KEYS.map((key) => {
      const value = String(formData.get(key) ?? "").trim();
      // Storing the bundled default would only duplicate it.
      return value === "" || value === defaultSetting(key)
        ? prisma.siteSetting.deleteMany({ where: { key } })
        : prisma.siteSetting.upsert({
            where: { key },
            create: { key, value },
            update: { value },
          });
    }),
  );

  for (const path of AFFECTED) revalidatePath(path);
  return { saved: true };
}
