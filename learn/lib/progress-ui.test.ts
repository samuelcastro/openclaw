import { describe, expect, it } from "vitest";
import { computeProgress } from "./progress";
import type { CourseModule } from "./course-types";

const modules = [
  {
    id: "launchpad",
    title: "Launchpad",
    level: "intro",
    badge: { id: "b1", title: "Warmup", points: 100 },
    chapters: [
      {
        id: "c1",
        title: "C1",
        summary: "",
        snippetIds: [],
        principle: { title: "", summary: "", takeaways: [] },
        quiz: [
          { id: "q1", prompt: "", options: ["a"], correctIndex: 0, explanation: "" },
        ],
      },
    ],
  },
] as unknown as CourseModule[];

describe("progress UI expectations", () => {
  it("keeps the first module unlocked", () => {
    const result = computeProgress({ modules, completedChapters: [] });
    expect(result.unlockedModules).toContain("launchpad");
  });
});
