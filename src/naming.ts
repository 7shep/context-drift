import type { NamingStyle, NamingStyleSummary } from "./types.js";

type NameLike = string | { name: string };

/** Fixed order used for both rounding tie-breaks and reporting. */
const STYLE_ORDER: readonly NamingStyle[] = [
  "pascal-case",
  "camel-case",
  "kebab-case",
  "snake-case",
  "lower-case",
  "upper-case",
  "unknown"
];

/**
 * Classify a file's naming style from its name. Only the basename is
 * considered and the final extension is stripped first, so callers may pass a
 * bare filename ("UserCard.tsx") or a full path ("src/UserCard.tsx").
 *
 * - `user_profile_card` -> "snake-case"
 * - `user-profile-card` -> "kebab-case"
 * - `UserProfileCard` / `Card` -> "pascal-case" (leading caps + a lowercase)
 * - `userProfileCard` / `formatDate` -> "camel-case" (leading lower + a hump)
 * - `scanner` / `index` -> "lower-case" (all lowercase, no hump)
 * - `API` / `README` -> "upper-case" (all caps)
 * - leading digit/symbol or empty -> "unknown"
 */
export function detectNamingStyle(fileName: string): NamingStyle {
  const base = stripExtension(baseName(fileName));

  if (base.length === 0) {
    return "unknown";
  }
  if (base.includes("_")) {
    return "snake-case";
  }
  if (base.includes("-")) {
    return "kebab-case";
  }
  if (!/^[A-Za-z]/.test(base)) {
    return "unknown";
  }

  const hasUppercase = /[A-Z]/.test(base);
  const hasLowercase = /[a-z]/.test(base);

  if (/^[A-Z]/.test(base)) {
    // Leading uppercase: PascalCase needs a lowercase letter; otherwise ALLCAPS.
    return hasLowercase ? "pascal-case" : "upper-case";
  }
  // Leading lowercase: camelCase needs an internal uppercase ("hump").
  return hasUppercase ? "camel-case" : "lower-case";
}

/** Build whole-repo naming-style percentages from a list of files. */
export function summarizeNamingStyles(files: readonly NameLike[]): NamingStyleSummary {
  const counts = new Map<NamingStyle, number>(STYLE_ORDER.map((style) => [style, 0]));

  for (const file of files) {
    const name = typeof file === "string" ? file : file.name;
    const style = detectNamingStyle(name);
    counts.set(style, (counts.get(style) ?? 0) + 1);
  }

  const percents = roundToHundred(
    STYLE_ORDER.map((style) => counts.get(style) ?? 0),
    files.length
  );
  const byStyle = (style: NamingStyle): number => percents[STYLE_ORDER.indexOf(style)];

  return {
    pascalCasePercent: byStyle("pascal-case"),
    kebabCasePercent: byStyle("kebab-case"),
    camelCasePercent: byStyle("camel-case"),
    snakeCasePercent: byStyle("snake-case"),
    lowerCasePercent: byStyle("lower-case"),
    upperCasePercent: byStyle("upper-case"),
    unknownPercent: byStyle("unknown")
  };
}

/**
 * Convert counts to whole-number percentages that sum to exactly 100 using the
 * largest-remainder method. Returns all zeros when there is nothing to count.
 */
function roundToHundred(counts: readonly number[], total: number): number[] {
  if (total === 0) {
    return counts.map(() => 0);
  }

  const raw = counts.map((count) => (count / total) * 100);
  const floored = raw.map((value) => Math.floor(value));
  let remaining = 100 - floored.reduce((sum, value) => sum + value, 0);

  const byRemainder = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  for (const { index } of byRemainder) {
    if (remaining <= 0) {
      break;
    }
    floored[index] += 1;
    remaining -= 1;
  }

  return floored;
}

function baseName(filePath: string): string {
  const normalized = filePath.replaceAll("\\", "/");
  const slash = normalized.lastIndexOf("/");
  return slash === -1 ? normalized : normalized.slice(slash + 1);
}

function stripExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  // dot > 0 keeps dotfiles (e.g. ".eslintrc") intact instead of emptying them.
  return dot > 0 ? name.slice(0, dot) : name;
}
