import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("style.css", () => {
  let cssContent: string;

  beforeAll(() => {
    const cssPath = join(process.cwd(), "src", "style.css");
    cssContent = readFileSync(cssPath, "utf-8");
  });

  it("should contain .ad-slot class", () => {
    expect(cssContent).toMatch(/\.ad-slot/);
  });

  it("should contain :focus-visible or :focus pseudo-class", () => {
    expect(cssContent).toMatch(/:focus-visible|:focus/);
  });

  it("should contain dark background rule", () => {
    expect(cssContent).toMatch(/background.*#\d|background.*var\(--color-bg\)/);
  });

  it("should contain @media query for responsive design", () => {
    expect(cssContent).toMatch(/@media/);
  });
});
