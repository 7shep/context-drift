# Add File Location Drift Analyzer

## Summary

Milestone 6 adds a pure analyzer that reports changed files whose category is recognizable but whose directory does not match the repository's established folders for that category.

## Goals

- Detect likely misplaced component, hook, API, service, utility, route, and test files.
- Reuse `RepoFile`, `ConventionProfile`, and `classifyFileCategory`.
- Keep the analyzer deterministic and free of I/O.
- Include confidence, severity, suggestions, and related examples in findings.

## Non-goals

- No AST or file-content parsing.
- No configuration file support.
- No reporter overhaul beyond the minimum CLI integration needed to show findings.
