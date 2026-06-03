# naming-drift Specification

## Purpose
Detect changed source files whose naming style does not match established repository conventions.

## Requirements
### Requirement: Analyze changed files for naming convention drift

The system SHALL provide a pure function `analyzeNamingDrift(changedFiles: RepoFile[], allFiles: RepoFile[], profile: ConventionProfile): DriftFinding[]` that returns `naming-drift` findings for changed source files whose naming style differs from an established repository convention. The function MUST NOT perform I/O, mutate its inputs, or read file contents.

#### Scenario: Changed file matching the dominant convention produces no finding
- **WHEN** a changed file uses the same naming style as the dominant convention selected for that file
- **THEN** `analyzeNamingDrift` SHALL NOT return a finding for that file

#### Scenario: Changed file differing from a dominant convention produces a finding
- **WHEN** a changed file uses a naming style that differs from the dominant convention selected for that file
- **AND** the dominant convention meets the minimum evidence threshold
- **THEN** `analyzeNamingDrift` SHALL return a `naming-drift` finding for that file
- **AND** the finding SHALL include the changed file path, a confidence score, severity, title, message, and suggestion

#### Scenario: Unknown naming style is ignored
- **WHEN** a changed file's naming style is `unknown`
- **THEN** `analyzeNamingDrift` SHALL NOT return a finding for that file

### Requirement: Select the most specific available naming evidence

The analyzer SHALL choose naming evidence in this order: non-changed files in the same category, then non-changed files in the same directory, then non-changed files across the whole repository. Changed files MUST be excluded from every evidence set so new drift does not influence the learned convention.

#### Scenario: Category evidence takes precedence
- **WHEN** at least two non-changed files in the changed file's category establish a dominant naming style
- **THEN** the analyzer SHALL compare the changed file against the category dominant style
- **AND** it SHALL NOT use directory or whole-repo fallback evidence for that file

#### Scenario: Directory evidence is used when category evidence is unavailable
- **WHEN** category evidence is unavailable, too small, or not dominant enough
- **AND** at least two non-changed files in the changed file's directory establish a dominant naming style
- **THEN** the analyzer SHALL compare the changed file against the directory dominant style

#### Scenario: Whole-repo evidence is used as a final fallback
- **WHEN** category and directory evidence are unavailable, too small, or not dominant enough
- **AND** non-changed files across the whole repository establish a dominant naming style
- **THEN** the analyzer SHALL compare the changed file against the whole-repo dominant style

### Requirement: Avoid noisy findings without a clear dominant convention

The analyzer SHALL only report naming drift when the selected evidence has enough baseline files and a dominant naming style. Category and directory evidence MUST require at least two non-changed files and a dominant style of at least 60%. Whole-repo fallback evidence MUST require a dominant style of at least 70%.

#### Scenario: Too little evidence produces no finding
- **WHEN** fewer than two non-changed files are available for category or directory evidence
- **AND** whole-repo evidence does not meet its dominance threshold
- **THEN** the analyzer SHALL NOT return a finding for that changed file

#### Scenario: Mixed conventions produce no finding
- **WHEN** the available naming evidence is split such that no style reaches the required dominance threshold
- **THEN** the analyzer SHALL NOT return a finding for that changed file

### Requirement: Findings expose confidence, severity, and related examples

Each `naming-drift` finding SHALL set confidence to the selected dominant style percentage expressed as a decimal between `0` and `1`. Severity SHALL be `high` for confidence greater than or equal to `0.9`, `medium` for confidence greater than or equal to `0.75`, and `low` otherwise. When category or directory evidence is used, the finding SHOULD include up to three related files that use the dominant naming style.

#### Scenario: Confidence and severity are derived from dominance
- **WHEN** the selected dominant style percentage is `82`
- **THEN** the finding confidence SHALL be `0.82`
- **AND** the severity SHALL be `medium`

#### Scenario: Related files show matching examples
- **WHEN** category or directory evidence is selected
- **THEN** the finding SHOULD include up to three non-changed files from that evidence set that use the dominant naming style
