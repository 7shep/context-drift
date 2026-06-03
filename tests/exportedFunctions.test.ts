import { describe, expect, it } from "vitest";
import { extractExportedFunctions } from "../src/exportedFunctions.js";

describe("extractExportedFunctions", () => {
  it("extracts exported function declarations", () => {
    expect(
      extractExportedFunctions(
        `
          export function formatDate() {}
          export async function parseDate() {}
          function internalOnly() {}
        `,
        "src/lib/date.ts"
      )
    ).toEqual([
      { name: "formatDate", filePath: "src/lib/date.ts" },
      { name: "parseDate", filePath: "src/lib/date.ts" }
    ]);
  });

  it("extracts named default functions and const arrow functions", () => {
    expect(
      extractExportedFunctions(
        `
          export default function DateFormatter() {}
          export const formatRelativeDate = (date: Date) => date.toISOString();
          export const parseRelativeDate = async (value: string) => value;
          export const notAFunction = "value";
        `,
        "src/lib/date.ts"
      )
    ).toEqual([
      { name: "DateFormatter", filePath: "src/lib/date.ts" },
      { name: "formatRelativeDate", filePath: "src/lib/date.ts" },
      { name: "parseRelativeDate", filePath: "src/lib/date.ts" }
    ]);
  });
});
