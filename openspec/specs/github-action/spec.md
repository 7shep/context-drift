# github-action Specification

## Purpose

Allow Context Drift to run in GitHub Actions on pull requests.

## Requirements

### Requirement: Provide a composite GitHub Action

The repository SHALL include `action.yml` defining a composite action that installs dependencies, builds the CLI, and runs `context-drift check`.

#### Scenario: Action runs against a checked-out repository

- **WHEN** the action is invoked in a workflow with a checked-out repository
- **THEN** it SHALL run the CLI from the action path against `github.workspace`

#### Scenario: CLI failures fail the action step

- **WHEN** the CLI exits with a non-zero status while writing the report through `tee`
- **THEN** the action step SHALL fail with the CLI status

### Requirement: Support action inputs

The action SHALL expose inputs for base ref, minimum confidence, and output format.

#### Scenario: Workflow configures confidence and format

- **WHEN** a workflow passes `min-confidence` and `format`
- **THEN** the action SHALL pass those values to the CLI

### Requirement: Document pull request workflow usage

The README SHALL include a pull request workflow example with checkout, Node setup, and the Context Drift action.

#### Scenario: User wants to copy a workflow

- **WHEN** a user reads the README
- **THEN** they SHALL find a GitHub Actions workflow example

### Requirement: Post or update pull request comments

When a GitHub token is provided on a pull request event and Markdown output is selected, the action SHALL post a single Context Drift report comment if findings exist. If a prior Context Drift comment exists, the action SHALL update that comment instead of posting a duplicate.

#### Scenario: Findings produce a pull request comment

- **WHEN** the action runs on a pull request with a GitHub token
- **AND** the report has one or more findings
- **THEN** the action SHALL post a Context Drift report comment

#### Scenario: Existing report comment is updated

- **WHEN** a previous Context Drift report comment exists
- **AND** the action runs again with findings
- **THEN** the action SHALL update the existing comment

#### Scenario: No findings skip commenting

- **WHEN** the markdown report has zero findings
- **THEN** the action SHALL NOT create a new pull request comment
