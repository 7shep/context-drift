# duplicate-utility Specification

## Purpose

Detect changed utility files that export functions similar to existing exported helpers.

## Requirements

### Requirement: Analyze changed utility exports for duplicate drift

The system SHALL provide `analyzeDuplicateUtilityDrift(changedFiles: RepoFile[], allFiles: RepoFile[], profile: ConventionProfile): DriftFinding[]` that returns `duplicate-utility` findings for changed utility files whose exported function names are similar to existing exported functions.

#### Scenario: Similar changed utility export produces a finding

- **WHEN** a changed utility file exports a function
- **AND** an existing exported function in another file has similar naming
- **THEN** the analyzer SHALL return a `duplicate-utility` finding

#### Scenario: Non-utility files are ignored

- **WHEN** a changed file is not classified as a utility
- **THEN** the analyzer SHALL NOT report duplicate utility drift for that file

### Requirement: Exclude changed exports from baseline candidates

Changed files MUST be excluded from the existing utility candidate set.

#### Scenario: Changed files do not match each other

- **WHEN** two changed files export similar function names
- **THEN** those changed functions SHALL NOT be compared as baseline candidates

### Requirement: Report only sufficiently similar names

The analyzer SHALL report duplicate utility drift only when the selected name similarity is at least `0.75`.

#### Scenario: Weak similarity produces no finding

- **WHEN** the closest existing exported function has similarity below `0.75`
- **THEN** the analyzer SHALL NOT return a finding
