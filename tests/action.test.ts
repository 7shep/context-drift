import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("GitHub Action", () => {
  it("preserves the CLI exit code when tee writes the report", async () => {
    const action = await fs.readFile(path.join(process.cwd(), "action.yml"), "utf8");
    const pipefailIndex = action.indexOf("set -o pipefail");
    const teePipelineIndex = action.indexOf('| tee "$report_file"');

    expect(pipefailIndex).toBeGreaterThanOrEqual(0);
    expect(teePipelineIndex).toBeGreaterThanOrEqual(0);
    expect(pipefailIndex).toBeLessThan(teePipelineIndex);
  });
});
