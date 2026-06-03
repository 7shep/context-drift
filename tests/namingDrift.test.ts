import path from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeNamingDrift } from "../src/analyzers/namingDrift.js";
import { buildConventionProfile } from "../src/conventionProfile.js";
import type { RepoFile } from "../src/types.js";

function file(filePath: string, isChanged = false): RepoFile {
  const normalized = filePath.replaceAll("\\", "/");
  const parsed = path.posix.parse(normalized);
  return {
    path: normalized,
    name: parsed.base,
    extension: parsed.ext,
    directory: parsed.dir,
    isChanged
  };
}

function analyze(files: RepoFile[]): ReturnType<typeof analyzeNamingDrift> {
  const changedFiles = files.filter((repoFile) => repoFile.isChanged);
  return analyzeNamingDrift(changedFiles, files, buildConventionProfile(files));
}

describe("analyzeNamingDrift", () => {
  it("uses category evidence before folder and repository evidence", () => {
    const findings = analyze([
      file("src/features/api_client.ts", true),
      file("src/api/userClient.ts"),
      file("src/services/apiFetcher.ts"),
      file("src/features/legacy_helper.ts"),
      file("src/features/other_file.ts")
    ]);

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      file: "src/features/api_client.ts",
      confidence: 1,
      severity: "high",
      message: "Most API files use camelCase, but this file uses snake_case."
    });
    expect(findings[0].relatedFiles).toEqual([
      "src/api/userClient.ts",
      "src/services/apiFetcher.ts"
    ]);
  });

  it("falls back to same-folder evidence when the changed file category is unknown", () => {
    const findings = analyze([
      file("src/components/user_profile_card.tsx", true),
      file("src/components/UserCard.tsx"),
      file("src/components/UserMenu.tsx")
    ]);

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      type: "naming-drift",
      file: "src/components/user_profile_card.tsx",
      title: "File naming convention drift",
      message: "Most files in src/components use PascalCase, but this file uses snake_case.",
      suggestion: "Rename the file to match the existing naming convention.",
      confidence: 1,
      severity: "high"
    });
    expect(findings[0].relatedFiles).toEqual([
      "src/components/UserCard.tsx",
      "src/components/UserMenu.tsx"
    ]);
  });

  it("uses existing non-changed files as evidence", () => {
    const findings = analyze([
      file("src/components/user_profile_card.tsx", true),
      file("src/components/another_profile_card.tsx", true),
      file("src/components/UserCard.tsx"),
      file("src/components/UserMenu.tsx")
    ]);

    expect(findings).toHaveLength(2);
    expect(findings.map((finding) => finding.file)).toEqual([
      "src/components/user_profile_card.tsx",
      "src/components/another_profile_card.tsx"
    ]);
    expect(findings.every((finding) => finding.confidence === 1)).toBe(true);
  });

  it("does not report when evidence is too small or mixed", () => {
    expect(
      analyze([
        file("src/components/user_profile_card.tsx", true),
        file("src/components/UserCard.tsx")
      ])
    ).toEqual([]);

    expect(
      analyze([
        file("src/components/user_profile_card.tsx", true),
        file("src/components/UserCard.tsx"),
        file("src/components/user-menu.tsx")
      ])
    ).toEqual([]);
  });

  it("does not report when the changed file matches the dominant convention", () => {
    const findings = analyze([
      file("src/components/UserProfileCard.tsx", true),
      file("src/components/UserCard.tsx"),
      file("src/components/UserMenu.tsx")
    ]);

    expect(findings).toEqual([]);
  });

  it("ignores changed files with unknown naming style", () => {
    const findings = analyze([
      file("src/components/123Card.tsx", true),
      file("src/components/UserCard.tsx"),
      file("src/components/UserMenu.tsx")
    ]);

    expect(findings).toEqual([]);
  });

  it("maps confidence and severity from dominant style percentage", () => {
    const mediumFindings = analyze([
      file("src/components/user_profile_card.tsx", true),
      file("src/components/UserCard.tsx"),
      file("src/components/UserMenu.tsx"),
      file("src/components/UserSettings.tsx"),
      file("src/components/UserAvatar.tsx"),
      file("src/components/user-list.tsx")
    ]);
    expect(mediumFindings[0]).toMatchObject({
      confidence: 0.8,
      severity: "medium"
    });

    const lowFindings = analyze([
      file("src/components/user_profile_card.tsx", true),
      file("src/components/UserCard.tsx"),
      file("src/components/UserMenu.tsx"),
      file("src/components/user-list.tsx")
    ]);
    expect(lowFindings[0]).toMatchObject({
      confidence: 0.67,
      severity: "low"
    });
  });
});
