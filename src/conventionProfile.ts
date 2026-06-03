import { detectNamingStyle, summarizeNamingStyles } from "./naming.js";
import { extractExportedFunctions } from "./exportedFunctions.js";
import type { ConventionProfile, FileCategory, RepoFile } from "./types.js";

/** Next.js special files that name a route rather than a component/util. */
const ROUTE_BASENAMES = new Set([
  "page",
  "layout",
  "route",
  "loading",
  "error",
  "template",
  "default",
  "not-found",
  "middleware"
]);

const API_NAME = /(api|client|fetcher|request)/i;
const SERVICE_NAME = /service/i;
const UTILITY_NAME = /(format|parse|validate|calculate|normalize)/i;
const UTILITY_DIRS = new Set(["utils", "lib", "helpers"]);

/**
 * Classify a file into exactly one category using path- and name-based
 * heuristics only (no content reads, no AST). Precedence is first-match-wins,
 * most specific first: test -> route -> hook -> component -> api -> service ->
 * utility -> unknown.
 */
export function classifyFileCategory(file: RepoFile): FileCategory {
  const base = stripExtension(file.name);
  const segments = directorySegments(file.directory);

  if (file.name.includes(".test.") || file.name.includes(".spec.")) {
    return "test";
  }
  if (ROUTE_BASENAMES.has(base)) {
    return "route";
  }
  if (/^use[A-Z0-9]/.test(base) || segments.includes("hooks")) {
    return "hook";
  }
  if (isJsxExtension(file.extension) && detectNamingStyle(file.name) === "pascal-case") {
    return "component";
  }
  if (API_NAME.test(base) || segments.includes("api")) {
    return "api";
  }
  if (SERVICE_NAME.test(base) || segments.includes("services")) {
    return "service";
  }
  if (UTILITY_NAME.test(base) || segments.some((segment) => UTILITY_DIRS.has(segment))) {
    return "utility";
  }
  return "unknown";
}

/**
 * Summarize scanned files into a single convention profile. Pure: it does no
 * I/O, reads no file contents, and does not mutate its input. `exportedFunctions`
 * is intentionally empty here; populating it needs AST extraction (later work).
 */
export function buildConventionProfile(files: RepoFile[]): ConventionProfile {
  const dirCountsByCategory = new Map<FileCategory, Map<string, number>>();

  for (const file of files) {
    const category = classifyFileCategory(file);
    if (category === "unknown") {
      continue;
    }
    let dirCounts = dirCountsByCategory.get(category);
    if (!dirCounts) {
      dirCounts = new Map<string, number>();
      dirCountsByCategory.set(category, dirCounts);
    }
    dirCounts.set(file.directory, (dirCounts.get(file.directory) ?? 0) + 1);
  }

  return {
    filesScanned: files.length,
    naming: summarizeNamingStyles(files),
    folders: {
      components: rankFolders(dirCountsByCategory.get("component")),
      hooks: rankFolders(dirCountsByCategory.get("hook")),
      api: rankFolders(dirCountsByCategory.get("api")),
      services: rankFolders(dirCountsByCategory.get("service")),
      utilities: rankFolders(dirCountsByCategory.get("utility")),
      routes: rankFolders(dirCountsByCategory.get("route")),
      tests: rankFolders(dirCountsByCategory.get("test"))
    },
    exportedFunctions: files.flatMap((file) =>
      file.content === undefined ? [] : extractExportedFunctions(file.content, file.path)
    )
  };
}

/** Order directories by descending file count, breaking ties by path. */
function rankFolders(dirCounts: Map<string, number> | undefined): string[] {
  if (!dirCounts) {
    return [];
  }
  return [...dirCounts.entries()]
    .sort((a, b) => b[1] - a[1] || comparePaths(a[0], b[0]))
    .map(([directory]) => directory);
}

function comparePaths(a: string, b: string): number {
  if (a < b) {
    return -1;
  }
  return a > b ? 1 : 0;
}

function stripExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  // dot > 0 keeps dotfiles (e.g. ".eslintrc") intact instead of emptying them.
  return dot > 0 ? name.slice(0, dot) : name;
}

function directorySegments(directory: string): string[] {
  return directory.split("/").filter(Boolean);
}

function isJsxExtension(extension: string): boolean {
  return extension === ".tsx" || extension === ".jsx";
}
