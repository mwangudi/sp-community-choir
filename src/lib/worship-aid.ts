/**
 * File name for a downloaded worship aid. Sundays follow the choir's own
 * convention, "27th Sun OT Year A.pdf"; plan names were typed many ways
 * ("23RD SUNDAY in Ordinary Time", "33rd Sun Ordinary Time,") so they are
 * normalised first.
 */

const SMALL = new Set(["of", "in", "the", "and", "a"]);

function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

function sundayName(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .replace(/[\s,.;:]+$/, "")
    .replace(/\b(?:in\s+)?ordinary\s+time\b/gi, "OT")
    .split(" ")
    .map((word, i) => {
      const number = /^(\d+)(?:st|nd|rd|th)?$/i.exec(word);
      if (number) return ordinal(Number(number[1]));
      // Keep any bracket or comma around it: "(Laetare Sunday)".
      const sunday = /^(\W*)sun(?:day)?(\W*)$/i.exec(word);
      if (sunday) return `${sunday[1]}Sun${sunday[2]}`;
      if (word === "OT") return word;
      const lower = word.toLowerCase();
      if (i > 0 && SMALL.has(lower)) return lower;
      // Typed in capitals for emphasis; read as a title.
      if (word.length > 1 && word === word.toUpperCase()) {
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      }
      return word;
    })
    .join(" ");
}

export function worshipAidFileName(plan: {
  kind: string;
  name: string;
  year: string | null;
  date: Date;
}): string {
  const day = plan.date.toISOString().slice(0, 10);
  const base =
    plan.kind === "SUNDAY"
      ? `${sundayName(plan.name)}${plan.year ? ` Year ${plan.year}` : ""}`
      : `worship-aid-${plan.kind.toLowerCase()}-${day}`;
  // Characters a file system or a Content-Disposition header will not take.
  return `${base.replace(/[\\/:*?"<>|]+/g, "-").trim() || `worship-aid-${day}`}.pdf`;
}

/** Content-Disposition with an ASCII fallback and the exact UTF-8 name. */
export function contentDisposition(type: "inline" | "attachment", fileName: string): string {
  const ascii = fileName.normalize("NFKD").replace(/[^\x20-\x7e]/g, "-");
  return `${type}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
