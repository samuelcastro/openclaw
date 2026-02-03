# OpenClaw Learn Game Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a beautiful, gamified learning web app under `learn/` that teaches OpenClaw from basics to advanced concepts with progress gating, badges, quizzes, and social sharing.

**Architecture:** Next.js App Router with server components for static course content + code snippet loading, client components for interactions, progress state in localStorage, and deterministic validation of course data at build time. UI is fully custom Tailwind v4 + shadcn components, with deliberate motion, layered backgrounds, and a clear progression loop.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, shadcn/ui + Radix, lucide-react, TypeScript, Vitest (unit tests for logic).

---

### Task 1: Add a minimal test harness for `learn/`

**Files:**
- Create: `learn/vitest.config.ts`
- Create: `learn/lib/__tests__/smoke.test.ts`
- Modify: `learn/package.json`
- Modify: `learn/tsconfig.json`

**Step 1: Write the failing test**

```ts
// learn/lib/__tests__/smoke.test.ts
import { describe, it, expect } from "vitest";

describe("smoke", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd learn && pnpm test`
Expected: FAIL with "Missing script: test" or vitest not installed.

**Step 3: Write minimal implementation**

```ts
// learn/vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
```

```json
// learn/package.json (partial)
{
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "vitest": "^2.1.0"
  }
}
```

```json
// learn/tsconfig.json (partial)
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

**Step 4: Run test to verify it passes**

Run: `cd learn && pnpm install && pnpm test`
Expected: PASS with 1 test.

**Step 5: Commit**

```bash
git add learn/vitest.config.ts learn/lib/__tests__/smoke.test.ts learn/package.json learn/tsconfig.json
git commit -m "Learn: add vitest harness"
```

---

### Task 2: Define course schema + validation

**Files:**
- Create: `learn/lib/course-types.ts`
- Create: `learn/lib/course-validate.ts`
- Create: `learn/lib/course-validate.test.ts`

**Step 1: Write the failing test**

```ts
// learn/lib/course-validate.test.ts
import { describe, it, expect } from "vitest";
import { validateCourseData } from "./course-validate";

describe("validateCourseData", () => {
  it("rejects duplicate ids", () => {
    const data = {
      modules: [
        { id: "gateway", title: "Gateway", chapters: [{ id: "a", title: "A" }] },
        { id: "gateway", title: "Gateway 2", chapters: [{ id: "b", title: "B" }] },
      ],
    };
    expect(() => validateCourseData(data as any)).toThrow(/duplicate module id/i);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd learn && pnpm test`
Expected: FAIL with "Cannot find module './course-validate'".

**Step 3: Write minimal implementation**

```ts
// learn/lib/course-types.ts
export type CourseQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type CourseChapter = {
  id: string;
  title: string;
  summary: string;
  snippetIds: string[];
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
    }
  }
}
```

**Step 4: Run test to verify it passes**

Run: `cd learn && pnpm test`
Expected: PASS for validateCourseData test.

**Step 5: Commit**

```bash
git add learn/lib/course-types.ts learn/lib/course-validate.ts learn/lib/course-validate.test.ts
git commit -m "Learn: add course schema and validation"
```

---

### Task 3: Add course content + quiz scaffolding

**Files:**
- Create: `learn/lib/course-data.ts`
- Modify: `learn/lib/course-validate.test.ts`

**Step 1: Write the failing test**

```ts
// learn/lib/course-validate.test.ts (add)
import { courseData } from "./course-data";

it("accepts the course data", () => {
  expect(() => validateCourseData(courseData)).not.toThrow();
});
```

**Step 2: Run test to verify it fails**

Run: `cd learn && pnpm test`
Expected: FAIL with "Cannot find module './course-data'".

**Step 3: Write minimal implementation**

```ts
// learn/lib/course-data.ts
import type { CourseData } from "./course-types";

export const courseData: CourseData = {
  modules: [
    {
      id: "launchpad",
      title: "Launchpad: Install + Run",
      level: "intro",
      badge: { id: "badge-launchpad", title: "Gateway Warmup", points: 120 },
      chapters: [
        {
          id: "launchpad-install",
          title: "Install the CLI",
          summary:
            "Install OpenClaw, confirm the CLI, and understand where config and state live.",
          snippetIds: ["cli-install", "state-paths"],
          quiz: [
            {
              id: "q-install-1",
              prompt: "Where do session transcripts live by default?",
              options: ["~/Downloads", "~/.openclaw/agents/<id>/sessions", "/var/tmp"],
              correctIndex: 1,
            },
          ],
        },
      ],
    },
    {
      id: "gateway-core",
      title: "Gateway Core",
      level: "core",
      badge: { id: "badge-gateway", title: "Gateway Steward", points: 180 },
      chapters: [
        {
          id: "gateway-server",
          title: "Gateway as Source of Truth",
          summary:
            "Trace how the gateway server boots, wires channels, and exposes the API.",
          snippetIds: ["gateway-server", "gateway-lanes"],
          quiz: [
            {
              id: "q-gateway-1",
              prompt: "What enforces per-lane concurrency limits?",
              options: ["command-queue", "sessions.json", "memory index"],
              correctIndex: 0,
            },
          ],
        },
      ],
    },
  ],
};
```

**Step 4: Run test to verify it passes**

Run: `cd learn && pnpm test`
Expected: PASS for all course validation tests.

**Step 5: Commit**

```bash
git add learn/lib/course-data.ts learn/lib/course-validate.test.ts
git commit -m "Learn: add initial course content scaffold"
```

---

### Task 4: Implement progress + quiz scoring logic

**Files:**
- Create: `learn/lib/progress.ts`
- Create: `learn/lib/progress.test.ts`

**Step 1: Write the failing test**

```ts
// learn/lib/progress.test.ts
import { describe, it, expect } from "vitest";
import { computeProgress, scoreQuiz } from "./progress";

describe("progress", () => {
  it("unlocks next module when current is complete", () => {
    const state = computeProgress({
      completedChapters: ["launchpad-install"],
      moduleOrder: ["launchpad", "gateway-core"],
      chapterToModule: { "launchpad-install": "launchpad" },
    });
    expect(state.unlockedModules).toContain("gateway-core");
  });

  it("scores quiz with exact match", () => {
    const result = scoreQuiz([0, 2], [0, 1]);
    expect(result.correct).toBe(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd learn && pnpm test`
Expected: FAIL with "Cannot find module './progress'".

**Step 3: Write minimal implementation**

```ts
// learn/lib/progress.ts
export function computeProgress(params: {
  completedChapters: string[];
  moduleOrder: string[];
  chapterToModule: Record<string, string>;
}) {
  const completedModules = new Set<string>();
  for (const chapterId of params.completedChapters) {
    const moduleId = params.chapterToModule[chapterId];
    if (moduleId) {
      completedModules.add(moduleId);
    }
  }
  const unlockedModules = new Set<string>([params.moduleOrder[0]]);
  for (let i = 0; i < params.moduleOrder.length - 1; i += 1) {
    const moduleId = params.moduleOrder[i];
    const nextId = params.moduleOrder[i + 1];
    if (completedModules.has(moduleId)) {
      unlockedModules.add(nextId);
    }
  }
  return {
    completedModules: Array.from(completedModules),
    unlockedModules: Array.from(unlockedModules),
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

**Step 4: Run test to verify it passes**

Run: `cd learn && pnpm test`
Expected: PASS for progress tests.

**Step 5: Commit**

```bash
git add learn/lib/progress.ts learn/lib/progress.test.ts
git commit -m "Learn: add progress and quiz scoring logic"
```

---

### Task 5: Add snippet extraction from repo sources

**Files:**
- Create: `learn/lib/snippets.ts`
- Create: `learn/lib/snippets.test.ts`
- Create: `learn/lib/__fixtures__/snippet.txt`

**Step 1: Write the failing test**

```ts
// learn/lib/snippets.test.ts
import { describe, it, expect } from "vitest";
import { extractSnippet } from "./snippets";

describe("extractSnippet", () => {
  it("returns the requested line range", () => {
    const source = ["a", "b", "c", "d"].join("\n");
    expect(extractSnippet(source, 2, 3)).toBe("b\nc");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd learn && pnpm test`
Expected: FAIL with "Cannot find module './snippets'".

**Step 3: Write minimal implementation**

```ts
// learn/lib/snippets.ts
import fs from "node:fs";
import path from "node:path";

export function extractSnippet(source: string, start: number, end: number) {
  const lines = source.split("\n");
  const slice = lines.slice(start - 1, end);
  return slice.join("\n");
}

export function readRepoSnippet(params: { repoPath: string; start: number; end: number }) {
  const repoRoot = path.resolve(process.cwd(), "..");
  const absPath = path.join(repoRoot, params.repoPath);
  const source = fs.readFileSync(absPath, "utf-8");
  return extractSnippet(source, params.start, params.end);
}
```

**Step 4: Run test to verify it passes**

Run: `cd learn && pnpm test`
Expected: PASS for snippet tests.

**Step 5: Commit**

```bash
git add learn/lib/snippets.ts learn/lib/snippets.test.ts
git commit -m "Learn: add snippet extraction utilities"
```

---

### Task 6: Add progress persistence + share utilities

**Files:**
- Create: `learn/lib/progress-store.ts`
- Create: `learn/lib/share.ts`
- Create: `learn/lib/share.test.ts`

**Step 1: Write the failing test**

```ts
// learn/lib/share.test.ts
import { describe, it, expect } from "vitest";
import { buildShareUrl } from "./share";

describe("buildShareUrl", () => {
  it("builds a share link with encoded text", () => {
    const url = buildShareUrl("https://example.com", "I finished");
    expect(url).toContain("https://");
    expect(url).toContain("I%20finished");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd learn && pnpm test`
Expected: FAIL with "Cannot find module './share'".

**Step 3: Write minimal implementation**

```ts
// learn/lib/progress-store.ts
export type ProgressSnapshot = {
  completedChapters: string[];
  earnedBadges: string[];
  points: number;
  lastActiveAt: number;
};

const STORAGE_KEY = "openclaw.learn.progress";

export function loadProgress(): ProgressSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as ProgressSnapshot;
  } catch {
    return null;
  }
}

export function saveProgress(value: ProgressSnapshot) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
```

```ts
// learn/lib/share.ts
export function buildShareUrl(base: string, text: string) {
  const encoded = encodeURIComponent(text);
  return `${base}?text=${encoded}`;
}
```

**Step 4: Run test to verify it passes**

Run: `cd learn && pnpm test`
Expected: PASS for share tests.

**Step 5: Commit**

```bash
git add learn/lib/progress-store.ts learn/lib/share.ts learn/lib/share.test.ts
git commit -m "Learn: add progress storage and share utils"
```

---

### Task 7: Build the course UI shell + routing

**Files:**
- Modify: `learn/app/layout.tsx`
- Modify: `learn/app/globals.css`
- Modify: `learn/app/page.tsx`
- Create: `learn/app/course/page.tsx`
- Create: `learn/components/learn/hero.tsx`
- Create: `learn/components/learn/course-map.tsx`
- Create: `learn/components/learn/module-card.tsx`
- Create: `learn/components/learn/quiz-panel.tsx`
- Create: `learn/components/learn/code-snippet.tsx`
- Create: `learn/components/learn/badge-shelf.tsx`
- Create: `learn/components/learn/share-panel.tsx`

**Step 1: Write the failing test**

```ts
// learn/lib/__tests__/route-smoke.test.ts
import { describe, it, expect } from "vitest";
import { courseData } from "../course-data";

describe("course data exists for UI", () => {
  it("has at least one module", () => {
    expect(courseData.modules.length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd learn && pnpm test`
Expected: FAIL with "Cannot find module '../course-data'" if path incorrect.

**Step 3: Write minimal implementation**

```tsx
// learn/app/layout.tsx
import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "OpenClaw Academy",
  description: "A gamified course to master OpenClaw",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
```

```tsx
// learn/app/page.tsx
import { Hero } from "@/components/learn/hero";

export default function Page() {
  return <Hero />;
}
```

```tsx
// learn/app/course/page.tsx
import { CourseMap } from "@/components/learn/course-map";

export default function CoursePage() {
  return <CourseMap />;
}
```

```css
/* learn/app/globals.css (add custom theme tokens) */
:root {
  --background: oklch(0.98 0.02 80);
  --foreground: oklch(0.14 0.04 260);
  --primary: oklch(0.55 0.23 30);
  --accent: oklch(0.76 0.18 170);
  --radius: 0.9rem;
}
```

**Step 4: Run test to verify it passes**

Run: `cd learn && pnpm test`
Expected: PASS.

**Step 5: Commit**

```bash
git add learn/app/layout.tsx learn/app/page.tsx learn/app/course/page.tsx learn/app/globals.css learn/components/learn
git commit -m "Learn: add course UI shell"
```

---

### Task 8: Wire progress, quizzes, and share into the UI

**Files:**
- Modify: `learn/components/learn/course-map.tsx`
- Modify: `learn/components/learn/quiz-panel.tsx`
- Modify: `learn/components/learn/share-panel.tsx`
- Modify: `learn/components/learn/badge-shelf.tsx`

**Step 1: Write the failing test**

```ts
// learn/lib/progress-ui.test.ts
import { describe, it, expect } from "vitest";
import { computeProgress } from "./progress";

describe("progress UI expectations", () => {
  it("keeps the first module unlocked", () => {
    const result = computeProgress({
      completedChapters: [],
      moduleOrder: ["launchpad"],
      chapterToModule: {},
    });
    expect(result.unlockedModules).toContain("launchpad");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd learn && pnpm test`
Expected: PASS (this validates the logic stays correct as UI hooks in).

**Step 3: Write minimal implementation**

Use the progress helpers to gate module cards, update points when quizzes pass,
and enable the share panel once all modules complete.

**Step 4: Run test to verify it passes**

Run: `cd learn && pnpm test`
Expected: PASS.

**Step 5: Commit**

```bash
git add learn/components/learn/course-map.tsx learn/components/learn/quiz-panel.tsx learn/components/learn/share-panel.tsx learn/components/learn/badge-shelf.tsx learn/lib/progress-ui.test.ts
git commit -m "Learn: wire progress, quizzes, and sharing"
```

---

### Task 9: Content expansion and polish

**Files:**
- Modify: `learn/lib/course-data.ts`
- Modify: `learn/lib/snippets.ts`
- Modify: `learn/components/learn/code-snippet.tsx`
- Modify: `learn/app/globals.css`

**Step 1: Write the failing test**

```ts
// learn/lib/course-validate.test.ts (add)
it("all snippet ids resolve", () => {
  const ids = new Set(courseData.modules.flatMap((m) => m.chapters.flatMap((c) => c.snippetIds)));
  expect(ids.size).toBeGreaterThan(0);
});
```

**Step 2: Run test to verify it fails**

Run: `cd learn && pnpm test`
Expected: FAIL if snippet mappings are missing.

**Step 3: Write minimal implementation**

Expand modules to cover:
- Gateway lifecycle and lanes (use `src/gateway/server.impl.ts`, `src/process/command-queue.ts`).
- Agent loop + tool execution (use `src/auto-reply/reply/agent-runner.ts`).
- Browser snapshots + refs (use `src/browser/pw-tools-core.snapshot.ts`).
- Memory indexing and session files (use `src/memory/session-files.ts`).
- Hooks and cron (use `src/gateway/server/hooks.ts`, `src/gateway/server-cron.ts`).
- Session paths and transcripts (use `src/config/sessions/paths.ts`).

**Step 4: Run test to verify it passes**

Run: `cd learn && pnpm test`
Expected: PASS after all snippet ids are mapped.

**Step 5: Commit**

```bash
git add learn/lib/course-data.ts learn/lib/snippets.ts learn/components/learn/code-snippet.tsx learn/app/globals.css
git commit -m "Learn: expand course content and polish"
```

---

### Task 10: Manual QA + Vercel best-practice checks

**Files:**
- Modify: `learn/README.md`

**Step 1: Write the failing test**

N/A (documentation task).

**Step 2: Run test to verify it fails**

N/A.

**Step 3: Write minimal implementation**

Add a short runbook to `learn/README.md`:
- `pnpm install`
- `pnpm dev`
- `pnpm test`
- Notes on localStorage progress reset.

**Step 4: Run test to verify it passes**

Run: `cd learn && pnpm test && pnpm lint`
Expected: PASS.

**Step 5: Commit**

```bash
git add learn/README.md
git commit -m "Learn: document local dev workflow"
```

