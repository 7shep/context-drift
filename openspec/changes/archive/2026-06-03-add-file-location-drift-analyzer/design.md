# Design

Milestone 6 builds on the convention profile from milestone 4 and the finding shape established in milestone 5. The analyzer compares each changed file's inferred category against the ranked folders in `profile.folders`.

The implementation excludes changed files from evidence so a batch of misplaced files cannot make the misplaced folder appear conventional. A finding is emitted only when there are at least two non-changed baseline files in the same category and the changed file is outside every common folder already present in the profile for that category.

Confidence is the share of baseline category files that live in the profile's common folders. Severity follows the same thresholds used by naming drift: high at `0.9`, medium at `0.75`, and low otherwise.

CLI output is updated from a naming-specific heading to a generic drift heading so multiple analyzer types can be shown together.
