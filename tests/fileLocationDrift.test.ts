import path from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeFileLocationDrift } from "../src/analyzers/fileLocationDrift.js";
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

function analyze(files: RepoFile[]): ReturnType<typeof analyzeFileLocationDrift> {
  const changedFiles = files.filter((repoFile) => repoFile.isChanged);
  return analyzeFileLocationDrift(changedFiles, files, buildConventionProfile(files));
}

describe("analyzeFileLocationDrift", () => {
  it("reports changed files outside the common category folder", () => {
    const findings = analyze([
      file("src/utils/apiClient.ts", true),
      file("src/lib/api/client.ts"),
      file("src/lib/api/fetcher.ts")
    ]);

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      type: "location-drift",
      severity: "high",
      confidence: 1,
      file: "src/utils/apiClient.ts",
      title: "Unusual API file location",
      message: "This API file lives in src/utils, but similar files usually live in src/lib/api.",
      suggestion: "Consider moving this file closer to the existing API folder pattern."
    });
    expect(findings[0].relatedFiles).toEqual([
      "src/lib/api/client.ts",
      "src/lib/api/fetcher.ts"
    ]);
  });

  it("does not report when the changed file is already in a common folder", () => {
    const findings = analyze([
      file("src/lib/api/request.ts", true),
      file("src/lib/api/client.ts"),
      file("src/lib/api/fetcher.ts")
    ]);

    expect(findings).toEqual([]);
  });

  it("excludes changed files from location evidence", () => {
    const findings = analyze([
      file("src/utils/apiClient.ts", true),
      file("src/utils/requestClient.ts", true),
      file("src/lib/api/client.ts"),
      file("src/lib/api/fetcher.ts")
    ]);

    expect(findings).toHaveLength(2);
    expect(findings.every((finding) => finding.confidence === 1)).toBe(true);
  });

  it("does not report without enough baseline category files", () => {
    const findings = analyze([
      file("src/utils/apiClient.ts", true),
      file("src/lib/api/client.ts")
    ]);

    expect(findings).toEqual([]);
  });
});
