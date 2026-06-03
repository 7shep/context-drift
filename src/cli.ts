import { Command, InvalidArgumentError } from "commander";
import { getChangedFilesFromGit } from "./git.js";
import { isSupportedSourceFile, normalizePath, scanRepo } from "./scanner.js";
import type { CheckOptions, OutputFormat } from "./types.js";

const DEFAULT_FORMAT: OutputFormat = "markdown";

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
  const changedFileCount = files.filter((file) => file.isChanged).length;

  printSummary({
    filesScanned: files.length,
    changedFiles: changedFileCount,
    format: options.format
  });
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
