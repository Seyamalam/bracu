import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const apiRoot = join(process.cwd(), "src/app/api");

function routeFiles(dir: string): string[] {
  return readdirSync(dir)
    .flatMap((entry) => {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) {
        return routeFiles(path);
      }
      return path.endsWith("route.ts") ? [path] : [];
    })
    .sort();
}

describe("API route implementation contracts", () => {
  test("AI generation routes include no-key demo and provider-failure fallback paths", () => {
    const aiRoutes = routeFiles(apiRoot)
      .map((path) => ({
        path,
        source: readFileSync(path, "utf8"),
      }))
      .filter((route) => route.source.includes("generateText"));

    expect(aiRoutes.length).toBeGreaterThan(0);

    for (const route of aiRoutes) {
      expect(route.source, route.path).toContain("hasAiProvider()");
      expect(route.source, route.path).toContain("resolveAiModel(");
      expect(route.source, route.path).toContain("buildPromptForProvider(");
      if (!route.path.endsWith("src/app/api/mcp/route.ts")) {
        expect(route.source, route.path).toContain('mode: "demo"');
      }
      expect(route.source, route.path).toContain("try {");
      expect(route.source, route.path).toContain("catch");
    }
  });

  test("clinic API routes do not advertise placeholder implementations", () => {
    const blockedPatterns = [
      /not implemented/i,
      /coming soon/i,
      /placeholder/i,
      /preview_only/i,
    ];

    for (const path of routeFiles(apiRoot)) {
      const source = readFileSync(path, "utf8");
      for (const pattern of blockedPatterns) {
        expect(source, `${path} should not contain ${pattern}`).not.toMatch(
          pattern,
        );
      }
    }
  });
});
