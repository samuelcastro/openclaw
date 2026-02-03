import type { CourseModule } from "./course-types";

export function computeProgress(params: {
  modules: CourseModule[];
  completedChapters: string[];
}) {
  const completedSet = new Set(params.completedChapters);
  const unlockedModules = new Set<string>();
  const completedModules = new Set<string>();
  const unlockedChapters = new Set<string>();
  let nextChapterId: string | null = null;

  params.modules.forEach((module, index) => {
    const prevModule = params.modules[index - 1];
    const prevComplete = !prevModule
      ? true
      : prevModule.chapters.every((chapter) => completedSet.has(chapter.id));
    if (index === 0 || prevComplete) {
      unlockedModules.add(module.id);
    }

    const moduleComplete = module.chapters.every((chapter) => completedSet.has(chapter.id));
    if (moduleComplete) {
      completedModules.add(module.id);
    }

    if (unlockedModules.has(module.id)) {
      module.chapters.forEach((chapter, chapterIndex) => {
        const prevChapter = module.chapters[chapterIndex - 1];
        const prevChapterComplete = !prevChapter || completedSet.has(prevChapter.id);
        if (prevChapterComplete) {
          unlockedChapters.add(chapter.id);
          if (!completedSet.has(chapter.id) && !nextChapterId) {
            nextChapterId = chapter.id;
          }
        }
      });
    }
  });

  return {
    completedModules: Array.from(completedModules),
    unlockedModules: Array.from(unlockedModules),
    unlockedChapters: Array.from(unlockedChapters),
    nextChapterId,
  };
}

export function scoreQuiz(expected: number[], answers: number[]) {
  let correct = 0;
  for (let i = 0; i < expected.length; i += 1) {
    if (answers[i] === expected[i]) {
      correct += 1;
    }
  }
  return { correct, total: expected.length };
}
