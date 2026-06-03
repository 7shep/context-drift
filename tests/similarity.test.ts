import { describe, expect, it } from "vitest";
import { nameSimilarity } from "../src/similarity.js";

describe("nameSimilarity", () => {
  it("scores prefix-related helper names highly", () => {
    expect(nameSimilarity("formatDate", "formatDateShort")).toBe(0.95);
  });

  it("scores unrelated names lower", () => {
    expect(nameSimilarity("formatDate", "parseConfig")).toBeLessThan(0.75);
  });
});
