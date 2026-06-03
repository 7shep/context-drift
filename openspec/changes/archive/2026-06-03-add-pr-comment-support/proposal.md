# Add PR Comment Support

## Summary

Milestone 12 extends the GitHub Action to post or update a single pull request comment when Context Drift finds issues.

## Goals

- Add optional `github-token` input.
- Capture the Markdown report to a file.
- Skip commenting when there are no findings.
- Update an existing Context Drift comment instead of posting duplicates.
- Document token and permissions requirements.

## Non-goals

- No JSON-to-Markdown conversion for comments.
- No deleting comments when findings disappear.
- No custom comment templates.
