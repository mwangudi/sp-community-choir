import type { CopyrightStatus } from "@prisma/client";

/** Kept out of `rights.ts` so admin forms (client components) can use these. */
export function rightsLabel(status: CopyrightStatus): string {
  switch (status) {
    case "PUBLIC_DOMAIN":
      return "Public domain";
    case "LICENSED":
      return "Licensed to the choir";
    case "COPYRIGHTED":
      return "In copyright";
    default:
      return "Rights not yet confirmed";
  }
}

export function rightsNotice(status: CopyrightStatus, holder?: string | null): string {
  switch (status) {
    case "PUBLIC_DOMAIN":
      return "This work is in the public domain and may be freely reproduced.";
    case "LICENSED":
      return holder
        ? `Used with permission from ${holder}. Do not redistribute outside the choir.`
        : "Used under licence. Do not redistribute outside the choir.";
    case "COPYRIGHTED":
      return holder
        ? `© ${holder}. Scores are for rehearsal use by choir members only.`
        : "This work is in copyright. Scores are for rehearsal use by choir members only.";
    default:
      return "Copyright status has not been confirmed, so files are restricted to members.";
  }
}
