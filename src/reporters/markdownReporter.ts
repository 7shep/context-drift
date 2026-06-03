import type { CheckReport, DriftFinding, NamingStyleSummary } from "../types.js";

export function renderMarkdownReport(report: CheckReport): string {
  const lines = [
    "# Context Drift Report",
    "",
    `Files scanned: ${report.summary.filesScanned}`,
    `Changed files: ${report.summary.changedFiles}`,
    `Findings: ${report.summary.findings}`,
    "",
    "## Naming conventions",
    ...renderNaming(report.naming),
    "",
    ...renderFindings(report.findings)
  ];

  return lines.join("\n").trimEnd();
}

function renderNaming(naming: NamingStyleSummary): string[] {
  const rows: Array<[string, number]> = [
    ["PascalCase", naming.pascalCasePercent],
    ["camelCase", naming.camelCasePercent],
    ["kebab-case", naming.kebabCasePercent],
    ["snake_case", naming.snakeCasePercent],
    ["lowercase", naming.lowerCasePercent],
    ["UPPERCASE", naming.upperCasePercent],
    ["unknown", naming.unknownPercent]
  ];
  const present = rows.filter(([, percent]) => percent > 0);

  if (present.length === 0) {
    return ["- (no source files)"];
  }
  return present.map(([label, percent]) => `- ${label}: ${percent}%`);
}

function renderFindings(findings: DriftFinding[]): string[] {
  if (findings.length === 0) {
    return ["## Findings", "", "No drift findings."];
  }

  return [
    "## Findings",
    "",
    `Found ${findings.length} possible convention ${findings.length === 1 ? "drift" : "drifts"}.`,
    "",
    ...renderSeverityGroup("High Confidence", findings, "high"),
    ...renderSeverityGroup("Medium Confidence", findings, "medium"),
    ...renderSeverityGroup("Low Confidence", findings, "low")
  ].filter((line, index, lines) => line !== "" || lines[index - 1] !== "");
}

function renderSeverityGroup(
  heading: string,
  findings: DriftFinding[],
  severity: DriftFinding["severity"]
): string[] {
  const group = findings.filter((finding) => finding.severity === severity);
  if (group.length === 0) {
    return [];
  }

  return [
    `### ${heading}`,
    "",
    ...group.flatMap((finding) => renderFinding(finding)),
    ""
  ];
}

function renderFinding(finding: DriftFinding): string[] {
  const lines = [
    `#### ${finding.title}`,
    "",
    `- File: \`${finding.file}\``,
    `- Type: \`${finding.type}\``,
    `- Confidence: ${Math.round(finding.confidence * 100)}%`,
    `- Details: ${finding.message}`
  ];

  if (finding.suggestion) {
    lines.push(`- Suggestion: ${finding.suggestion}`);
  }
  if (finding.relatedFiles && finding.relatedFiles.length > 0) {
    lines.push("- Related files:");
    lines.push(...finding.relatedFiles.map((file) => `  - \`${file}\``));
  }

  return [...lines, ""];
}
