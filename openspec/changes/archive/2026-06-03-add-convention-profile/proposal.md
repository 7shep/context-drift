## Why

The analyzers planned for later milestones (naming drift, location drift, duplicate utilities) all need a single, reusable picture of "how this repo normally does things." Today that knowledge is scattered: naming percentages are computed ad hoc inside the CLI, and there is no notion of which folders hold components, hooks, APIs, or utilities. Building one convention profile now gives every downstream analyzer a stable input and keeps the CLI thin.

## What Changes

- Add `buildConventionProfile(files: RepoFile[]): ConventionProfile`, a pure function that summarizes the scanned repository into a single profile object.
- The profile reports: files scanned, naming-style percentages (reusing the existing milestone 3 logic), and the common folders for each file category (component, hook, api, utility, service, route, test).
- Add lightweight, path- and name-based file **category classification** (`classifyFileCategory`) using simple heuristics — no file content reads and no AST parsing.
- Surface a `ConventionProfile` (and supporting `FileCategory`) type in `src/types.ts`.
- Wire the CLI `check` command to build the profile from scanned files and reuse its naming summary for the existing output (no new CLI flags, no output-format change).
- Reserve an `exportedFunctions` field on the profile but leave it empty for now; populating it requires AST extraction, which is deferred to a later milestone.

## Capabilities

### New Capabilities
- `convention-profile`: building a structured summary of a repository's existing conventions (naming-style distribution, per-category folder usage, and file-category classification) from a list of scanned files.

### Modified Capabilities
<!-- None: no existing spec-level behavior changes. Naming-style detection stays as-is and is consumed by the new profile. -->

## Impact

- **New code**: `src/conventionProfile.ts` (builder + category classifier), `tests/conventionProfile.test.ts`.
- **Modified code**: `src/types.ts` (new `ConventionProfile`, `FileCategory`, `ExportedFunction` types), `src/cli.ts` (build profile, drive naming output from it).
- **Reused code**: `summarizeNamingStyles` from `src/naming.ts`; `RepoFile` from the scanner.
- **No new dependencies**: classification is heuristic and path-based; `ts-morph` / content analysis are explicitly out of scope here.
- **No breaking changes**: CLI output and flags are unchanged.
