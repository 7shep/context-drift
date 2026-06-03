## Context

Milestones 1–3 are in place: `scanner.ts` produces `RepoFile[]` (path, name, extension, directory, isChanged), `git.ts` resolves changed files, and `naming.ts` exposes `detectNamingStyle` + `summarizeNamingStyles`. The CLI currently computes the naming summary inline. There is no shared model of repository structure.

Milestone 4 introduces that model: `ConventionProfile`. It is the first artifact every later analyzer consumes, so its shape and the determinism of its classification matter more than breadth of coverage. Critically, `RepoFile` does **not** carry file content, and `ts-morph` is not a dependency yet — both are deferred to milestone 7. So this design is constrained to path- and name-based heuristics.

## Goals / Non-Goals

**Goals:**
- A pure `buildConventionProfile(files)` builder with no I/O, usable directly in tests.
- Deterministic, single-category classification of each file (`classifyFileCategory`).
- Per-category folder lists ranked by usage, useful as input to the future location-drift analyzer.
- Reuse `summarizeNamingStyles` verbatim rather than recomputing naming logic.
- Stable `ConventionProfile` type that later milestones extend (notably `exportedFunctions`) without breaking callers.

**Non-Goals:**
- Reading file contents or parsing ASTs (no JSX/`export default` detection). Deferred to milestone 7.
- Extracting exported function names — the field exists but stays empty here.
- Emitting the profile in CLI output or adding flags. The CLI only builds the profile and keeps driving its existing naming output from it.
- Configurable include/exclude globs or per-category thresholds.

## Decisions

### 1. A single, ordered classification with first-match-wins precedence

Each file resolves to exactly one `FileCategory`. The plan's heuristics overlap (e.g. a `.test.tsx` file is also PascalCase JSX; an `api` file could sit under `services`), so an explicit precedence is required for determinism. Order, most specific first:

1. `test` — name contains `.test.` or `.spec.`
2. `route` — base name (no ext) ∈ {`page`, `layout`, `route`, `loading`, `error`, `template`, `default`, `not-found`, `middleware`}
3. `hook` — base name matches `/^use[A-Z0-9]/` **or** a directory segment is `hooks`
4. `component` — extension is `.tsx`/`.jsx` **and** base name is PascalCase (`detectNamingStyle === "pascal-case"`)
5. `api` — name matches `/(api|client|fetcher|request)/i` **or** a directory segment is `api`
6. `service` — name matches `/service/i` **or** a directory segment is `services`
7. `utility` — name matches `/(format|parse|validate|calculate|normalize)/i` **or** a directory segment is one of `utils`, `lib`, `helpers`
8. `unknown` — none of the above

**Why over alternatives:** a flag-set / multi-label approach was considered but complicates folder grouping (a file would inflate multiple categories) and the downstream analyzers. First-match-wins is simple, testable, and easy to explain in findings later. To remove the plan's `api`/`service` folder overlap, `api` owns the `api` directory and `service` owns the `services` directory rather than both claiming `services`.

### 2. `component` requires PascalCase, not just a `.tsx` extension

We could classify every `.tsx`/`.jsx` as a component. Instead we require PascalCase so the learned `components` folder set reflects the *convention* (PascalCase React components), which is exactly what later naming/location drift checks compare against. Consequence: a drifted `user_profile_card.tsx` classifies as `unknown` rather than `component`. That is acceptable — the profile is built primarily from the existing (clean) repo, and milestone 5's naming-drift analyzer is the place to flag such files.

### 3. Folder lists ranked by descending file count, then path

For each category we collect the distinct `directory` values and order them by how many files of that category they hold (descending), breaking ties alphabetically. This surfaces the dominant home for each category first — the natural input for "files like this usually live in X". Pure de-duplication without ranking was rejected as less useful and no simpler.

### 4. `profile.naming` is the full `NamingStyleSummary` (7 fields)

The plan sketched a 4-field naming block, but milestone 3 already standardized a 7-field `NamingStyleSummary` (adds lower/upper/unknown). Reusing it verbatim keeps one source of truth and lets `profile.naming === summarizeNamingStyles(files)`. The plan's type sketches are treated as illustrative, not binding.

### 5. New module `src/conventionProfile.ts`; types live in `src/types.ts`

Keep the builder and classifier together in one cohesive module, matching the existing one-concern-per-file layout (`scanner`, `naming`, `git`). Shared types (`FileCategory`, `ExportedFunction`, `ConventionProfile`) go in `types.ts` alongside the others. The CLI imports `buildConventionProfile` and feeds `profile.naming` into its existing `printNamingConventions`, removing its direct `summarizeNamingStyles` call.

## Risks / Trade-offs

- **Heuristic misclassification** (e.g. a util named `requestId.ts` landing in `api`) → Accepted for MVP; precedence and rules are documented and unit-tested, and the profile aggregates across many files so a few misses don't dominate folder ranking.
- **Non-PascalCase `.tsx` files become `unknown`** → Intentional (decision 2); revisited when content/AST analysis arrives in milestone 7.
- **`exportedFunctions` always empty could surprise a consumer** → No real consumer exists yet; the empty-array contract is specified and tested so milestone 7 only changes population, not shape.
- **Precedence hides secondary signals** (a hook under `services/` is a `hook`, not a `service`) → Documented; precedence favors the more specific signal, which is the desired behavior.

## Migration Plan

Additive change with no breaking surface: new module + new types, and the CLI is refactored to source its naming numbers from the profile (identical output). No data migration, no rollback concerns; reverting is a straight file removal plus restoring the CLI's inline `summarizeNamingStyles` call.

## Open Questions

- Should folder lists be capped (e.g. top N) to keep later findings concise? Deferred — return all distinct folders now; capping can be a reporter concern.
- Should `route` detection also key off `app/`/`pages/` directories? Left out initially to avoid misclassifying components nested under `app/`; revisit if Next.js demo repos need it.
