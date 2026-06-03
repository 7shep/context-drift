## Why

Milestone 4 added a reusable `ConventionProfile`, but the CLI still only reports aggregate naming percentages. The next useful product step is to turn that profile into an actionable finding when changed files introduce names that do not match nearby or category-level conventions. This is the first real drift analyzer and establishes the shape that later location and duplicate-utility analyzers can follow.

## What Changes

- Add an `analyzeNamingDrift(changedFiles, allFiles, profile): DriftFinding[]` function.
- Add a shared `DriftFinding` type with the MVP fields from the roadmap: type, severity, confidence, file, title, message, suggestion, and related files.
- Determine each changed file's naming style using the existing `detectNamingStyle` utility.
- Compare changed files against the dominant naming style from the same category first, then the same folder, then the whole-repo naming profile.
- Report a `naming-drift` finding only when the dominant convention is strong enough and differs from the changed file's style.
- Wire the CLI to run the analyzer against changed files, apply a minimum confidence threshold, and print findings after the existing summary.
- Add focused unit coverage for analyzer decisions and a CLI-level test for visible output.

## Capabilities

### New Capabilities
- `naming-drift`: reporting changed source files whose naming style differs from established repository conventions.

### Modified Capabilities
- CLI `check`: after scanning and profiling files, it can emit naming drift findings for files resolved through `--changed` or `--base`.

## Impact

- **New code**: `src/analyzers/namingDrift.ts`, `tests/namingDrift.test.ts`.
- **Modified code**: `src/types.ts` (add `DriftFinding`), `src/cli.ts` (run analyzer and print findings), possibly `README.md` for the new finding behavior.
- **Reused code**: `detectNamingStyle`, `classifyFileCategory`, `ConventionProfile`, changed-file resolution from the CLI.
- **No new dependencies**: the analyzer is deterministic and heuristic-based.
- **No AST/content parsing**: still deferred to later milestones.
