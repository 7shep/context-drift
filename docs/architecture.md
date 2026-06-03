# Architecture

Context Drift is a small TypeScript CLI with a single runtime command:

```bash
context-drift check
```

## Core Modules

- `src/index.ts` starts the CLI entry point.
- `src/cli.ts` defines the `check` command, parses options, and prints output.
- `src/scanner.ts` finds supported source files and normalizes file paths.
- `src/git.ts` reads git diff output for `--base` comparisons.
- `src/naming.ts` classifies file names into naming styles and computes summaries.
- `src/types.ts` keeps the shared data shapes in one place.

## Data Flow

1. The CLI resolves changed files from `--changed` or `git diff --name-only <base>...HEAD`.
2. The scanner walks the repository with `fast-glob`.
3. Supported files are normalized to forward slashes and compared against the changed-file set.
4. The naming analyzer classifies file names and builds whole-repo percentages.
5. The CLI prints a compact summary for terminal and CI usage.

## Design Goals

- Keep the implementation small and easy to audit.
- Prefer deterministic output.
- Make changed-file detection match common pull request workflows.
- Avoid scanning generated output and vendor directories.

## Current Scope

The first milestone focuses on JavaScript and TypeScript source files:

- `**/*.ts`
- `**/*.tsx`
- `**/*.js`
- `**/*.jsx`

Ignored directories:

- `node_modules`
- `.git`
- `.next`
- `dist`
- `build`
- `coverage`

Future work can expand the scanner or add more analysis rules without changing the overall CLI shape.
