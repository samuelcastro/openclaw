# OpenClaw Course Reflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild `/learn/course` into a clear three-column learning flow (route map → chapter desk → progress), fix gating logic, upgrade quizzes to principle-driven questions, and add confetti feedback.

**Architecture:** Keep data-driven course content in `learn/lib/course-data.ts`, compute unlock state in `learn/lib/progress.ts`, and render the UI with a left route map, center chapter desk, and right progress panel. Confetti is a small client-only overlay triggered on correct answers and module completion.

**Tech Stack:** Next.js App Router, React 19, Tailwind v4, shadcn/ui, Vitest.

---

### Task 1: Fix progression logic (modules unlock only after all chapters)

**Files:**
- Modify: `learn/lib/progress.ts`
- Modify: `learn/lib/progress.test.ts`
- Modify: `learn/lib/progress-ui.test.ts`

**Step 1: Write the failing tests**

```ts
// learn/lib/progress.test.ts
import { describe, expect, it } from "vitest";
import { computeProgress, scoreQuiz } from "./progress";
import type { CourseModule } from "./course-types";

const modules: CourseModule[] = [
  {
    id: "launchpad",
    title: "Launchpad",
    level: "intro",
    badge: { id: "b1", title: "Warmup", points: 100 },
    chapters: [
      { id: "c1", title: "C1", summary: "", snippetIds: [], principle: { title: "", summary: "", takeaways: [] }, quiz: [{ id: "q1", prompt: "", options: ["a"], correctIndex: 0, explanation: "" }] },
      { id: "c2", title: "C2", summary: "", snippetIds: [], principle: { title: "", summary: "", takeaways: [] }, quiz: [{ id: "q2", prompt: "", options: ["a"], correctIndex: 0, explanation: "" }] },
    ],
  },
  {
    id: "gateway",
    title: "Gateway",
    level: "core",
    badge: { id: "b2", title: "Steward", points: 100 },
    chapters: [
      { id: "c3", title: "C3", summary: "", snippetIds: [], principle: { title: "", summary: "", takeaways: [] }, quiz: [{ id: "q3", prompt: "", options: ["a"], correctIndex: 0, explanation: "" }] },
    ],
  },
];

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
```

```ts
// learn/lib/progress-ui.test.ts
import { describe, expect, it } from "vitest";
import { computeProgress } from "./progress";
import type { CourseModule } from "./course-types";

const modules: CourseModule[] = [
  {
    id: "launchpad",
    title: "Launchpad",
    level: "intro",
    badge: { id: "b1", title: "Warmup", points: 100 },
    chapters: [
      { id: "c1", title: "C1", summary: "", snippetIds: [], principle: { title: "", summary: "", takeaways: [] }, quiz: [{ id: "q1", prompt: "", options: ["a"], correctIndex: 0, explanation: "" }] },
    ],
  },
];

describe("progress UI expectations", () => {
  it("keeps the first module unlocked", () => {
    const result = computeProgress({ modules, completedChapters: [] });
    expect(result.unlockedModules).toContain("launchpad");
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd learn && pnpm test -- lib/progress.test.ts lib/progress-ui.test.ts`
Expected: FAIL (signature mismatch / missing fields).

**Step 3: Write minimal implementation**

```ts
// learn/lib/progress.ts
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
```

**Step 4: Run tests to verify they pass**

Run: `cd learn && pnpm test -- lib/progress.test.ts lib/progress-ui.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add learn/lib/progress.ts learn/lib/progress.test.ts learn/lib/progress-ui.test.ts
git commit -m "Learn: fix module and chapter unlock logic"
```

---

### Task 2: Expand course schema to include principles + quiz explanations

**Files:**
- Modify: `learn/lib/course-types.ts`
- Modify: `learn/lib/course-validate.ts`
- Modify: `learn/lib/course-validate.test.ts`

**Step 1: Write the failing test**

```ts
// learn/lib/course-validate.test.ts
import { describe, it, expect } from "vitest";
import { validateCourseData } from "./course-validate";

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
          principle: { title: "Principle", summary: "Why", takeaways: ["A"] },
          quiz: [
            { id: "q1", prompt: "Q", options: ["A"], correctIndex: 0, explanation: "Because" },
          ],
        },
      ],
    },
  ],
};

describe("validateCourseData", () => {
  it("rejects duplicate ids", () => {
    const data = {
      ...base,
      modules: [...base.modules, { ...base.modules[0], id: "launchpad" }],
    };
    expect(() => validateCourseData(data as any)).toThrow(/duplicate module id/i);
  });

  it("requires principles and quiz explanations", () => {
    const data = JSON.parse(JSON.stringify(base));
    data.modules[0].chapters[0].principle = { title: "", summary: "", takeaways: [] };
    data.modules[0].chapters[0].quiz[0].explanation = "";
    expect(() => validateCourseData(data as any)).toThrow(/principle|explanation/i);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `cd learn && pnpm test -- lib/course-validate.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

```ts
// learn/lib/course-types.ts
export type CourseQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type CoursePrinciple = {
  title: string;
  summary: string;
  takeaways: string[];
};

export type CourseChapter = {
  id: string;
  title: string;
  summary: string;
  snippetIds: string[];
  principle: CoursePrinciple;
  quiz: CourseQuizQuestion[];
};

export type CourseModule = {
  id: string;
  title: string;
  level: "intro" | "core" | "advanced";
  badge: { id: string; title: string; points: number };
  chapters: CourseChapter[];
};

export type CourseData = {
  modules: CourseModule[];
};
```

```ts
// learn/lib/course-validate.ts
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
      if (!Array.isArray(chapter.principle.takeaways) || chapter.principle.takeaways.length === 0) {
        throw new Error(`chapter ${chapter.id} missing principle takeaways`);
      }
      chapter.quiz.forEach((q) => {
        if (!q.explanation?.trim()) {
          throw new Error(`quiz ${q.id} missing explanation`);
        }
      });
    }
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `cd learn && pnpm test -- lib/course-validate.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add learn/lib/course-types.ts learn/lib/course-validate.ts learn/lib/course-validate.test.ts
git commit -m "Learn: add principles and quiz explanations"
```

---

### Task 3: Rewrite course content with principle-driven questions

**Files:**
- Modify: `learn/lib/course-data.ts`

**Step 1: Update course data**

Replace the module/chapters with the updated principles + quiz explanations. (Full data listed in implementation step during execution to avoid duplication here.)

**Step 2: Run tests**

Run: `cd learn && pnpm test -- lib/course-validate.test.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add learn/lib/course-data.ts
git commit -m "Learn: rewrite quizzes to focus on core principles"
```

---

### Task 4: Rebuild UI into Route Map → Chapter Desk → Progress

**Files:**
- Modify: `learn/components/learn/course-experience.tsx`
- Modify: `learn/components/learn/course-map.tsx`
- Modify: `learn/components/learn/quiz-panel.tsx`
- Modify: `learn/components/learn/code-snippet.tsx`
- Modify: `learn/components/learn/share-panel.tsx`
- Modify: `learn/app/course/page.tsx`
- Modify: `learn/app/globals.css`
- Modify: `learn/scripts/learn-verify.mjs`
- Create: `learn/components/learn/confetti-burst.tsx`

**Step 1: Add a minimal failing test for new progress usage in UI**

```ts
// learn/lib/__tests__/route-smoke.test.ts
import { describe, expect, it } from "vitest";
import { courseData } from "../course-data";

describe("course data exists for UI", () => {
  it("has at least one module and chapter", () => {
    expect(courseData.modules.length).toBeGreaterThan(0);
    expect(courseData.modules[0].chapters.length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run tests to verify they fail (if needed)**

Run: `cd learn && pnpm test -- lib/__tests__/route-smoke.test.ts`
Expected: PASS (no code change required) — proceed to implementation.

**Step 3: Implement UI changes**

- Update `CourseMap` to build a snippet map and pass to `CourseExperience`.
- Update `CourseExperience` to render a 3-column layout, manage active chapter selection, and trigger confetti on correct answers.
- Update `QuizPanel` to show explanations and emit a correct/incorrect result.
- Update `CodeSnippet` to optionally render a “Evidence” label and handle tabs if multiple snippets.
- Add confetti CSS utilities in `globals.css`.
- Update `learn-verify.mjs` to click the new quiz option selector.

**Step 4: Run tests + verification**

Run:
- `cd learn && pnpm test`
- `cd learn && pnpm learn:verify -- --timeout 120000`

Expected: PASS

**Step 5: Commit**

```bash
git add learn/components/learn/course-experience.tsx learn/components/learn/course-map.tsx learn/components/learn/quiz-panel.tsx learn/components/learn/code-snippet.tsx learn/components/learn/share-panel.tsx learn/components/learn/confetti-burst.tsx learn/app/course/page.tsx learn/app/globals.css learn/scripts/learn-verify.mjs learn/lib/__tests__/route-smoke.test.ts
git commit -m "Learn: redesign course layout and add confetti"
```

---

**Plan complete and saved to `docs/plans/2026-02-03-openclaw-course-reflow.md`. Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch a fresh subagent per task, review between tasks
2. **Parallel Session (separate)** - Open a new session with `superpowers:executing-plans`

Which approach?
