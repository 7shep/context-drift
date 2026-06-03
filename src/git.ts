import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { normalizePath } from "./scanner.js";

const execFileAsync = promisify(execFile);

/** Raised when git cannot produce a diff (e.g. unknown base ref, not a repo). */
export class GitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitError";
  }
}

/**
 * Parse the stdout of `git diff --name-only` into a clean list of normalized,
 * forward-slashed, repo-relative file paths.
 */
export function parseGitDiffOutput(stdout: string): string[] {
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(normalizePath);
}

/**
 * List files changed on the current branch relative to `base`, using the
 * three-dot range so the comparison is made against the merge-base (the same
 * semantics a pull request uses).
 */
export async function getChangedFilesFromGit(
  base: string,
  cwd: string = process.cwd()
): Promise<string[]> {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["diff", "--name-only", `${base}...HEAD`],
      { cwd, maxBuffer: 16 * 1024 * 1024 }
    );
    return parseGitDiffOutput(stdout);
  } catch (error) {
    const detail = extractGitErrorDetail(error);
    throw new GitError(
      `Could not determine files changed against base "${base}". ${detail}`
    );
  }
}

function extractGitErrorDetail(error: unknown): string {
  if (error && typeof error === "object" && "stderr" in error) {
    const stderr = String((error as { stderr: unknown }).stderr).trim();
    if (stderr.length > 0) {
      return stderr;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
