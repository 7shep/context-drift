# Checks

This project currently exposes a single repository check:

```bash
context-drift check
```

## What It Does

- Scans supported source files in the current repository.
- Marks files as changed using either `--changed` or `--base`.
- Prints naming-style percentages for the scanned files.

## Options

- `--base <branch>`: compare the current branch against `<branch>...HEAD` and use the diff as the changed-file set.
- `--changed <files>`: provide a comma-separated list of repo-relative paths to treat as changed.
- `--format <format>`: choose `markdown` or `json` output formatting.

## Examples

```bash
npx context-drift check --base main
npx context-drift check --base origin/main
npx context-drift check --changed src/cli.ts,src/scanner.ts
npx context-drift check --format json
```

## Validation

Use the standard project checks when changing the scanner, git integration, or CLI output:

```bash
npm run build
npm test
npm run typecheck
```

If you only touch documentation, you can usually skip the code checks and verify the rendered Markdown instead.
