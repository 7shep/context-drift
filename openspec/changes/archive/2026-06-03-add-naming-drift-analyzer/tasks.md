## 1. Types and analyzer skeleton

- [x] 1.1 Add `DriftFinding` type to `src/types.ts` with `naming-drift`, `location-drift`, and `duplicate-utility` finding kinds.
- [x] 1.2 Create `src/analyzers/namingDrift.ts`.
- [x] 1.3 Export `analyzeNamingDrift(changedFiles: RepoFile[], allFiles: RepoFile[], profile: ConventionProfile): DriftFinding[]`.

## 2. Evidence and dominance helpers

- [x] 2.1 Add tests for selecting category evidence over folder and whole-repo evidence.
- [x] 2.2 Add tests for same-folder fallback when a changed file classifies as `unknown`.
- [x] 2.3 Add tests that mixed/tiny evidence does not produce noisy findings.
- [x] 2.4 Implement helper logic to summarize naming styles for baseline files while excluding changed files.
- [x] 2.5 Implement dominant-style selection with sample-size and percentage thresholds.

## 3. Finding generation

- [x] 3.1 Add tests for the roadmap example: `src/components/user_profile_card.tsx` reports against PascalCase component/folder convention.
- [x] 3.2 Add tests that files already matching the dominant style produce no findings.
- [x] 3.3 Add tests for confidence and severity mapping.
- [x] 3.4 Implement `naming-drift` finding construction with title, message, suggestion, confidence, severity, file, and related files.

## 4. CLI integration

- [x] 4.1 In `src/cli.ts`, pass changed files, all files, and profile into `analyzeNamingDrift`.
- [x] 4.2 Filter findings using a default minimum confidence of `0.75`.
- [x] 4.3 If added now, support `--min-confidence <number>` with validation from `0` to `1`.
- [x] 4.4 Print findings after the existing summary/naming output in a compact markdown-friendly form.
- [x] 4.5 Preserve the existing no-changed-file behavior without throwing.

## 5. Documentation and verification

- [x] 5.1 Update `README.md` with a short naming drift example if CLI output changes.
- [x] 5.2 Run `npm run typecheck` and fix any type errors.
- [x] 5.3 Run `npm test` and confirm all suites pass.
- [x] 5.4 Run `npm run build`.
- [x] 5.5 Run `node dist/index.js check --changed src/components/user_profile_card.tsx` against a suitable fixture or local test setup and confirm findings render as expected.
