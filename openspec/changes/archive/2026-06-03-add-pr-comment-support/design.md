# Design

The composite action writes the CLI report to `$RUNNER_TEMP` while still printing it to logs. A later step runs only when all of the following are true:

- `github-token` is set.
- The event is `pull_request`.
- The selected format is `markdown`.

The comment body starts with `<!-- context-drift-report -->`, which gives the action a stable marker for finding previous comments. When the report contains `Findings: 0`, the comment step exits without posting.

The implementation uses the GitHub CLI available on hosted runners and authenticates with `GH_TOKEN`.
