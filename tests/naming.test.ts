import { describe, expect, it } from "vitest";
import { detectNamingStyle, summarizeNamingStyles } from "../src/naming.js";
import type { NamingStyleSummary } from "../src/types.js";

const ZERO: NamingStyleSummary = {
  pascalCasePercent: 0,
  kebabCasePercent: 0,
  camelCasePercent: 0,
  snakeCasePercent: 0,
  lowerCasePercent: 0,
  upperCasePercent: 0,
  unknownPercent: 0
};

describe("detectNamingStyle", () => {
  it("classifies the canonical multi-word examples", () => {
    expect(detectNamingStyle("UserProfileCard.tsx")).toBe("pascal-case");
    expect(detectNamingStyle("user-profile-card.tsx")).toBe("kebab-case");
    expect(detectNamingStyle("userProfileCard.tsx")).toBe("camel-case");
    expect(detectNamingStyle("user_profile_card.tsx")).toBe("snake-case");
  });

  it("treats a single all-lowercase word as lower-case, not camel-case", () => {
    expect(detectNamingStyle("scanner.ts")).toBe("lower-case");
    expect(detectNamingStyle("index.js")).toBe("lower-case");
    expect(detectNamingStyle("client.ts")).toBe("lower-case");
  });

  it("requires an internal uppercase (a hump) for camel-case", () => {
    expect(detectNamingStyle("formatDate.ts")).toBe("camel-case");
    expect(detectNamingStyle("useUser.ts")).toBe("camel-case");
  });

  it("treats a single capitalized word as pascal-case", () => {
    expect(detectNamingStyle("Card.tsx")).toBe("pascal-case");
  });

  it("treats ALLCAPS names as upper-case, not unknown", () => {
    expect(detectNamingStyle("API.ts")).toBe("upper-case");
    expect(detectNamingStyle("README.tsx")).toBe("upper-case");
  });

  it("accepts a full path and only looks at the basename", () => {
    expect(detectNamingStyle("src/components/UserCard.tsx")).toBe("pascal-case");
    expect(detectNamingStyle("src/lib/api/api_client.ts")).toBe("snake-case");
    expect(detectNamingStyle("src/lib/client.ts")).toBe("lower-case");
  });

  it("strips only the final extension", () => {
    expect(detectNamingStyle("formatDate.test.ts")).toBe("camel-case");
  });

  it("prefers snake-case when both separators are present", () => {
    expect(detectNamingStyle("user_profile-card.ts")).toBe("snake-case");
  });

  it("returns unknown only for non-letter leading or empty names", () => {
    expect(detectNamingStyle("123abc.ts")).toBe("unknown");
    expect(detectNamingStyle("")).toBe("unknown");
  });
});

describe("summarizeNamingStyles", () => {
  it("returns all-zero percentages for an empty repo", () => {
    expect(summarizeNamingStyles([])).toEqual(ZERO);
  });

  it("computes percentages across a mixed set of files", () => {
    const files = [
      "UserProfileCard.tsx",
      "UserSettings.tsx",
      "user-profile-card.tsx",
      "useUser.ts",
      "api_client.ts"
    ];
    expect(summarizeNamingStyles(files)).toEqual({
      ...ZERO,
      pascalCasePercent: 40,
      kebabCasePercent: 20,
      camelCasePercent: 20,
      snakeCasePercent: 20
    });
  });

  it("separates lower-case and upper-case buckets", () => {
    expect(summarizeNamingStyles(["index.ts", "scanner.ts", "API.ts", "Card.tsx"])).toEqual({
      ...ZERO,
      lowerCasePercent: 50,
      upperCasePercent: 25,
      pascalCasePercent: 25
    });
  });

  it("rounds so the integer percentages sum to exactly 100", () => {
    const summary = summarizeNamingStyles(["Card.tsx", "useUser.ts", "client.ts"]);
    const total =
      summary.pascalCasePercent +
      summary.kebabCasePercent +
      summary.camelCasePercent +
      summary.snakeCasePercent +
      summary.lowerCasePercent +
      summary.upperCasePercent +
      summary.unknownPercent;
    expect(total).toBe(100);
    // 1/3 each -> largest-remainder gives 34/33/33 (first bucket by order wins the tie)
    expect(summary.pascalCasePercent).toBe(34);
    expect(summary.camelCasePercent).toBe(33);
    expect(summary.lowerCasePercent).toBe(33);
  });

  it("accepts objects exposing a name property", () => {
    const summary = summarizeNamingStyles([{ name: "Card.tsx" }, { name: "card-list.tsx" }]);
    expect(summary.pascalCasePercent).toBe(50);
    expect(summary.kebabCasePercent).toBe(50);
  });
});
