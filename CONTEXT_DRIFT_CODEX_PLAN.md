# Context Drift MVP Plan

## Project Summary

**Context Drift** is an open-source CLI and GitHub Action that detects when new code does not match the existing conventions of a repository.

The main use case is protecting codebases from **AI-generated code that technically works but feels inconsistent with the project**.

Core tagline:

> Stop AI-generated code from making your repo weird.

The first version should focus on **TypeScript / React / Next.js** projects.

The goal is not to build a generic AI code reviewer. Context Drift should be quiet, specific, and focused only on repository consistency.

---

## Problem

AI coding tools can write code quickly, but they often introduce subtle inconsistency:

- Creating duplicate helper functions instead of reusing existing ones
- Placing files in plausible but incorrect folders
- Using different file naming conventions
- Ignoring established component, API, utility, or hook patterns
- Creating code that works but does not fit the codebase

Developers then have to spend review time cleaning up structure and style drift.

---

## Product Promise

Context Drift reviews new or changed files and answers:

> Does this code fit the existing repo?

It should report issues like:

```txt
src/utils/apiClient.ts looks like an API client, but this repo usually stores API clients in src/lib/api/.

src/components/user_profile_card.tsx uses snake_case, but this repo's components mostly use PascalCase.

src/utils/dateFormat.ts exports formatDate(), but a similar utility already exists in src/lib/date/formatDate.ts.
```

---

## MVP Scope

The MVP should be a CLI first.

Primary command:

```bash
npx context-drift check
```

Additional commands/options:

```bash
npx context-drift check --base main
npx context-drift check --format markdown
npx context-drift check --format json
npx context-drift check --min-confidence 0.75
npx context-drift check --changed "src/utils/apiClient.ts,src/components/user_profile_card.tsx"
```

The `--changed` option is useful for local demos without needing an actual pull request.

---

## Initial Target

Support these project types first:

- TypeScript
- JavaScript
- React
- Next.js
- Node.js

Do not attempt to support every language in the MVP.

---

## Core MVP Checks

### 1. File Location Drift

Detect when a new file appears in a folder that does not match where similar files usually live.

Example:

```txt
New file:
src/utils/apiClient.ts

Existing repo pattern:
src/lib/api/
src/services/
```

Expected finding:

```txt
src/utils/apiClient.ts looks like an API client, but similar files usually live in src/lib/api/.
```

---

### 2. Naming Convention Drift

Detect if new files use a naming style that does not match nearby or similar files.

Examples:

```txt
New file:
src/components/user_profile_card.tsx

Existing convention:
src/components/UserProfileCard.tsx
```

Expected finding:

```txt
user_profile_card.tsx uses snake_case, but component files in this repo mostly use PascalCase.
```

---

### 3. Duplicate Utility Drift

Detect if a new function or file looks like an existing helper.

Example:

```txt
New function:
formatDate()

Existing utilities:
formatDateShort()
formatRelativeDate()
dateFormatter()
```

Expected finding:

```txt
formatDate() looks similar to existing date formatting utilities. Consider reusing or extending the existing helper.
```

For the MVP, use simple name similarity. Do not start with embeddings.

---

## Recommended Tech Stack

Use TypeScript.

Suggested libraries:

```txt
Language: TypeScript
Runtime: Node.js
Package manager: pnpm
CLI framework: Commander.js or CAC
File scanning: fast-glob
TypeScript parsing: ts-morph
String similarity: fuse.js or fastest-levenshtein
Testing: Vitest
Output formats: Markdown and JSON
```

---

## Suggested Initial Repo Structure

Start simple:

```txt
context-drift/
  src/
    index.ts
    cli.ts
    scanner.ts
    conventionProfile.ts
    types.ts
    analyzers/
      fileLocationDrift.ts
      namingDrift.ts
      duplicateUtilityDrift.ts
    reporters/
      markdownReporter.ts
      jsonReporter.ts
    utils/
      casing.ts
      similarity.ts
      git.ts
  examples/
    nextjs-clean/
    nextjs-drifted/
  tests/
  README.md
  package.json
  pnpm-lock.yaml
  tsconfig.json
```

Avoid monorepo structure until the project needs it.

---

## Core Data Types

Create shared types early.

```ts
export type RepoFile = {
  path: string;
  name: string;
  extension: string;
  directory: string;
  content: string;
  isChanged?: boolean;
};

export type NamingStyle =
  | "pascal-case"
  | "kebab-case"
  | "camel-case"
  | "snake-case"
  | "unknown";

export type FileCategory =
  | "component"
  | "hook"
  | "api"
  | "utility"
  | "service"
  | "route"
  | "test"
  | "unknown";

export type ConventionProfile = {
  filesScanned: number;
  naming: {
    pascalCasePercent: number;
    kebabCasePercent: number;
    camelCasePercent: number;
    snakeCasePercent: number;
  };
  folders: {
    components: string[];
    hooks: string[];
    api: string[];
    utilities: string[];
    services: string[];
    routes: string[];
    tests: string[];
  };
  exportedFunctions: ExportedFunction[];
};

export type ExportedFunction = {
  name: string;
  filePath: string;
};

export type DriftFinding = {
  type: "location-drift" | "naming-drift" | "duplicate-utility";
  severity: "low" | "medium" | "high";
  confidence: number;
  file: string;
  title: string;
  message: string;
  suggestion?: string;
  relatedFiles?: string[];
};
```

---

## Core Pipeline

The CLI should follow this pipeline:

```txt
1. Load config/options
2. Scan repository files
3. Determine changed/new files
4. Build convention profile from existing files
5. Run analyzers against changed/new files
6. Filter findings by confidence
7. Output report as Markdown or JSON
```

---

## Step-by-Step Implementation Plan

## Milestone 1: CLI Foundation

Goal: `context-drift check` runs successfully.

Tasks:

- Create TypeScript project
- Add CLI entry point
- Add `check` command
- Add `fast-glob` repo scanner
- Ignore irrelevant folders:
  - `node_modules`
  - `.git`
  - `.next`
  - `dist`
  - `build`
  - `coverage`
- Scan files matching:
  - `**/*.ts`
  - `**/*.tsx`
  - `**/*.js`
  - `**/*.jsx`
- Print a simple summary:
  - number of files scanned
  - number of changed files found
  - output format selected

Example output:

```txt
Context Drift

Files scanned: 142
Changed files: 3
Format: markdown
```

---

## Milestone 2: Changed File Detection

Goal: the tool can identify files changed compared to a base branch.

Implement:

```bash
context-drift check --base main
```

Use Git commands internally:

```bash
git diff --name-only main...HEAD
```

Also support manual changed files:

```bash
context-drift check --changed "src/utils/apiClient.ts,src/components/user_profile_card.tsx"
```

Implementation notes:

- If `--changed` is provided, use that directly.
- Else if `--base` is provided, use Git diff.
- Else analyze all files or show a helpful message.
- Filter changed files to only supported extensions.

---

## Milestone 3: Naming Style Detection

Goal: detect naming styles for files.

Implement utility:

```ts
detectNamingStyle(fileName: string): NamingStyle
```

Rules:

- `UserProfileCard.tsx` -> `pascal-case`
- `user-profile-card.tsx` -> `kebab-case`
- `userProfileCard.tsx` -> `camel-case`
- `user_profile_card.tsx` -> `snake-case`
- otherwise -> `unknown`

Then build percentages across the repo.

Example debug output:

```txt
Naming conventions:
- PascalCase: 71%
- kebab-case: 18%
- camelCase: 9%
- snake_case: 2%
```

---

## Milestone 4: Basic Convention Profile

Goal: build a useful profile of the repo.

Implement:

```ts
buildConventionProfile(files: RepoFile[]): ConventionProfile
```

The profile should include:

- files scanned
- naming style percentages
- common component folders
- common hook folders
- common API folders
- common utility folders
- exported function names

For folder classification, start with simple heuristics.

Category detection examples:

```txt
Component:
- file ends in .tsx
- PascalCase filename
- contains "export default function"
- contains JSX

Hook:
- filename starts with use
- exported function starts with use

API:
- filename contains api, client, fetcher, request
- directory contains api, services, client

Utility:
- filename contains format, parse, validate, calculate, normalize
- directory contains utils, lib, helpers

Test:
- filename contains .test. or .spec.
```

---

## Milestone 5: Naming Drift Analyzer

Goal: report when changed files use unusual naming.

Implement:

```ts
analyzeNamingDrift(
  changedFiles: RepoFile[],
  allFiles: RepoFile[],
  profile: ConventionProfile
): DriftFinding[]
```

Basic rule:

- Determine category of changed file.
- Determine dominant naming style for files in the same category or folder.
- If changed file style differs from dominant style, report a finding.
- Only report if confidence is high enough.

Example finding:

```ts
{
  type: "naming-drift",
  severity: "medium",
  confidence: 0.82,
  file: "src/components/user_profile_card.tsx",
  title: "File naming convention drift",
  message: "Most component files use PascalCase, but this file uses snake_case.",
  suggestion: "Rename the file to match the existing component naming convention."
}
```

---

## Milestone 6: File Location Drift Analyzer

Goal: report when changed files appear to be in unusual folders.

Implement:

```ts
analyzeFileLocationDrift(
  changedFiles: RepoFile[],
  allFiles: RepoFile[],
  profile: ConventionProfile
): DriftFinding[]
```

Basic rule:

- Guess the file category.
- Look up common folders for that category.
- If changed file is outside the common folder set, report a finding.
- Include related folders/files in the finding.

Example finding:

```ts
{
  type: "location-drift",
  severity: "medium",
  confidence: 0.76,
  file: "src/utils/apiClient.ts",
  title: "Unusual API client location",
  message: "This file looks like an API client, but similar files usually live in src/lib/api.",
  suggestion: "Consider moving this file closer to the existing API client pattern.",
  relatedFiles: ["src/lib/api/client.ts", "src/lib/api/fetcher.ts"]
}
```

---

## Milestone 7: Exported Function Extraction

Goal: extract function names from TypeScript/JavaScript files.

Use `ts-morph`.

Extract:

- exported function declarations
- exported const arrow functions
- default exported functions when named
- possibly exported class methods later

Example:

```ts
export function formatDate() {}

export const parseDate = () => {};
```

Should produce:

```ts
[
  { name: "formatDate", filePath: "src/lib/date/formatDate.ts" },
  { name: "parseDate", filePath: "src/lib/date/parseDate.ts" }
]
```

---

## Milestone 8: Duplicate Utility Drift Analyzer

Goal: report possible duplicate helpers.

Implement:

```ts
analyzeDuplicateUtilityDrift(
  changedFiles: RepoFile[],
  allFiles: RepoFile[],
  profile: ConventionProfile
): DriftFinding[]
```

Basic rule:

- Extract exported functions from changed files.
- Compare each changed function against existing exported functions.
- Use string similarity.
- Ignore exact same file.
- Report if similarity is above threshold.

Example:

```ts
{
  type: "duplicate-utility",
  severity: "high",
  confidence: 0.88,
  file: "src/utils/dateFormat.ts",
  title: "Possible duplicate utility",
  message: "`formatDate` looks similar to existing utility `formatDateShort` in `src/lib/date/formatDateShort.ts`.",
  suggestion: "Check whether the existing date utility can be reused or extended.",
  relatedFiles: ["src/lib/date/formatDateShort.ts"]
}
```

---

## Milestone 9: Markdown and JSON Reporters

Goal: generate readable reports.

Markdown format:

```md
# Context Drift Report

Found 2 possible convention drifts.

## High Confidence

### Possible duplicate utility

`src/utils/dateFormat.ts` exports `formatDate`, which appears similar to:

- `src/lib/date/formatDateShort.ts`
- `src/lib/date/formatRelativeDate.ts`

Suggested action:
Check if the existing date utilities can be reused or extended.

## Medium Confidence

### Unusual file location

`src/utils/apiClient.ts` looks like an API client, but similar files usually live in:

- `src/lib/api/`
```

JSON format:

```json
{
  "summary": {
    "findings": 2,
    "high": 1,
    "medium": 1,
    "low": 0
  },
  "findings": []
}
```

---

## Milestone 10: Demo Repo

Goal: create a strong demonstration.

Create:

```txt
examples/
  nextjs-clean/
  nextjs-drifted/
```

The clean example should contain established patterns:

```txt
src/lib/api/client.ts
src/components/UserProfileCard.tsx
src/lib/date/formatDate.ts
src/hooks/useUser.ts
```

The drifted example should include bad additions:

```txt
src/utils/apiClient.ts
src/components/user_profile_card.tsx
src/utils/dateFormat.ts
```

The README should show Context Drift catching these issues.

---

## Milestone 11: GitHub Action

Goal: allow the tool to run on pull requests.

Add:

```txt
action.yml
```

Example workflow users can copy:

```yaml
name: Context Drift

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  context-drift:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Context Drift
        uses: your-username/context-drift@v0.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          min-confidence: 0.75
```

Initial GitHub Action behavior:

- Run CLI
- Generate Markdown report
- Print report to action logs

Later behavior:

- Post or update a PR comment using the GitHub token

---

## Milestone 12: PR Comment Support

Goal: make the GitHub Action comment on PRs.

Behavior:

- If findings exist, post a single comment.
- If a previous Context Drift comment exists, update it instead of posting duplicates.
- If no findings exist, optionally comment nothing.

Comment header:

```md
## Context Drift Report

Found 2 possible convention drifts in this PR.
```

Keep the comment concise.

---

## Configuration File

Eventually support:

```json
{
  "include": ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
  "exclude": ["node_modules", ".next", "dist", "build"],
  "mode": "default",
  "minConfidence": 0.75,
  "enabledChecks": [
    "naming-drift",
    "location-drift",
    "duplicate-utility"
  ]
}
```

Suggested filename:

```txt
context-drift.config.json
```

Do not build complex config first. Defaults should work without configuration.

---

## What Not To Build Yet

Avoid these until after v0.1:

- Full AI code review
- Support for every programming language
- Hosted SaaS dashboard
- Login/accounts
- Complex embeddings pipeline
- Custom GitHub App
- Auto-fix pull requests
- Slack integration
- Deep semantic code analysis
- Large language model dependency

The MVP should work without requiring an LLM.

---

## Future Features

Potential v0.2+ features:

- React pattern drift detection
- API error handling drift detection
- Environment variable access drift detection
- Auth pattern drift detection
- Database client usage drift detection
- Test naming/location drift detection
- Embeddings-based duplicate detection
- Optional LLM explanations
- GitHub PR comments
- Drift score over time
- Suggested file moves
- Suggested utility reuse
- Monorepo support
- Python support
- Rust support

---

## README Plan

The README should be polished and demo-first.

Suggested structure:

```md
# Context Drift

Stop AI-generated code from making your repo weird.

Context Drift is an open-source CLI and GitHub Action that detects when new code does not match your existing codebase conventions.

## Why?

AI coding tools can write code fast, but they often:
- create duplicate helpers
- place files in odd folders
- ignore existing project patterns
- invent new conventions

Context Drift catches those issues before they become permanent.

## Example

[Show sample report]

## Install

npm install -D context-drift

## Usage

npx context-drift check

## GitHub Action

[Show workflow YAML]

## What it detects

- File location drift
- Naming convention drift
- Duplicate utilities

## Roadmap

- React pattern detection
- API error handling drift
- Env var access drift
- Embeddings-based duplicate detection
- GitHub PR comments
```

---

## Launch Plan

Launch once the CLI and basic GitHub Action work.

Suggested launch platforms:

- GitHub
- Hacker News
- Reddit:
  - r/typescript
  - r/javascript
  - r/reactjs
  - r/nextjs
  - r/opensource
  - r/programming
- Twitter/X
- LinkedIn

Launch title ideas:

```txt
Show HN: Context Drift – catch when AI-generated code ignores repo conventions
```

```txt
I built an open-source tool that detects when new code does not fit your codebase
```

```txt
Stop AI-generated PRs from making your repo inconsistent
```

---

## First Exact Task for Codex

Start by creating the TypeScript CLI foundation.

Requirements:

1. Initialize a TypeScript Node.js project.
2. Add a CLI command called `context-drift check`.
3. Scan the current repository for `.ts`, `.tsx`, `.js`, and `.jsx` files.
4. Ignore:
   - `node_modules`
   - `.git`
   - `.next`
   - `dist`
   - `build`
   - `coverage`
5. Print:
   - number of files scanned
   - list of supported files found
6. Add a clean project structure with:
   - scanner module
   - types module
   - CLI entry point
7. Add a README with the project tagline and basic usage.

Expected first output:

```bash
npx context-drift check
```

Example result:

```txt
Context Drift

Files scanned: 142

Supported files:
- src/index.ts
- src/scanner.ts
- src/analyzers/namingDrift.ts
```

Do not implement analyzers yet. First make the CLI and scanner work cleanly.
