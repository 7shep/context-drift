# reporters Specification

## Purpose

Render Context Drift check results as readable Markdown or structured JSON.

## Requirements

### Requirement: Render Markdown reports

The system SHALL render a Markdown report with a summary, naming conventions, and findings grouped by confidence.

#### Scenario: Markdown report includes findings

- **WHEN** a check produces findings
- **THEN** the Markdown output SHALL include the changed file path, finding type, confidence, details, suggestion, and related files when present

#### Scenario: Markdown report handles no findings

- **WHEN** a check produces no findings
- **THEN** the Markdown output SHALL state that there are no drift findings

### Requirement: Render JSON reports

The system SHALL render JSON with `summary`, `naming`, and `findings` fields.

#### Scenario: JSON report includes finding counts by severity

- **WHEN** a check produces findings
- **THEN** `summary` SHALL include total findings and counts for high, medium, and low severity
