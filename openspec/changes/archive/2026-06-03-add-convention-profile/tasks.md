## 1. Types

- [x] 1.1 Add `FileCategory` union to `src/types.ts`: `component | hook | api | service | utility | route | test | unknown`
- [x] 1.2 Add `ExportedFunction` type (`name: string; filePath: string`) to `src/types.ts`
- [x] 1.3 Add `ConventionProfile` type to `src/types.ts` with `filesScanned: number`, `naming: NamingStyleSummary`, `folders` (one `string[]` per non-unknown category: `components`, `hooks`, `api`, `services`, `utilities`, `routes`, `tests`), and `exportedFunctions: ExportedFunction[]`

## 2. Category classification (test-first)

- [x] 2.1 Write `tests/conventionProfile.test.ts` cases for `classifyFileCategory` covering each scenario in the spec: test, route, hook (name + folder), component (PascalCase .tsx/.jsx), api, service, utility, unknown
- [x] 2.2 Add a precedence test: `Button.test.tsx` → `test`; a `useThing` file under `services/` → `hook` (precedence over service)
- [x] 2.3 Implement `classifyFileCategory(file: RepoFile): FileCategory` in `src/conventionProfile.ts` using the first-match-wins precedence order from design.md (test → route → hook → component → api → service → utility → unknown)
- [x] 2.4 Run the classifier tests and confirm they pass

## 3. Profile builder (test-first)

- [x] 3.1 Add tests for `buildConventionProfile`: empty input yields zeroed profile (filesScanned 0, all naming percents 0, all folder lists empty, exportedFunctions `[]`)
- [x] 3.2 Add tests asserting `filesScanned === files.length` and `profile.naming` deep-equals `summarizeNamingStyles(files)`
- [x] 3.3 Add tests for folder grouping: dominant folder ranked first by descending count then path; categories independent; a directory may appear under multiple categories
- [x] 3.4 Add a test asserting `exportedFunctions` is always `[]`
- [x] 3.5 Implement `buildConventionProfile(files: RepoFile[]): ConventionProfile` in `src/conventionProfile.ts` — pure, no I/O, reuse `summarizeNamingStyles`, classify each file, build ranked folder lists, set `exportedFunctions: []`
- [x] 3.6 Run the builder tests and confirm they pass

## 4. CLI wiring

- [x] 4.1 In `src/cli.ts`, build the profile from scanned files and source `printNamingConventions` from `profile.naming` instead of calling `summarizeNamingStyles` directly
- [x] 4.2 Confirm CLI output and flags are unchanged (no new output, no new options)

## 5. Verification

- [x] 5.1 Run `npm run typecheck` and fix any type errors
- [x] 5.2 Run `npm test` and confirm all suites pass
- [x] 5.3 Run `npm run build` then `node dist/index.js check` to confirm the command still runs and prints the existing summary
