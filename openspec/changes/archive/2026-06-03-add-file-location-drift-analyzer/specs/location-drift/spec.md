# location-drift Specification

## Purpose

Detect changed source files that appear to belong to a known category but are placed outside the repository's established folders for that category.

## Requirements

### Requirement: Analyze changed files for location drift

The system SHALL provide a pure function `analyzeFileLocationDrift(changedFiles: RepoFile[], allFiles: RepoFile[], profile: ConventionProfile): DriftFinding[]` that returns `location-drift` findings. The function MUST NOT perform I/O, mutate its inputs, or read file contents.

#### Scenario: Changed file outside the common category folder produces a finding

- **WHEN** a changed file's category can be classified
- **AND** non-changed files in that category establish common folders
- **AND** the changed file is outside those folders
- **THEN** the analyzer SHALL return a `location-drift` finding for that file

#### Scenario: Changed file in a common folder produces no finding

- **WHEN** a changed file lives in one of the common folders for its category
- **THEN** the analyzer SHALL NOT return a finding for that file

### Requirement: Avoid self-reinforcing evidence

Changed files MUST be excluded from baseline category evidence.

#### Scenario: Multiple changed files in the same unusual folder do not create a new convention

- **WHEN** multiple changed files are placed in the same unusual folder
- **THEN** those changed files SHALL NOT make that folder count as baseline evidence

### Requirement: Avoid noisy findings without enough evidence

The analyzer SHALL require at least two non-changed files in the same category before reporting location drift.

#### Scenario: Too little evidence produces no finding

- **WHEN** fewer than two non-changed files exist for a changed file's category
- **THEN** the analyzer SHALL NOT return a finding
