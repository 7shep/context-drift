<h1 align="center">
  <br>
  Context Drift
</h1>

<h4 align="center">A small CLI for spotting when new code starts to drift from your repository's naming conventions.</h4>

<p align="center">
  <img src="https://img.shields.io/badge/node-20%2B-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node 20+">
  <img src="https://img.shields.io/badge/typescript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/cli-utility-111827?style=flat-square&logo=windowsterminal&logoColor=white" alt="CLI utility">
</p>

<p align="center">
  Context Drift scans supported source files, summarizes their naming styles, and highlights the files that changed relative to git or an explicit file list.
</p>

<table>
<tr>
<td>

**What it checks**

- `**/*.ts`
- `**/*.tsx`
- `**/*.js`
- `**/*.jsx`

**What it ignores**

- `node_modules`
- `.git`
- `.next`
- `dist`
- `build`
- `coverage`

</td>
</tr>
</table>

## Quick Start

```bash
npm install
npm run build
npx context-drift check --base main
```

If you already know which files changed, you can pass them directly:

```bash
npx context-drift check --changed src/cli.ts,src/scanner.ts
```

## Output

The default report is intentionally simple:

```txt
Context Drift

Files scanned: 142
Changed files: 3
Format: markdown

Naming conventions:
- PascalCase: 12%
- kebab-case: 18%
- camelCase: 41%
- snake_case: 9%
- lower-case: 20%
- upper-case: 0%
```

## CLI

The project exposes one command:

```bash
context-drift check
```

Options:

- `--base <branch>`: diff against `base...HEAD` and treat those files as changed.
- `--changed <files>`: comma-separated, repo-relative paths to mark as changed.
- `--format <format>`: accepts `markdown` or `json` and is reflected in the report header.

Examples:

```bash
npx context-drift check --base origin/main
npx context-drift check --format json
npx context-drift check --changed src/index.ts,src/cli.ts
```

## Development

```bash
npm run dev
npm test
npm run typecheck
```

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

Typical contribution flow:

1. Create a branch for one issue.
2. Make the smallest change that solves that issue.
3. Run the relevant checks:
   - `npm run build`
   - `npm test`
   - `npm run typecheck`
4. Open a focused PR with a clear summary and validation notes.

## How It Works

1. Resolve changed files from `--changed` or `git diff --name-only <base>...HEAD`.
2. Scan the repository for supported source files.
3. Normalize paths and mark files that are part of the changed set.
4. Classify file names into naming styles such as PascalCase, camelCase, kebab-case, and snake_case.
5. Print a compact summary that is easy to read in a terminal or CI log.

## Project Layout

- `src/index.ts` bootstraps the CLI.
- `src/cli.ts` defines commands and output.
- `src/scanner.ts` finds supported files and normalizes paths.
- `src/git.ts` reads git diff output.
- `src/naming.ts` classifies file naming styles.
- `tests/` contains the Vitest coverage for the scanner, git helpers, and naming logic.

## Requirements

- Node.js `20` or newer
- Git for `--base` comparisons

