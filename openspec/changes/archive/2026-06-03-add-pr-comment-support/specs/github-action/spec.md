# github-action Specification

## Purpose

Allow Context Drift to run in GitHub Actions on pull requests and optionally comment with findings.

## Requirements

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
