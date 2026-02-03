"use client";

import { useEffect, useMemo, useState } from "react";
import type { CourseChapter, CourseModule } from "@/lib/course-types";
import { computeProgress } from "@/lib/progress";
import { loadProgress, saveProgress, type ProgressSnapshot } from "@/lib/progress-store";
import { BadgeShelf } from "@/components/learn/badge-shelf";
import { CodeSnippet } from "@/components/learn/code-snippet";
import { ConfettiBurst } from "@/components/learn/confetti-burst";
import { PrincipleCard } from "@/components/learn/principle-card";
import { QuizPanel } from "@/components/learn/quiz-panel";
import { SharePanel } from "@/components/learn/share-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const emptyProgress: ProgressSnapshot = {
  completedChapters: [],
  earnedBadges: [],
  points: 0,
  lastActiveAt: Date.now(),
};

export type SnippetEntry = {
  title: string;
  repoPath: string;
  language: string;
  code: string;
};

type ChapterIndexEntry = {
  module: CourseModule;
  chapter: CourseChapter;
  moduleIndex: number;
  chapterIndex: number;
};

export function CourseExperience({
  modules,
  snippetMap,
}: {
  modules: CourseModule[];
  snippetMap: Record<string, SnippetEntry>;
}) {
  const [progress, setProgress] = useState<ProgressSnapshot>(emptyProgress);
  const [hydrated, setHydrated] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);
  const [confettiPulse, setConfettiPulse] = useState(0);
  const [modulePulse, setModulePulse] = useState(0);

  useEffect(() => {
    const stored = loadProgress();
    if (stored) {
      setProgress(stored);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    saveProgress(progress);
  }, [hydrated, progress]);

  const chapterIndex = useMemo(() => {
    const map: Record<string, ChapterIndexEntry> = {};
    modules.forEach((module, moduleIndex) => {
      module.chapters.forEach((chapter, chapterIndex) => {
        map[chapter.id] = { module, chapter, moduleIndex, chapterIndex };
      });
    });
    return map;
  }, [modules]);

  const progressState = computeProgress({
    modules,
    completedChapters: progress.completedChapters,
  });
  const unlockedModules = new Set(progressState.unlockedModules);
  const unlockedChapters = new Set(progressState.unlockedChapters);
  const completedModules = new Set(progressState.completedModules);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!activeChapterId || !unlockedChapters.has(activeChapterId)) {
      const next =
        progressState.nextChapterId ?? modules[0]?.chapters[0]?.id ?? null;
      setActiveChapterId(next);
    }
  }, [hydrated, activeChapterId, progressState.nextChapterId, unlockedChapters, modules]);

  useEffect(() => {
    if (!activeChapterId) {
      return;
    }
    const chapter = chapterIndex[activeChapterId]?.chapter;
    if (chapter?.snippetIds?.length) {
      setActiveSnippetId(chapter.snippetIds[0]);
    }
  }, [activeChapterId, chapterIndex]);

  useEffect(() => {
    if (!lockedNotice) {
      return;
    }
    const timer = window.setTimeout(() => setLockedNotice(null), 2800);
    return () => window.clearTimeout(timer);
  }, [lockedNotice]);

  const activeEntry = activeChapterId ? chapterIndex[activeChapterId] : undefined;
  const activeModule = activeEntry?.module ?? modules[0];
  const activeChapter = activeEntry?.chapter ?? modules[0]?.chapters[0];
  const snippetIds = activeChapter?.snippetIds ?? [];
  const selectedSnippetId =
    activeSnippetId && snippetIds.includes(activeSnippetId)
      ? activeSnippetId
      : snippetIds[0];
  const snippet = selectedSnippetId ? snippetMap[selectedSnippetId] : undefined;

  const earnedBadges = modules
    .filter((module) => progress.earnedBadges.includes(module.badge.id))
    .map((module) => ({ title: module.badge.title, points: module.badge.points }));
  const allModulesComplete = modules.every((module) =>
    module.chapters.every((chapter) => progress.completedChapters.includes(chapter.id)),
  );

  const handleChapterSelect = (chapterId: string) => {
    if (!unlockedChapters.has(chapterId)) {
      const entry = chapterIndex[chapterId];
      if (entry) {
        if (!unlockedModules.has(entry.module.id)) {
          const prev = modules[entry.moduleIndex - 1];
          setLockedNotice(
            `Finish ${prev?.title ?? "the previous module"} to unlock this arc.`,
          );
        } else if (entry.chapterIndex > 0) {
          const prevChapter = entry.module.chapters[entry.chapterIndex - 1];
          setLockedNotice(`Complete ${prevChapter.title} to unlock this step.`);
        }
      }
      return;
    }
    setLockedNotice(null);
    setActiveChapterId(chapterId);
  };

  const handleQuizComplete = ({ isCorrect }: { isCorrect: boolean }) => {
    if (!isCorrect || !activeChapter || !activeModule) {
      return;
    }
    if (progress.completedChapters.includes(activeChapter.id)) {
      return;
    }
    const updatedChapters = [...progress.completedChapters, activeChapter.id];
    const moduleComplete = activeModule.chapters.every((chapter) =>
      updatedChapters.includes(chapter.id),
    );

    setProgress((prev) => {
      if (prev.completedChapters.includes(activeChapter.id)) {
        return prev;
      }
      const completedChapters = [...prev.completedChapters, activeChapter.id];
      const earnedBadges = moduleComplete
        ? prev.earnedBadges.includes(activeModule.badge.id)
          ? prev.earnedBadges
          : [...prev.earnedBadges, activeModule.badge.id]
        : prev.earnedBadges;
      const bonus = moduleComplete ? activeModule.badge.points : 50;
      return {
        ...prev,
        completedChapters,
        earnedBadges,
        points: prev.points + bonus,
        lastActiveAt: Date.now(),
      };
    });

    setConfettiPulse((value) => value + 1);
    if (moduleComplete) {
      setModulePulse((value) => value + 1);
    }

    const next = computeProgress({
      modules,
      completedChapters: updatedChapters,
    }).nextChapterId;
    if (next) {
      setActiveChapterId(next);
    }
  };

  if (!activeChapter || !activeModule) {
    return null;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 mask-fade" />
      <ConfettiBurst trigger={confettiPulse} className="left-12 right-12" />
      <ConfettiBurst trigger={modulePulse} density={48} className="left-0 right-0" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Mission Control
          </p>
          <h1 className="text-3xl font-semibold text-foreground sm:text-5xl">
            OpenClaw Learning Map
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Work through each module to unlock the next. Each chapter pairs live
            code evidence with a principle and a quick quiz.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[260px,1fr,320px]">
          <aside className="relative z-0 space-y-4 lg:sticky lg:top-10 lg:self-start">
            <div className="rounded-3xl border border-border/70 bg-white/90 p-5 shadow-xl shadow-slate-200/40">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Route map
              </p>
              <div className="mt-4 space-y-4">
                {modules.map((module) => {
                  const moduleLocked = !unlockedModules.has(module.id);
                  return (
                    <div
                      key={module.id}
                      className={cn(
                        "rounded-2xl border border-border/60 bg-white/80 p-4",
                        moduleLocked && "opacity-60",
                      )}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em]">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                          {module.level}
                        </span>
                        <span
                          className={cn(
                            completedModules.has(module.id)
                              ? "text-emerald-600"
                              : moduleLocked
                                ? "text-muted-foreground"
                                : "text-amber-600",
                          )}
                        >
                          {completedModules.has(module.id)
                            ? "complete"
                            : moduleLocked
                              ? "locked"
                              : "active"}
                        </span>
                      </div>
                      <h3 className="mt-3 text-sm font-semibold text-foreground">
                        {module.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Badge: {module.badge.title}
                      </p>
                      <div className="mt-3 space-y-2">
                        {module.chapters.map((chapter) => {
                          const chapterLocked = !unlockedChapters.has(chapter.id);
                          const chapterComplete = progress.completedChapters.includes(
                            chapter.id,
                          );
                          const isActive = chapter.id === activeChapterId;
                          return (
                            <button
                              key={chapter.id}
                              type="button"
                              className={cn(
                                "flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-xs font-medium transition",
                                isActive
                                  ? "border-primary/60 bg-primary/10"
                                  : "border-border/60 bg-white",
                                chapterLocked && "cursor-not-allowed opacity-60",
                              )}
                              onClick={() => handleChapterSelect(chapter.id)}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "h-2 w-2 rounded-full",
                                    chapterComplete
                                      ? "bg-emerald-500"
                                      : chapterLocked
                                        ? "bg-muted-foreground/60"
                                        : "bg-amber-500",
                                  )}
                                />
                                {chapter.title}
                              </span>
                              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                {chapterComplete
                                  ? "done"
                                  : chapterLocked
                                    ? "lock"
                                    : "go"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              {lockedNotice ? (
                <p className="mt-4 rounded-2xl border border-amber-200/70 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {lockedNotice}
                </p>
              ) : null}
            </div>
          </aside>

          <section className="relative z-10 space-y-6">
            <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-xl shadow-amber-200/30">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                How this course works
              </p>
              <h2 className="mt-3 text-xl font-semibold text-foreground">
                Evidence, principle, action
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Each chapter shows a live code excerpt, explains the architectural
                principle it proves, and checks understanding with a quick quiz.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <span className="rounded-full border border-border/60 bg-white px-3 py-1">
                  1. Read the evidence
                </span>
                <span className="rounded-full border border-border/60 bg-white px-3 py-1">
                  2. Capture the principle
                </span>
                <span className="rounded-full border border-border/60 bg-white px-3 py-1">
                  3. Pass the quiz
                </span>
              </div>
              {progressState.nextChapterId ? (
                <Button
                  className="mt-5"
                  onClick={() => handleChapterSelect(progressState.nextChapterId)}
                >
                  Start next chapter
                </Button>
              ) : null}
            </div>

            <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-xl shadow-slate-200/40">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Chapter desk
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-foreground">
                {activeChapter.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {activeChapter.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em]">
                <span className="rounded-full border border-border/60 bg-white px-3 py-1 text-muted-foreground">
                  Module: {activeModule.title}
                </span>
                <span className="rounded-full border border-border/60 bg-white px-3 py-1 text-muted-foreground">
                  Points: {progress.points}
                </span>
                <span className="rounded-full border border-border/60 bg-white px-3 py-1 text-muted-foreground">
                  Badges: {progress.earnedBadges.length}
                </span>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
              <div className="space-y-4">
                {snippetIds.length > 1 ? (
                  <div className="flex flex-wrap gap-2">
                    {snippetIds.map((id) => (
                      <button
                        key={id}
                        type="button"
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-semibold transition",
                          id === selectedSnippetId
                            ? "border-primary/60 bg-primary/10 text-primary"
                            : "border-border/60 bg-white text-muted-foreground hover:border-primary/40",
                        )}
                        onClick={() => setActiveSnippetId(id)}
                      >
                        {snippetMap[id]?.title ?? id}
                      </button>
                    ))}
                  </div>
                ) : null}
                {snippet ? (
                  <CodeSnippet
                    title={snippet.title}
                    fileHint={snippet.repoPath}
                    language={snippet.language}
                    code={snippet.code}
                    caption="Code evidence from the OpenClaw repo."
                  />
                ) : (
                  <div className="rounded-3xl border border-border/70 bg-white/90 p-6 text-sm text-muted-foreground">
                    Code snippet unavailable for this chapter.
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <PrincipleCard principle={activeChapter.principle} />
                <QuizPanel
                  question={activeChapter.quiz[0]}
                  onComplete={({ isCorrect }) => handleQuizComplete({ isCorrect })}
                />
              </div>
            </div>
          </section>

          <aside className="relative z-10 space-y-6 lg:sticky lg:top-10 lg:self-start">
            <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-xl shadow-amber-200/30">
              <h3 className="text-lg font-semibold text-foreground">Flight status</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Track progress and see what unlocks next.
              </p>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-white px-4 py-3">
                  <span className="text-muted-foreground">Total points</span>
                  <span className="font-semibold text-foreground">{progress.points}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-white px-4 py-3">
                  <span className="text-muted-foreground">Badges earned</span>
                  <span className="font-semibold text-foreground">
                    {progress.earnedBadges.length}/{modules.length}
                  </span>
                </div>
                <div className="rounded-2xl border border-border/60 bg-white px-4 py-3 text-xs text-muted-foreground">
                  Next up: {progressState.nextChapterId
                    ? chapterIndex[progressState.nextChapterId]?.chapter.title
                    : "All chapters complete"}
                </div>
              </div>
            </div>
            <BadgeShelf badges={earnedBadges} />
            <SharePanel
              enabled={allModulesComplete}
              message={`I just finished the OpenClaw Academy course — earned ${
                progress.earnedBadges.length
              } badges.`}
              shareUrl="https://openclaw.ai"
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
