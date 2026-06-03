import { classifyFileCategory } from "../conventionProfile.js";
import { detectNamingStyle } from "../naming.js";
import type {
  ConventionProfile,
  DriftFinding,
  FileCategory,
  NamingStyle,
  RepoFile
} from "../types.js";

const CATEGORY_MIN_FILES = 2;
const DIRECTORY_MIN_FILES = 2;
const REPOSITORY_MIN_FILES = 2;
const CATEGORY_MIN_PERCENT = 60;
const DIRECTORY_MIN_PERCENT = 60;
const REPOSITORY_MIN_PERCENT = 70;
const RELATED_FILE_LIMIT = 3;

type EvidenceSource = "category" | "directory" | "repository";

type Evidence = {
  source: EvidenceSource;
  label: string;
  dominantStyle: NamingStyle;
  percent: number;
  files: RepoFile[];
};

const STYLE_LABELS: Record<NamingStyle, string> = {
  "pascal-case": "PascalCase",
  "kebab-case": "kebab-case",
  "camel-case": "camelCase",
  "snake-case": "snake_case",
  "lower-case": "lowercase",
  "upper-case": "UPPERCASE",
  unknown: "unknown"
};

const CATEGORY_LABELS: Record<Exclude<FileCategory, "unknown">, string> = {
  component: "component files",
  hook: "hook files",
  api: "API files",
  service: "service files",
  utility: "utility files",
  route: "route files",
  test: "test files"
};

export function analyzeNamingDrift(
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
    const changedStyle = detectNamingStyle(changedFile.name);
    if (changedStyle === "unknown") {
      continue;
    }

    const evidence = selectEvidence(changedFile, baselineFiles);
    if (!evidence || evidence.dominantStyle === changedStyle) {
      continue;
    }

    findings.push(createFinding(changedFile, changedStyle, evidence));
  }

  return findings;
}

function selectEvidence(changedFile: RepoFile, baselineFiles: RepoFile[]): Evidence | undefined {
  const category = classifyFileCategory(changedFile);
  if (category !== "unknown") {
    const categoryFiles = baselineFiles.filter((file) => classifyFileCategory(file) === category);
    const categoryEvidence = buildEvidence(
      "category",
      CATEGORY_LABELS[category],
      categoryFiles,
      CATEGORY_MIN_FILES,
      CATEGORY_MIN_PERCENT
    );
    if (categoryEvidence) {
      return categoryEvidence;
    }
  }

  const directoryFiles = baselineFiles.filter((file) => file.directory === changedFile.directory);
  const directoryEvidence = buildEvidence(
    "directory",
    `files in ${changedFile.directory || "."}`,
    directoryFiles,
    DIRECTORY_MIN_FILES,
    DIRECTORY_MIN_PERCENT
  );
  if (directoryEvidence) {
    return directoryEvidence;
  }

  return buildEvidence(
    "repository",
    "repository files",
    baselineFiles,
    REPOSITORY_MIN_FILES,
    REPOSITORY_MIN_PERCENT
  );
}

function buildEvidence(
  source: EvidenceSource,
  label: string,
  files: RepoFile[],
  minFiles: number,
  minPercent: number
): Evidence | undefined {
  const counts = new Map<NamingStyle, number>();
  const knownFiles = files.filter((file) => detectNamingStyle(file.name) !== "unknown");

  if (knownFiles.length < minFiles) {
    return undefined;
  }

  for (const file of knownFiles) {
    const style = detectNamingStyle(file.name);
    counts.set(style, (counts.get(style) ?? 0) + 1);
  }

  const dominant = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || compareStyle(a[0], b[0]))
    .at(0);

  if (!dominant) {
    return undefined;
  }

  const [dominantStyle, count] = dominant;
  const percent = Math.round((count / knownFiles.length) * 100);
  if (percent < minPercent) {
    return undefined;
  }

  return {
    source,
    label,
    dominantStyle,
    percent,
    files: knownFiles
  };
}

function createFinding(
  changedFile: RepoFile,
  changedStyle: NamingStyle,
  evidence: Evidence
): DriftFinding {
  const confidence = evidence.percent / 100;
  const relatedFiles =
    evidence.source === "repository"
      ? undefined
      : evidence.files
          .filter((file) => detectNamingStyle(file.name) === evidence.dominantStyle)
          .map((file) => file.path)
          .sort()
          .slice(0, RELATED_FILE_LIMIT);

  return {
    type: "naming-drift",
    severity: severityForConfidence(confidence),
    confidence,
    file: changedFile.path,
    title: "File naming convention drift",
    message: `Most ${evidence.label} use ${STYLE_LABELS[evidence.dominantStyle]}, but this file uses ${STYLE_LABELS[changedStyle]}.`,
    suggestion: "Rename the file to match the existing naming convention.",
    ...(relatedFiles && relatedFiles.length > 0 ? { relatedFiles } : {})
  };
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

function compareStyle(a: NamingStyle, b: NamingStyle): number {
  return styleRank(a) - styleRank(b);
}

function styleRank(style: NamingStyle): number {
  const order: NamingStyle[] = [
    "pascal-case",
    "camel-case",
    "kebab-case",
    "snake-case",
    "lower-case",
    "upper-case",
    "unknown"
  ];
  return order.indexOf(style);
}
