# Add Duplicate Utility Drift Analyzer

## Summary

Milestone 8 detects changed utility files that export function names similar to existing exported helpers, surfacing likely duplicate helper implementations.

## Goals

- Compare changed utility exports against baseline exported functions.
- Exclude changed files from baseline candidates.
- Use deterministic local string similarity.
- Emit standard `duplicate-utility` findings through the CLI pipeline.

## Non-goals

- No embeddings.
- No semantic function-body comparison.
- No import graph or usage analysis.
