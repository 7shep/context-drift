# github-action Specification

## Purpose

Allow Context Drift to run in GitHub Actions on pull requests.

## Requirements

### Requirement: Provide a composite GitHub Action

The repository SHALL include `action.yml` defining a composite action that installs dependencies, builds the CLI, and runs `context-drift check`.

#### Scenario: Action runs against a checked-out repository

- **WHEN** the action is invoked in a workflow with a checked-out repository
- **THEN** it SHALL run the CLI from the action path against `github.workspace`

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
