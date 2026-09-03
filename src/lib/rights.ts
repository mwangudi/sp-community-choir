import "server-only";

import type { CopyrightStatus } from "@prisma/client";
import { getSession } from "@/lib/auth";

export type RightsInfo = {
  status: CopyrightStatus;
  rightsHolder?: string | null;
  licenceRef?: string | null;
};

/**
 * Score and MIDI files are shared under licence with the choir, so links are
 * only exposed to signed-in members. Public-domain works stay open.
 */
export async function canAccessScores(status?: CopyrightStatus): Promise<boolean> {
  if (status === "PUBLIC_DOMAIN") return true;
  return Boolean(await getSession());
}

export { rightsLabel, rightsNotice } from "@/lib/rights-labels";
