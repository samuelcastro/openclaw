import { describe, expect, it } from "vitest";
import { buildShareUrl } from "./share";

describe("buildShareUrl", () => {
  it("builds a share link with encoded text", () => {
    const url = buildShareUrl("https://example.com", "I finished");
    expect(url).toContain("https://");
    expect(url).toContain("I%20finished");
  });
});
