import { classifyFileCategory } from "../conventionProfile.js";
import { nameSimilarity } from "../similarity.js";
import type { ConventionProfile, DriftFinding, ExportedFunction, RepoFile } from "../types.js";

const MIN_SIMILARITY = 0.75;

export function analyzeDuplicateUtilityDrift(
  changedFiles: RepoFile[],
  _allFiles: RepoFile[],
  profile: ConventionProfile
): DriftFinding[] {
  if (changedFiles.length === 0 || profile.exportedFunctions.length === 0) {
    return [];
  }

  const changedPaths = new Set(changedFiles.map((file) => file.path));
  const baselineFunctions = profile.exportedFunctions.filter(
    (exportedFunction) => !changedPaths.has(exportedFunction.filePath)
  );
  const findings: DriftFinding[] = [];

  for (const changedFile of changedFiles) {
    if (classifyFileCategory(changedFile) !== "utility") {
      continue;
    }

    const changedFunctions = profile.exportedFunctions.filter(
      (exportedFunction) => exportedFunction.filePath === changedFile.path
    );
    for (const changedFunction of changedFunctions) {
      const match = findClosestFunction(changedFunction, baselineFunctions);
      if (!match || match.confidence < MIN_SIMILARITY) {
        continue;
      }

      findings.push(createFinding(changedFile, changedFunction, match.function, match.confidence));
    }
  }

  return findings;
}

function findClosestFunction(
  changedFunction: ExportedFunction,
  baselineFunctions: ExportedFunction[]
): { function: ExportedFunction; confidence: number } | undefined {
  return baselineFunctions
    .map((candidate) => ({
      function: candidate,
      confidence: nameSimilarity(changedFunction.name, candidate.name)
    }))
    .filter((candidate) => candidate.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence || compareExports(a.function, b.function))
    .at(0);
}

function createFinding(
  changedFile: RepoFile,
  changedFunction: ExportedFunction,
  existingFunction: ExportedFunction,
  confidence: number
): DriftFinding {
  return {
    type: "duplicate-utility",
    severity: severityForConfidence(confidence),
    confidence,
    file: changedFile.path,
    title: "Possible duplicate utility",
    message: `${changedFunction.name} looks similar to existing utility ${existingFunction.name} in ${existingFunction.filePath}.`,
    suggestion: "Check whether the existing utility can be reused or extended.",
    relatedFiles: [existingFunction.filePath]
  };
}

function compareExports(a: ExportedFunction, b: ExportedFunction): number {
  const pathComparison = compareStrings(a.filePath, b.filePath);
  return pathComparison !== 0 ? pathComparison : compareStrings(a.name, b.name);
}

function compareStrings(a: string, b: string): number {
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
