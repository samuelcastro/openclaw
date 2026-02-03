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
