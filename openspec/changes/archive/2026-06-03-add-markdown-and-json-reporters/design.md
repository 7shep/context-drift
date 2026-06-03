# Design

The CLI now builds a `CheckReport` object containing summary counts, naming distribution, and filtered findings. Output formatting is delegated to `renderMarkdownReport` and `renderJsonReport`.

Markdown keeps terminal readability while grouping findings into high, medium, and low confidence sections. JSON emits the same report object using stable top-level fields: `summary`, `naming`, and `findings`.

The existing `--format` option now controls actual output format rather than only echoing a selected value.
