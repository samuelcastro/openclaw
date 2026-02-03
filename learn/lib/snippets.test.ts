import { describe, expect, it } from "vitest";
import { extractSnippet } from "./snippets";

describe("extractSnippet", () => {
  it("returns the requested line range", () => {
    const source = ["a", "b", "c", "d"].join("\n");
    expect(extractSnippet(source, 2, 3)).toBe("b\nc");
  });
});
