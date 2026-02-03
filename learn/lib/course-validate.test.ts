import { describe, expect, it } from "vitest";
import { validateCourseData } from "./course-validate";
import { courseData } from "./course-data";
import { hasSnippet } from "./snippets";

describe("validateCourseData", () => {
  it("rejects duplicate ids", () => {
    const data = {
      modules: [
        {
          id: "gateway",
          title: "Gateway",
          level: "core",
          badge: { id: "b1", title: "Badge", points: 10 },
          chapters: [
            {
              id: "a",
              title: "A",
              summary: "Summary",
              snippetIds: ["cli-entry"],
              principle: { title: "P", summary: "S", takeaways: ["T"] },
              quiz: [
                {
                  id: "q1",
                  prompt: "Q",
                  options: ["A"],
                  correctIndex: 0,
                  explanation: "Because",
                },
              ],
            },
          ],
        },
        {
          id: "gateway",
          title: "Gateway 2",
          level: "core",
          badge: { id: "b2", title: "Badge", points: 10 },
          chapters: [
            {
              id: "b",
              title: "B",
              summary: "Summary",
              snippetIds: ["cli-entry"],
              principle: { title: "P", summary: "S", takeaways: ["T"] },
              quiz: [
                {
                  id: "q2",
                  prompt: "Q",
                  options: ["A"],
                  correctIndex: 0,
                  explanation: "Because",
                },
              ],
            },
          ],
        },
      ],
    };
    expect(() => validateCourseData(data as never)).toThrow(/duplicate module id/i);
  });

  it("accepts the course data", () => {
    expect(() => validateCourseData(courseData)).not.toThrow();
  });

  it("requires principles and quiz explanations", () => {
    const base = {
      modules: [
        {
          id: "launchpad",
          title: "Launchpad",
          level: "intro",
          badge: { id: "b1", title: "Warmup", points: 100 },
          chapters: [
            {
              id: "c1",
              title: "C1",
              summary: "Summary",
              snippetIds: ["cli-entry"],
              principle: { title: "", summary: "", takeaways: [] },
              quiz: [
                {
                  id: "q1",
                  prompt: "Q",
                  options: ["A"],
                  correctIndex: 0,
                  explanation: "",
                },
              ],
            },
          ],
        },
      ],
    };
    expect(() => validateCourseData(base as never)).toThrow(/principle|explanation/i);
  });

  it("all snippet ids resolve", () => {
    const ids = new Set(
      courseData.modules.flatMap((module) =>
        module.chapters.flatMap((chapter) => chapter.snippetIds),
      ),
    );
    ids.forEach((id) => {
      expect(hasSnippet(id)).toBe(true);
    });
  });
});
