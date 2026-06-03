# Design

The duplicate utility analyzer consumes `ConventionProfile.exportedFunctions`, populated by milestone 7. It filters changed files to the `utility` category, finds exports from those changed files, and compares them against exported functions from non-changed files.

Similarity is deterministic and dependency-free. Exact names score `1`. Prefix-related helper names receive a high score, which catches common variants like `formatDate` and `formatDateShort`. Other names fall back to normalized Levenshtein similarity. Findings are emitted when the best match is at least `0.75`.

Changed files are excluded from baseline candidates so a batch of new duplicate utilities does not create self-reinforcing matches.
