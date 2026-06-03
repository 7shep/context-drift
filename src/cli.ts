import { Command, InvalidArgumentError } from "commander";
import { analyzeDuplicateUtilityDrift } from "./analyzers/duplicateUtilityDrift.js";
import { analyzeFileLocationDrift } from "./analyzers/fileLocationDrift.js";
import { analyzeNamingDrift } from "./analyzers/namingDrift.js";
import { buildConventionProfile } from "./conventionProfile.js";
import { getChangedFilesFromGit } from "./git.js";
import { renderJsonReport } from "./reporters/jsonReporter.js";
import { renderMarkdownReport } from "./reporters/markdownReporter.js";
import { isSupportedSourceFile, normalizePath, scanRepo } from "./scanner.js";
import type { CheckOptions, CheckReport, DriftFinding, OutputFormat } from "./types.js";

const DEFAULT_FORMAT: OutputFormat = "markdown";
const DEFAULT_MIN_CONFIDENCE = 0.75;

export function createCli(): Command {
  const program = new Command();

  program
    .name("context-drift")
    .description("Detect when new code does not match existing repository conventions.")
    .version("0.1.0");

  program
    .command("check")
    .description("Scan the current repository for supported source files.")
    .option("-f, --format <format>", "output format: markdown or json", parseFormat, DEFAULT_FORMAT)
    .option("--base <branch>", "git base branch/ref to diff changed files against")
    .option("--changed <files>", "comma-separated list of changed files", parseChangedFiles, [])
    .option(
      "--min-confidence <number>",
      "minimum finding confidence from 0 to 1",
      parseMinConfidence,
      DEFAULT_MIN_CONFIDENCE
    )
    .action(async (options: CheckOptions) => {
      try {
        await runCheck(options);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error: ${message}`);
        process.exitCode = 1;
      }
    });

  return program;
}

async function runCheck(options: CheckOptions): Promise<void> {
  const changedFiles = (await resolveChangedFiles(options)).filter(isSupportedSourceFile);
  const files = await scanRepo({ changedFiles });
  const profile = buildConventionProfile(files);
  const changedRepoFiles = files.filter((file) => file.isChanged);
  const changedFileCount = changedRepoFiles.length;
  const findings = [
    ...analyzeNamingDrift(changedRepoFiles, files, profile),
    ...analyzeFileLocationDrift(changedRepoFiles, files, profile),
    ...analyzeDuplicateUtilityDrift(changedRepoFiles, files, profile)
  ].filter((finding) => finding.confidence >= options.minConfidence);
  const report = buildReport(profile.filesScanned, changedFileCount, profile.naming, findings);

  console.log(options.format === "json" ? renderJsonReport(report) : renderMarkdownReport(report));
}

/**
 * Decide which files count as "changed": an explicit --changed list wins,
 * otherwise diff against --base, otherwise nothing is treated as changed.
 */
async function resolveChangedFiles(options: CheckOptions): Promise<string[]> {
  if (options.changed.length > 0) {
    return options.changed;
  }

  if (options.base) {
    return getChangedFilesFromGit(options.base);
  }

  return [];
}

function buildReport(
  filesScanned: number,
  changedFiles: number,
  naming: CheckReport["naming"],
  findings: DriftFinding[]
): CheckReport {
  return {
    summary: {
      filesScanned,
      changedFiles,
      findings: findings.length,
      high: findings.filter((finding) => finding.severity === "high").length,
      medium: findings.filter((finding) => finding.severity === "medium").length,
      low: findings.filter((finding) => finding.severity === "low").length
    },
    naming,
    findings
  };
}

function parseFormat(format: string): OutputFormat {
  if (format === "markdown" || format === "json") {
    return format;
  }

  throw new InvalidArgumentError("format must be either markdown or json");
}

function parseChangedFiles(value: string): string[] {
  return value
    .split(",")
    .map((filePath) => normalizePath(filePath.trim()))
    .filter(Boolean);
}

function parseMinConfidence(value: string): number {
  const confidence = Number(value);
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    throw new InvalidArgumentError("min-confidence must be a number from 0 to 1");
  }
  return confidence;
}
