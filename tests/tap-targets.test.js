import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(path.resolve(process.cwd(), "app/globals.css"), "utf8");

describe("phone tap targets", () => {
  it("keeps menu links and circle rows at least 44px", () => {
    expect(css).toMatch(/\.mobile-panel a\{[^}]*min-height:44px/);
    expect(css).toMatch(/\.menu-button\{[^}]*min-height:44px/);
    expect(css).toMatch(/a\.rank-link\{[^}]*min-height:44px/);
    expect(css).toMatch(/header\.top \.header-pass\{[^}]*min-height:44px/);
  });
});
