import { describe, expect, it } from "vitest";
import { isSupportedSourceFile, normalizePath } from "../src/scanner.js";

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
