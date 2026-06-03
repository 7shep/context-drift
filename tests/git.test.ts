import { describe, expect, it } from "vitest";
import { parseGitDiffOutput } from "../src/git.js";

describe("parseGitDiffOutput", () => {
  it("splits lines into individual paths", () => {
    const output = "src/cli.ts\nsrc/scanner.ts\nREADME.md\n";
    expect(parseGitDiffOutput(output)).toEqual([
      "src/cli.ts",
      "src/scanner.ts",
      "README.md"
    ]);
  });

  it("ignores blank lines and surrounding whitespace", () => {
    const output = "\n  src/git.ts  \n\n";
    expect(parseGitDiffOutput(output)).toEqual(["src/git.ts"]);
  });

  it("normalizes backslash paths and leading ./", () => {
    const output = "src\\components\\Card.tsx\n./src/index.ts\n";
    expect(parseGitDiffOutput(output)).toEqual([
      "src/components/Card.tsx",
      "src/index.ts"
    ]);
  });

  it("returns an empty list for empty output", () => {
    expect(parseGitDiffOutput("")).toEqual([]);
  });

  it("handles CRLF line endings", () => {
    const output = "src/a.ts\r\nsrc/b.ts\r\n";
    expect(parseGitDiffOutput(output)).toEqual(["src/a.ts", "src/b.ts"]);
  });
});
