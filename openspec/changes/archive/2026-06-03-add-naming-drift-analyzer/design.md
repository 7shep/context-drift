## Context

Milestones 1-4 provide the scanner, git/manual changed-file resolution, naming-style detection, and a path/name-based `ConventionProfile`. The profile already exposes folder groupings by category and whole-repo naming percentages. There is no `DriftFinding` type yet and no analyzer pipeline in the CLI.

Milestone 5 should stay small: detect naming drift for changed files using the information already available in `RepoFile` and the profile. It should not read source contents, parse ASTs, infer React components from JSX content, or produce polished reporters beyond straightforward CLI output.

## Goals / Non-Goals

**Goals:**
- A pure `analyzeNamingDrift(changedFiles, allFiles, profile)` function.
- Deterministic findings with stable confidence, severity, and wording.
- Prefer conventions from files in the same category; fall back to the same folder; fall back to the whole repo.
- Avoid noisy findings when there is no clear dominant convention.
- Integrate with `check` so `--changed` and `--base` can surface naming drift.

**Non-Goals:**
- Automatic rename suggestions that compute exact target filenames.
- Content- or AST-based category detection.
- Location drift, duplicate utility drift, markdown/json reporter overhaul, or config file support.
- Treating every non-dominant historical file as drift. Only changed files are analyzed.

## Decisions

### 1. Add a general `DriftFinding` type now

Use the roadmap shape:

```ts
export type DriftFinding = {
  type: "naming-drift" | "location-drift" | "duplicate-utility";
  severity: "low" | "medium" | "high";
  confidence: number;
  file: string;
  title: string;
  message: string;
  suggestion?: string;
  relatedFiles?: string[];
};
```

`location-drift` and `duplicate-utility` are included in the union so later milestones can reuse the same type without churn.

### 2. Analyzer candidates are only changed source files

The CLI already marks scanned files with `isChanged`. It should pass `files.filter((file) => file.isChanged)` as `changedFiles`. The analyzer itself also accepts an explicit `changedFiles` argument for focused tests and future callers. Files with `unknown` naming style are ignored initially because there is no useful convention message to produce.

### 3. Convention lookup order: category, folder, repository

For each changed file:

1. Classify it with `classifyFileCategory`.
2. If the category is not `unknown`, compute the naming distribution among all non-changed files in that category.
3. If category evidence is too weak or unavailable, compute naming distribution among all non-changed files in the same directory.
4. If folder evidence is too weak, compute whole-repo fallback evidence from all non-changed files.

Changed files are excluded from every evidence set so a batch of drifted additions does not dilute the learned convention.

### 4. Dominance requires minimum sample size and percent

For category and folder evidence, require at least 2 baseline files and a dominant naming style at or above 60%. For whole-repo fallback, use `profile.naming` and require the dominant style at or above 70%. These thresholds keep MVP output quiet when a repo is mixed or tiny.

Confidence is derived directly from the dominant percentage as a decimal (`82% -> 0.82`). Findings below the CLI's minimum confidence are filtered at the CLI layer. Add `--min-confidence <number>` now with a default threshold of `0.75` and validation from `0` to `1`.

### 5. Severity maps to confidence

- `high` for confidence `>= 0.9`
- `medium` for confidence `>= 0.75`
- `low` otherwise

The default CLI threshold means most visible findings are medium or high, but the pure analyzer still returns lower-confidence findings for callers/tests that choose a lower threshold later.

### 6. Related files should explain the evidence

When category or folder evidence is used, include up to three baseline file paths that match the dominant style and came from that evidence set. For whole-repo fallback, omit `relatedFiles` unless a concise set can be selected without extra complexity. This gives reviewers concrete examples without making reports noisy.

## Risks / Trade-offs

- **Category classifier can label a drifted component as `unknown`**: fallback to same-folder evidence handles the important case (`src/components/user_profile_card.tsx` compared with nearby PascalCase files).
- **Thresholds are heuristic**: accepted for MVP; tests should lock behavior, and later config can expose the confidence threshold.
- **Whole-repo fallback may be broad**: higher dominance requirement reduces false positives.
- **CLI output format is still basic**: acceptable until milestone 9 introduces dedicated reporters.

## Migration Plan

Additive implementation. Existing CLI summary remains at the top. New findings are printed below naming conventions only when present; no findings should keep current output nearly unchanged except for a concise "No naming drift found" line if that is useful for clarity.

## Open Questions

- Resolved: `--min-confidence` is included in this milestone.
- Resolved: all evidence is based on existing non-changed code.
