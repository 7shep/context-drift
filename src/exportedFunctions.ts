import type { ExportedFunction } from "./types.js";

const EXPORTED_FUNCTION_DECLARATION =
  /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
const EXPORTED_DEFAULT_FUNCTION_DECLARATION =
  /export\s+default\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
const EXPORTED_CONST_FUNCTION =
  /export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/g;

export function extractExportedFunctions(source: string, filePath: string): ExportedFunction[] {
  const names = new Set<string>();

  collectMatches(source, EXPORTED_FUNCTION_DECLARATION, names);
  collectMatches(source, EXPORTED_DEFAULT_FUNCTION_DECLARATION, names);
  collectMatches(source, EXPORTED_CONST_FUNCTION, names);

  return [...names].sort().map((name) => ({
    name,
    filePath
  }));
}

function collectMatches(source: string, pattern: RegExp, names: Set<string>): void {
  pattern.lastIndex = 0;
  for (const match of source.matchAll(pattern)) {
    const name = match[1];
    if (name) {
      names.add(name);
    }
  }
}
