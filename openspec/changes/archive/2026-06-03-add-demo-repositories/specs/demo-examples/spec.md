# demo-examples Specification

## Purpose

Provide clean and drifted example repositories that demonstrate Context Drift findings.

## Requirements

### Requirement: Provide clean and drifted Next.js-style examples

The repository SHALL include `examples/nextjs-clean` and `examples/nextjs-drifted` directories with comparable baseline files.

#### Scenario: Clean example shows established patterns

- **WHEN** a user inspects `examples/nextjs-clean`
- **THEN** they SHALL see established API, component, hook, and date utility patterns

#### Scenario: Drifted example includes bad additions

- **WHEN** a user inspects `examples/nextjs-drifted`
- **THEN** they SHALL see drifted files for API location, component naming, and duplicate utility naming

### Requirement: Document demo usage

The README SHALL include a command that runs the CLI against the drifted example's changed files.

#### Scenario: User wants to run the demo

- **WHEN** a user reads the README
- **THEN** they SHALL find a demo command using `check --changed`
