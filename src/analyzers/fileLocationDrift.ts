import { classifyFileCategory } from "../conventionProfile.js";
import type { ConventionProfile, DriftFinding, FileCategory, RepoFile } from "../types.js";

const CATEGORY_MIN_FILES = 2;
const RELATED_FILE_LIMIT = 3;

const CATEGORY_LABELS: Record<Exclude<FileCategory, "unknown">, string> = {
  component: "component",
  hook: "hook",
  api: "API",
  service: "service",
  utility: "utility",
  route: "route",
  test: "test"
};

export function analyzeFileLocationDrift(
  changedFiles: RepoFile[],
  allFiles: RepoFile[],
  _profile: ConventionProfile
): DriftFinding[] {
  if (changedFiles.length === 0) {
    return [];
  }

  const changedPaths = new Set([
    ...changedFiles.map((file) => file.path),
    ...allFiles.filter((file) => file.isChanged).map((file) => file.path)
  ]);
  const baselineFiles = allFiles.filter((file) => !changedPaths.has(file.path));
  const findings: DriftFinding[] = [];

  for (const changedFile of changedFiles) {
    const category = classifyFileCategory(changedFile);
    if (category === "unknown") {
      continue;
    }

    const categoryFiles = baselineFiles.filter((file) => classifyFileCategory(file) === category);
    if (categoryFiles.length < CATEGORY_MIN_FILES) {
      continue;
    }

    const commonFolders = rankFolders(categoryFiles);
    if (commonFolders.length === 0 || commonFolders.includes(changedFile.directory)) {
      continue;
    }

    const matchingFolderFiles = categoryFiles.filter((file) => commonFolders.includes(file.directory));
    if (matchingFolderFiles.length === 0) {
      continue;
    }

    findings.push(createFinding(changedFile, category, commonFolders, categoryFiles, matchingFolderFiles));
  }

  return findings;
}

function rankFolders(files: RepoFile[]): string[] {
  const counts = new Map<string, number>();
  for (const file of files) {
    counts.set(file.directory, (counts.get(file.directory) ?? 0) + 1);
  }

  const highestCount = Math.max(...counts.values());
  return [...counts.entries()]
    .filter(([, count]) => count === highestCount)
    .sort((a, b) => comparePaths(a[0], b[0]))
    .map(([directory]) => directory);
}

function createFinding(
  changedFile: RepoFile,
  category: Exclude<FileCategory, "unknown">,
  commonFolders: string[],
  categoryFiles: RepoFile[],
  matchingFolderFiles: RepoFile[]
): DriftFinding {
  const primaryFolder = commonFolders[0] ?? ".";
  const confidence = roundConfidence(matchingFolderFiles.length / categoryFiles.length);
  const label = CATEGORY_LABELS[category];
  const relatedFiles = matchingFolderFiles
    .map((file) => file.path)
    .sort()
    .slice(0, RELATED_FILE_LIMIT);

  return {
    type: "location-drift",
    severity: severityForConfidence(confidence),
    confidence,
    file: changedFile.path,
    title: `Unusual ${label} file location`,
    message: `This ${label} file lives in ${changedFile.directory || "."}, but similar files usually live in ${primaryFolder}.`,
    suggestion: `Consider moving this file closer to the existing ${label} folder pattern.`,
    ...(relatedFiles.length > 0 ? { relatedFiles } : {})
  };
}

function roundConfidence(value: number): number {
  return Math.round(value * 100) / 100;
}

function comparePaths(a: string, b: string): number {
  if (a < b) {
    return -1;
  }
  return a > b ? 1 : 0;
}

function severityForConfidence(confidence: number): DriftFinding["severity"] {
  if (confidence >= 0.9) {
    return "high";
  }
  if (confidence >= 0.75) {
    return "medium";
  }
  return "low";
}
