# AGENTS.md

This repository is a small TypeScript CLI for detecting naming drift in source files. Agents working here should keep changes narrow, test-backed, and aligned with the existing file layout.

## Start Here

Read these files first:

- `README.md` for product behavior, CLI usage, supported file types, ignored directories, and the documented project layout.
- `package.json` for the available scripts and runtime requirements.
- `src/index.ts` for the CLI entry point.
- `src/cli.ts` for command parsing, reporting, and changed-file resolution.
- `src/scanner.ts` for repository scanning and path normalization.
- `src/git.ts` for git diff handling and error behavior.
- `src/naming.ts` for naming-style classification and summary logic.
- `src/conventionProfile.ts` for the convention profile heuristics.
- `src/types.ts` for shared types.
- `tests/*.test.ts` for the current Vitest expectations.
- `openspec/config.yaml` and the files under `openspec/specs/` and `openspec/changes/` for the spec-driven workflow used in this repo.

## Working Rules

- Prefer the existing helpers and heuristics before adding new abstractions.
- Keep behavior deterministic and local; this project does not depend on AST parsing or external services for its current features.
- When adding CLI behavior, keep `src/cli.ts` as the orchestration layer and move reusable logic into `src/` modules.
- When adding new heuristics, update the relevant test file in `tests/` at the same time.
- Preserve the current path normalization rules: repo-relative paths should use forward slashes, and supported source files are the TypeScript/JavaScript extensions already listed in `src/scanner.ts`.
- Match the existing output style: compact terminal-friendly summaries first, then any extra detail.

## Keeping Contributions Clean

- Make one logical change per branch or worktree whenever possible.
- Avoid unrelated formatting churn, renames, and dependency bumps.
- Do not edit generated output, build artifacts, or lockfiles unless the change requires it.
- Keep diffs small and explicit; reuse existing names, ordering, and message style where possible.
- Update README or OpenSpec artifacts only when the user-facing behavior or workflow actually changes.
- Run the smallest useful verification set for the change, then expand if the surface area grows. For this repo, that usually means `npm test`, `npm run typecheck`, and `npm run build`.
- If a change depends on a spec update, keep the implementation, tests, and `openspec/` artifacts in sync.

## Project-Specific Notes

- `src/cli.ts` currently wires the `check` command and handles format validation.
- `src/scanner.ts` owns file discovery and ignores `node_modules`, `.git`, `.next`, `dist`, `build`, and `coverage`.
- `src/git.ts` wraps `git diff --name-only` and should keep errors actionable.
- `src/naming.ts` defines the naming categories and summary percentages.
- `src/conventionProfile.ts` turns scanned files into a reusable profile for reporting and later analyzers.
- `tests/scanner.test.ts`, `tests/git.test.ts`, `tests/naming.test.ts`, and `tests/conventionProfile.test.ts` are the current coverage anchors for behavior changes.

## Verification

Use the repo scripts from `package.json`:

- `npm test`
- `npm run typecheck`
- `npm run build`

Prefer the smallest command set that proves the change, but do not skip tests when you touch shared logic or CLI output.
