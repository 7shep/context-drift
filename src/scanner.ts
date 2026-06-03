import path from "node:path";
import fs from "node:fs/promises";
import fg from "fast-glob";
import type { RepoFile, ScanOptions } from "./types.js";

export const SUPPORTED_FILE_PATTERNS = [
  "**/*.ts",
  "**/*.tsx",
  "**/*.js",
  "**/*.jsx"
] as const;

export const IGNORED_DIRECTORIES = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage"
] as const;

const IGNORE_PATTERNS = IGNORED_DIRECTORIES.map((directory) => `**/${directory}/**`);

export async function scanRepo(options: ScanOptions = {}): Promise<RepoFile[]> {
  const cwd = options.cwd ?? process.cwd();
  const changedFileSet = new Set((options.changedFiles ?? []).map(normalizePath));

  const paths = await fg([...SUPPORTED_FILE_PATTERNS], {
    cwd,
    ignore: IGNORE_PATTERNS,
    onlyFiles: true,
    unique: true,
    dot: false
  });

  return Promise.all(paths.sort().map(async (filePath) => {
    const normalizedPath = normalizePath(filePath);
    const parsed = path.posix.parse(normalizedPath);
    const content = await fs.readFile(path.join(cwd, normalizedPath), "utf8");

    return {
      path: normalizedPath,
      name: parsed.base,
      extension: parsed.ext,
      directory: parsed.dir,
      content,
      isChanged: changedFileSet.has(normalizedPath)
    };
  }));
}

export function normalizePath(filePath: string): string {
  return filePath.replaceAll("\\", "/").replace(/^\.?\//, "");
}

export function isSupportedSourceFile(filePath: string): boolean {
  return /\.(ts|tsx|js|jsx)$/i.test(filePath);
}
