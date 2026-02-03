import type { CourseData } from "./course-types";

export function validateCourseData(data: CourseData) {
  const moduleIds = new Set<string>();
  for (const mod of data.modules) {
    if (moduleIds.has(mod.id)) {
      throw new Error(`duplicate module id: ${mod.id}`);
    }
    moduleIds.add(mod.id);
    const chapterIds = new Set<string>();
    for (const chapter of mod.chapters) {
      if (chapterIds.has(chapter.id)) {
        throw new Error(`duplicate chapter id: ${chapter.id}`);
      }
      chapterIds.add(chapter.id);
      if (!chapter.principle?.title || !chapter.principle?.summary) {
        throw new Error(`chapter ${chapter.id} missing principle`);
      }
      if (
        !Array.isArray(chapter.principle.takeaways) ||
        chapter.principle.takeaways.length === 0
      ) {
        throw new Error(`chapter ${chapter.id} missing principle takeaways`);
      }
      chapter.quiz.forEach((question) => {
        if (!question.explanation?.trim()) {
          throw new Error(`quiz ${question.id} missing explanation`);
        }
      });
    }
  }
}
