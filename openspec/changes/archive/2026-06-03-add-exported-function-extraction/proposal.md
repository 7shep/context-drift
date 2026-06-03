# Add Exported Function Extraction

## Summary

Milestone 7 populates the convention profile's `exportedFunctions` field from scanned source content so later analyzers can compare new helper names against existing utilities.

## Goals

- Load source content while scanning supported files.
- Extract exported function declarations, named default functions, and exported const arrow functions.
- Keep `buildConventionProfile` pure by deriving exports only from `RepoFile.content`.
- Preserve empty `exportedFunctions` behavior for path-only test fixtures and callers.

## Non-goals

- No class method extraction.
- No re-export analysis.
- No semantic type analysis.
