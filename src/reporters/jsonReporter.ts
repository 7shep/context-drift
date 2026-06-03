import type { CheckReport } from "../types.js";

export function renderJsonReport(report: CheckReport): string {
  return JSON.stringify(report, null, 2);
}
