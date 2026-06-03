import fs from "node:fs/promises";
import path from "node:path";
import { afterEach } from "vitest";
import { describe, expect, it } from "vitest";
import { isSupportedSourceFile, normalizePath, scanRepo } from "../src/scanner.js";

const fixtures: string[] = [];

async function makeFixture(files: Record<string, string>): Promise<string> {
  const fixtureRoot = path.join(process.cwd(), "tests", `.tmp-scanner-${Date.now()}`);
  fixtures.push(fixtureRoot);

  for (const [filePath, content] of Object.entries(files)) {
    const absolutePath = path.join(fixtureRoot, filePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, content, "utf8");
  }

  return fixtureRoot;
}

afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((fixture) => fs.rm(fixture, { recursive: true, force: true })));
});

describe("normalizePath", () => {
  it("converts backslashes to forward slashes", () => {
    expect(normalizePath("src\\components\\Card.tsx")).toBe(
      "src/components/Card.tsx"
    );
  });

  it("strips a leading ./", () => {
    expect(normalizePath("./src/index.ts")).toBe("src/index.ts");
  });

  it("strips a leading /", () => {
    expect(normalizePath("/src/index.ts")).toBe("src/index.ts");
  });
});

describe("isSupportedSourceFile", () => {
  it.each(["a.ts", "b.tsx", "c.js", "d.jsx", "Path/To/Comp.TSX"])(
    "accepts %s",
    (file) => {
      expect(isSupportedSourceFile(file)).toBe(true);
    }
  );

  it.each(["notes.md", "data.json", "style.css", "image.png", "noext"])(
    "rejects %s",
    (file) => {
      expect(isSupportedSourceFile(file)).toBe(false);
    }
  );
});

describe("scanRepo", () => {
  it("loads source content for supported files", async () => {
    const fixtureRoot = await makeFixture({
      "src/index.ts": "export function run() {}",
      "README.md": "# ignored"
    });

    expect(await scanRepo({ cwd: fixtureRoot })).toEqual([
      {
        path: "src/index.ts",
        name: "index.ts",
        extension: ".ts",
        directory: "src",
        content: "export function run() {}",
        isChanged: false
      }
    ]);
  });
});
