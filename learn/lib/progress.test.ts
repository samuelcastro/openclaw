import { describe, expect, it } from "vitest";
import { computeProgress, scoreQuiz } from "./progress";
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
      {
        id: "c2",
        title: "C2",
        summary: "",
        snippetIds: [],
        principle: { title: "", summary: "", takeaways: [] },
        quiz: [
          { id: "q2", prompt: "", options: ["a"], correctIndex: 0, explanation: "" },
        ],
      },
    ],
  },
  {
    id: "gateway",
    title: "Gateway",
    level: "core",
    badge: { id: "b2", title: "Steward", points: 100 },
    chapters: [
      {
        id: "c3",
        title: "C3",
        summary: "",
        snippetIds: [],
        principle: { title: "", summary: "", takeaways: [] },
        quiz: [
          { id: "q3", prompt: "", options: ["a"], correctIndex: 0, explanation: "" },
        ],
      },
    ],
  },
] as unknown as CourseModule[];

describe("progress", () => {
  it("keeps first module unlocked and unlocks next only after all chapters", () => {
    const state = computeProgress({ modules, completedChapters: ["c1"] });
    expect(state.unlockedModules).toContain("launchpad");
    expect(state.unlockedModules).not.toContain("gateway");

    const complete = computeProgress({ modules, completedChapters: ["c1", "c2"] });
    expect(complete.unlockedModules).toContain("gateway");
  });

  it("unlocks chapters sequentially within a module", () => {
    const state = computeProgress({ modules, completedChapters: [] });
    expect(state.unlockedChapters).toContain("c1");
    expect(state.unlockedChapters).not.toContain("c2");

    const next = computeProgress({ modules, completedChapters: ["c1"] });
    expect(next.unlockedChapters).toContain("c2");
  });

  it("returns nextChapterId for the learner", () => {
    const state = computeProgress({ modules, completedChapters: [] });
    expect(state.nextChapterId).toBe("c1");

    const next = computeProgress({ modules, completedChapters: ["c1"] });
    expect(next.nextChapterId).toBe("c2");
  });

  it("scores quiz with exact match", () => {
    const result = scoreQuiz([0, 2], [0, 1]);
    expect(result.correct).toBe(1);
  });
});
