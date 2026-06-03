import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createCli } from "../src/cli.js";

const fixtures: string[] = [];

async function makeFixture(files: string[]): Promise<string> {
  const fixtureRoot = path.join(process.cwd(), "tests", `.tmp-cli-${Date.now()}`);
  fixtures.push(fixtureRoot);

  for (const filePath of files) {
    const absolutePath = path.join(fixtureRoot, filePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, "", "utf8");
  }

  return fixtureRoot;
}

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(fixtures.splice(0).map((fixture) => fs.rm(fixture, { recursive: true, force: true })));
});

describe("CLI naming drift output", () => {
  it("prints naming drift findings for changed files above the confidence threshold", async () => {
    const cwd = process.cwd();
    const fixtureRoot = await makeFixture([
      "src/components/UserCard.tsx",
      "src/components/UserMenu.tsx",
      "src/components/user_profile_card.tsx"
    ]);
    const logs: string[] = [];
    vi.spyOn(console, "log").mockImplementation((message = "") => {
      logs.push(String(message));
    });

    process.chdir(fixtureRoot);
    try {
      const program = createCli();
      await program.parseAsync(
        [
          "node",
          "context-drift",
          "check",
          "--changed",
          "src/components/user_profile_card.tsx",
          "--min-confidence",
          "0.9"
        ],
        { from: "node" }
      );
    } finally {
      process.chdir(cwd);
    }

    expect(logs.join("\n")).toContain("Drift findings:");
    expect(logs.join("\n")).toContain("src/components/user_profile_card.tsx");
    expect(logs.join("\n")).toContain(
      "Most files in src/components use PascalCase, but this file uses snake_case."
    );
  });
});
