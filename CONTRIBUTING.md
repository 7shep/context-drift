# Contributing

Thanks for helping improve Context Drift.

Keep changes focused, reviewable, and easy to verify.

## Principles

- Open one issue per pull request.
- Avoid noisy PRs that mix unrelated fixes, refactors, or formatting changes.
- Keep the scope small enough that a reviewer can understand the change quickly.
- Include validation steps in every PR.

## Before You Open a PR

1. Create a branch for the specific issue you are solving.
2. Make the smallest change that fully addresses that issue.
3. Run the relevant checks:
   - `npm run build`
   - `npm test`
   - `npm run typecheck`
4. Confirm the diff contains only the files that belong in the PR.
5. Open the PR with a clear title and a short explanation of the change.

## Pull Request Template

Use this template when opening a PR:

```md
## Summary
Briefly describe the issue and the fix.

## Related Issue
Link the issue this PR closes or references.

## What Changed
- List the user-visible or behavior changes.
- Keep this focused on the single issue the PR solves.

## Validation
- List the commands or tests you ran.
- Mention any manual checks if they matter.

## Notes
- Call out anything a reviewer should know.
- Mention follow-up work separately instead of bundling it here.
```

## Good PR Shape

- One problem.
- One solution.
- One review path.

If a change starts to expand, split it into a follow-up PR instead of letting the current one become noisy.
