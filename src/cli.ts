import { Command, InvalidArgumentError } from "commander";
import { analyzeNamingDrift } from "./analyzers/namingDrift.js";
import { buildConventionProfile } from "./conventionProfile.js";
import { getChangedFilesFromGit } from "./git.js";
import { isSupportedSourceFile, normalizePath, scanRepo } from "./scanner.js";
import type { CheckOptions, DriftFinding, NamingStyleSummary, OutputFormat } from "./types.js";

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
  const findings = analyzeNamingDrift(changedRepoFiles, files, profile).filter(
    (finding) => finding.confidence >= options.minConfidence
  );

  printSummary({
    filesScanned: profile.filesScanned,
    changedFiles: changedFileCount,
    format: options.format
  });
  printNamingConventions(profile.naming);
  printFindings(findings);
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

function printSummary(summary: { filesScanned: number; changedFiles: number; format: OutputFormat }): void {
  console.log("Context Drift");
  console.log("");
  console.log(`Files scanned: ${summary.filesScanned}`);
  console.log(`Changed files: ${summary.changedFiles}`);
  console.log(`Format: ${summary.format}`);
}

function printNamingConventions(naming: NamingStyleSummary): void {
  const rows: Array<[string, number]> = [
    ["PascalCase", naming.pascalCasePercent],
    ["camelCase", naming.camelCasePercent],
    ["kebab-case", naming.kebabCasePercent],
    ["snake_case", naming.snakeCasePercent],
    ["lowercase", naming.lowerCasePercent],
    ["UPPERCASE", naming.upperCasePercent],
    ["unknown", naming.unknownPercent]
  ];

  console.log("");
  console.log("Naming conventions:");

  const present = rows.filter(([, percent]) => percent > 0);
  if (present.length === 0) {
    console.log("- (no source files)");
    return;
  }

  for (const [label, percent] of present) {
    console.log(`- ${label}: ${percent}%`);
  }
}

function printFindings(findings: DriftFinding[]): void {
  if (findings.length === 0) {
    return;
  }

  console.log("");
  console.log("Naming drift findings:");

  for (const finding of findings) {
    console.log("");
    console.log(`- ${finding.title} (${Math.round(finding.confidence * 100)}%, ${finding.severity})`);
    console.log(`  File: ${finding.file}`);
    console.log(`  ${finding.message}`);
    if (finding.suggestion) {
      console.log(`  Suggestion: ${finding.suggestion}`);
    }
    if (finding.relatedFiles && finding.relatedFiles.length > 0) {
      console.log("  Related files:");
      for (const relatedFile of finding.relatedFiles) {
        console.log(`  - ${relatedFile}`);
      }
    }
  }
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
