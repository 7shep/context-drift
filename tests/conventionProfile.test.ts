import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildConventionProfile, classifyFileCategory } from "../src/conventionProfile.js";
import { summarizeNamingStyles } from "../src/naming.js";
import type { RepoFile } from "../src/types.js";

/** Build a RepoFile from a repo-relative path, mirroring the scanner. */
function file(filePath: string, isChanged = false): RepoFile {
  const normalized = filePath.replaceAll("\\", "/");
  const parsed = path.posix.parse(normalized);
  return {
    path: normalized,
    name: parsed.base,
    extension: parsed.ext,
    directory: parsed.dir,
    isChanged
  };
}

describe("classifyFileCategory", () => {
  it("classifies test files", () => {
    expect(classifyFileCategory(file("src/Button.test.tsx"))).toBe("test");
    expect(classifyFileCategory(file("src/helpers.spec.ts"))).toBe("test");
  });

  it("classifies Next.js route files by base name", () => {
    expect(classifyFileCategory(file("app/page.tsx"))).toBe("route");
    expect(classifyFileCategory(file("app/dashboard/layout.tsx"))).toBe("route");
    expect(classifyFileCategory(file("app/not-found.tsx"))).toBe("route");
    expect(classifyFileCategory(file("src/middleware.ts"))).toBe("route");
  });

  it("classifies hooks by name or folder", () => {
    expect(classifyFileCategory(file("src/useUser.ts"))).toBe("hook");
    expect(classifyFileCategory(file("src/hooks/helper.ts"))).toBe("hook");
  });

  it("classifies PascalCase JSX files as components", () => {
    expect(classifyFileCategory(file("src/components/UserCard.tsx"))).toBe("component");
    expect(classifyFileCategory(file("src/Widget.jsx"))).toBe("component");
  });

  it("classifies API files by name or folder", () => {
    expect(classifyFileCategory(file("src/apiClient.ts"))).toBe("api");
    expect(classifyFileCategory(file("src/lib/api/client.ts"))).toBe("api");
  });

  it("classifies service files by name or folder", () => {
    expect(classifyFileCategory(file("src/UserService.ts"))).toBe("service");
    expect(classifyFileCategory(file("src/services/registry.ts"))).toBe("service");
  });

  it("classifies utility files by name or folder", () => {
    expect(classifyFileCategory(file("src/formatDate.ts"))).toBe("utility");
    expect(classifyFileCategory(file("src/utils/thing.ts"))).toBe("utility");
    expect(classifyFileCategory(file("src/lib/parseConfig.ts"))).toBe("utility");
  });

  it("returns unknown when no heuristic matches", () => {
    expect(classifyFileCategory(file("src/index.ts"))).toBe("unknown");
    // a non-PascalCase .tsx is not treated as a component
    expect(classifyFileCategory(file("src/components/user_profile_card.tsx"))).toBe("unknown");
  });

  it("applies first-match-wins precedence", () => {
    // .test. wins even though "Button" is a PascalCase .tsx (would-be component)
    expect(classifyFileCategory(file("src/Button.test.tsx"))).toBe("test");
    // a hook under services/ is a hook, not a service
    expect(classifyFileCategory(file("src/services/useThing.ts"))).toBe("hook");
  });
});

describe("buildConventionProfile", () => {
  it("returns a zeroed profile for an empty repo", () => {
    const profile = buildConventionProfile([]);
    expect(profile.filesScanned).toBe(0);
    expect(profile.naming).toEqual(summarizeNamingStyles([]));
    expect(profile.folders).toEqual({
      components: [],
      hooks: [],
      api: [],
      services: [],
      utilities: [],
      routes: [],
      tests: []
    });
    expect(profile.exportedFunctions).toEqual([]);
  });

  it("reports files scanned and reuses the naming summarizer", () => {
    const files = [
      file("src/components/Card.tsx"),
      file("src/useUser.ts"),
      file("src/index.ts")
    ];
    const profile = buildConventionProfile(files);
    expect(profile.filesScanned).toBe(files.length);
    expect(profile.naming).toEqual(summarizeNamingStyles(files));
  });

  it("ranks folders by descending file count, then by path", () => {
    const files = [
      file("src/components/Card.tsx"),
      file("src/components/Button.tsx"),
      file("src/components/Modal.tsx"),
      file("src/components/Input.tsx"),
      file("src/components/Badge.tsx"),
      file("src/widgets/Avatar.tsx")
    ];
    expect(buildConventionProfile(files).folders.components).toEqual([
      "src/components",
      "src/widgets"
    ]);
  });

  it("breaks count ties by ascending path", () => {
    const files = [file("src/b/Modal.tsx"), file("src/a/Card.tsx")];
    expect(buildConventionProfile(files).folders.components).toEqual(["src/a", "src/b"]);
  });

  it("keeps categories independent", () => {
    const profile = buildConventionProfile([
      file("src/components/Card.tsx"),
      file("src/hooks/useThing.ts")
    ]);
    expect(profile.folders.components).toEqual(["src/components"]);
    expect(profile.folders.hooks).toEqual(["src/hooks"]);
  });

  it("lets a directory appear under multiple categories", () => {
    const profile = buildConventionProfile([
      file("src/lib/apiClient.ts"),
      file("src/lib/parseConfig.ts")
    ]);
    expect(profile.folders.api).toContain("src/lib");
    expect(profile.folders.utilities).toContain("src/lib");
  });

  it("always returns an empty exportedFunctions list", () => {
    expect(buildConventionProfile([file("src/components/Card.tsx")]).exportedFunctions).toEqual(
      []
    );
  });
});
