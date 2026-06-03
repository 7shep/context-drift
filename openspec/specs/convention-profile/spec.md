# convention-profile Specification

## Purpose
TBD - created by archiving change add-convention-profile. Update Purpose after archive.
## Requirements
### Requirement: Build a convention profile from scanned files

The system SHALL provide a pure function `buildConventionProfile(files: RepoFile[]): ConventionProfile` that summarizes a list of scanned repository files into a single profile object. The profile MUST include the number of files scanned, the naming-style distribution, the common folders for each file category, and a reserved list of exported functions. The function MUST NOT read file contents, mutate its input, or perform I/O.

#### Scenario: Empty file list produces a zeroed profile
- **WHEN** `buildConventionProfile([])` is called
- **THEN** `filesScanned` SHALL be `0`
- **AND** every naming-style percentage SHALL be `0`
- **AND** every category folder list SHALL be empty
- **AND** `exportedFunctions` SHALL be an empty array

#### Scenario: Profile reflects the scanned files
- **WHEN** `buildConventionProfile(files)` is called with a non-empty list
- **THEN** `filesScanned` SHALL equal `files.length`
- **AND** the profile SHALL be derived solely from the provided files

### Requirement: Classify each file into exactly one category

The system SHALL provide `classifyFileCategory(file: RepoFile): FileCategory`, returning exactly one of `component`, `hook`, `api`, `service`, `utility`, `route`, `test`, or `unknown`. Classification MUST be deterministic and based only on the file's path and name (no content analysis). When more than one category could match, the system SHALL apply a fixed precedence so each file resolves to a single category.

#### Scenario: Test files take precedence
- **WHEN** a file named `Button.test.tsx` or `helpers.spec.ts` is classified
- **THEN** the category SHALL be `test`, regardless of any other matching signal

#### Scenario: Next.js route files are routes
- **WHEN** a file whose base name (without extension) is one of `page`, `layout`, `route`, `loading`, `error`, `template`, `default`, `not-found`, or `middleware` is classified
- **THEN** the category SHALL be `route`

#### Scenario: Hook files are detected by name or folder
- **WHEN** a file's base name matches `useX` (the prefix `use` followed by an uppercase letter or digit) OR the file lives under a `hooks` directory
- **THEN** the category SHALL be `hook`

#### Scenario: PascalCase JSX files are components
- **WHEN** a file has a `.tsx` or `.jsx` extension AND its base name is PascalCase
- **AND** it is not already a test, route, or hook
- **THEN** the category SHALL be `component`

#### Scenario: API files are detected by name or folder
- **WHEN** a file's base name contains `api`, `client`, `fetcher`, or `request` (case-insensitive) OR the file lives under an `api` directory
- **AND** no higher-precedence category matched
- **THEN** the category SHALL be `api`

#### Scenario: Service files are detected by name or folder
- **WHEN** a file's base name contains `service` (case-insensitive) OR the file lives under a `services` directory
- **AND** no higher-precedence category matched
- **THEN** the category SHALL be `service`

#### Scenario: Utility files are detected by name or folder
- **WHEN** a file's base name contains `format`, `parse`, `validate`, `calculate`, or `normalize` (case-insensitive) OR the file lives under a `utils`, `lib`, or `helpers` directory
- **AND** no higher-precedence category matched
- **THEN** the category SHALL be `utility`

#### Scenario: Unmatched files are unknown
- **WHEN** a file matches no category heuristic
- **THEN** the category SHALL be `unknown`

### Requirement: Group folders by category ranked by usage

For each non-`unknown` category, the profile SHALL list the distinct directories that contain files of that category. Within a category, directories MUST be ordered by descending file count, with ties broken by ascending directory path. The same directory MAY appear under multiple categories if it contains files of different categories.

#### Scenario: Dominant folder is listed first
- **WHEN** five component files live in `src/components` and one lives in `src/widgets`
- **THEN** the `components` folder list SHALL be `["src/components", "src/widgets"]`

#### Scenario: Categories are independent
- **WHEN** a repository has components in `src/components` and hooks in `src/hooks`
- **THEN** the `components` folder list SHALL contain `src/components` and the `hooks` folder list SHALL contain `src/hooks`

### Requirement: Reuse the existing naming-style distribution

The profile's `naming` field SHALL be produced by the existing naming-style summarizer over all scanned files, so the profile's percentages match the figures already reported by the CLI.

#### Scenario: Naming distribution matches the summarizer
- **WHEN** `buildConventionProfile(files)` is called
- **THEN** `profile.naming` SHALL equal `summarizeNamingStyles(files)` for the same files

### Requirement: Reserve exported functions for later extraction

The profile SHALL expose an `exportedFunctions` array so downstream analyzers can depend on a stable shape. In this change the array SHALL always be empty; populating it requires AST-based extraction delivered in a later change.

#### Scenario: Exported functions are empty for now
- **WHEN** `buildConventionProfile(files)` is called with any input
- **THEN** `exportedFunctions` SHALL be an empty array

