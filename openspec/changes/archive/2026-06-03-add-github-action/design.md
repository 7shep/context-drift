# Design

The action is a composite action. It installs and builds dependencies in `github.action_path`, then changes execution context to `github.workspace` for the actual scan. That distinction matters when the action is used from another repository: the action code lives in one path, while the user's checked-out repository is the workspace to scan.

Inputs map directly to existing CLI options:

- `base-ref` -> `--base`
- `min-confidence` -> `--min-confidence`
- `format` -> `--format`

The first action version prints the report to the workflow logs. PR commenting is deferred to milestone 12.
