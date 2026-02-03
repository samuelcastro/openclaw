import { describe, expect, it } from "vitest";
import { courseData } from "../course-data";

describe("course data exists for UI", () => {
  it("has at least one module", () => {
    expect(courseData.modules.length).toBeGreaterThan(0);
  });
});
