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
- `--min-confidence <number>`: filter findings below a confidence from `0` to `1`.

## Examples

```bash
npx context-drift check --base main
npx context-drift check --base origin/main
npx context-drift check --changed src/cli.ts,src/scanner.ts
npx context-drift check --format json
npx context-drift check --base origin/main --min-confidence 0.75
```

## Pull Request CI

The repository includes `.github/workflows/context-drift.yml`, which runs on pull requests to `main`.
It checks out full git history, runs the local composite action with `base-ref: origin/${{ github.base_ref }}`, and posts or updates one pull request comment when Markdown findings exist.

The workflow grants:

- `contents: read` to check out code.
- `pull-requests: read` to read pull request context.
- `issues: write` to create or update the pull request comment.

## Validation

Use the standard project checks when changing the scanner, git integration, or CLI output:

```bash
npm run build
npm test
npm run typecheck
```

If you only touch documentation, you can usually skip the code checks and verify the rendered Markdown instead.
