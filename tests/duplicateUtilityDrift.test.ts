import path from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeDuplicateUtilityDrift } from "../src/analyzers/duplicateUtilityDrift.js";
import { buildConventionProfile } from "../src/conventionProfile.js";
import type { RepoFile } from "../src/types.js";

function file(filePath: string, content = "", isChanged = false): RepoFile {
  const normalized = filePath.replaceAll("\\", "/");
  const parsed = path.posix.parse(normalized);
  return {
    path: normalized,
    name: parsed.base,
    extension: parsed.ext,
    directory: parsed.dir,
    content,
    isChanged
  };
}

function analyze(files: RepoFile[]): ReturnType<typeof analyzeDuplicateUtilityDrift> {
  const changedFiles = files.filter((repoFile) => repoFile.isChanged);
  return analyzeDuplicateUtilityDrift(changedFiles, files, buildConventionProfile(files));
}

describe("analyzeDuplicateUtilityDrift", () => {
  it("reports changed utility exports similar to existing exported functions", () => {
    const findings = analyze([
      file("src/utils/dateFormat.ts", "export function formatDate() {}", true),
      file("src/lib/date/formatDateShort.ts", "export function formatDateShort() {}"),
      file("src/lib/date/parseDate.ts", "export function parseDate() {}")
    ]);

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      type: "duplicate-utility",
      severity: "high",
      confidence: 0.95,
      file: "src/utils/dateFormat.ts",
      title: "Possible duplicate utility",
      message:
        "formatDate looks similar to existing utility formatDateShort in src/lib/date/formatDateShort.ts.",
      suggestion: "Check whether the existing utility can be reused or extended.",
      relatedFiles: ["src/lib/date/formatDateShort.ts"]
    });
  });

  it("does not compare changed functions against other changed files", () => {
    const findings = analyze([
      file("src/utils/dateFormat.ts", "export function formatDate() {}", true),
      file("src/utils/dateFormatShort.ts", "export function formatDateShort() {}", true)
    ]);

    expect(findings).toEqual([]);
  });

  it("ignores changed files that are not utilities", () => {
    const findings = analyze([
      file("src/components/FormatDate.tsx", "export function formatDate() {}", true),
      file("src/lib/date/formatDateShort.ts", "export function formatDateShort() {}")
    ]);

    expect(findings).toEqual([]);
  });

  it("does not report weak name similarity", () => {
    const findings = analyze([
      file("src/utils/parseConfig.ts", "export function parseConfig() {}", true),
      file("src/lib/date/formatDateShort.ts", "export function formatDateShort() {}")
    ]);

    expect(findings).toEqual([]);
  });

  it("does not use test file exports as duplicate candidates", () => {
    const findings = analyze([
      file("src/utils/dateFormat.ts", "export function formatDate() {}", true),
      file("tests/conventionProfile.test.ts", "export function formatDate() {}")
    ]);

    expect(findings).toEqual([]);
  });

  it("does not use non-utility exports as duplicate candidates", () => {
    const findings = analyze([
      file("src/utils/dateFormat.ts", "export function formatDate() {}", true),
      file("src/components/FormatDateShort.tsx", "export function formatDateShort() {}")
    ]);

    expect(findings).toEqual([]);
  });
});
