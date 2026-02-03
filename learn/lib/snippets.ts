import fs from "node:fs";
import path from "node:path";

export type SnippetSpec = {
  id: string;
  title: string;
  repoPath: string;
  start: number;
  end: number;
  language: "ts" | "js" | "mjs";
};

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

const SNIPPET_INDEX: Record<string, SnippetSpec> = {
  "cli-entry": {
    id: "cli-entry",
    title: "CLI entrypoint",
    repoPath: "openclaw.mjs",
    start: 1,
    end: 14,
    language: "mjs",
  },
  "session-paths": {
    id: "session-paths",
    title: "Session transcript paths",
    repoPath: "src/config/sessions/paths.ts",
    start: 7,
    end: 59,
    language: "ts",
  },
  "gateway-server": {
    id: "gateway-server",
    title: "Gateway bootstrap",
    repoPath: "src/gateway/server.impl.ts",
    start: 147,
    end: 220,
    language: "ts",
  },
  "gateway-lanes": {
    id: "gateway-lanes",
    title: "Lane concurrency",
    repoPath: "src/gateway/server-lanes.ts",
    start: 1,
    end: 12,
    language: "ts",
  },
  "agent-runner": {
    id: "agent-runner",
    title: "Agent loop entry",
    repoPath: "src/auto-reply/reply/agent-runner.ts",
    start: 45,
    end: 120,
    language: "ts",
  },
  "embedded-runner": {
    id: "embedded-runner",
    title: "Embedded runner lanes",
    repoPath: "src/agents/pi-embedded-runner/run.ts",
    start: 30,
    end: 120,
    language: "ts",
  },
  "browser-tool": {
    id: "browser-tool",
    title: "Browser tool contract",
    repoPath: "src/agents/tools/browser-tool.ts",
    start: 220,
    end: 241,
    language: "ts",
  },
  "browser-snapshot": {
    id: "browser-snapshot",
    title: "Snapshot via Playwright",
    repoPath: "src/browser/pw-tools-core.snapshot.ts",
    start: 40,
    end: 81,
    language: "ts",
  },
  "memory-session-files": {
    id: "memory-session-files",
    title: "Session file extraction",
    repoPath: "src/memory/session-files.ts",
    start: 18,
    end: 110,
    language: "ts",
  },
  "gateway-cron": {
    id: "gateway-cron",
    title: "Gateway cron service",
    repoPath: "src/gateway/server-cron.ts",
    start: 22,
    end: 77,
    language: "ts",
  },
  "gateway-hooks": {
    id: "gateway-hooks",
    title: "Gateway hooks handler",
    repoPath: "src/gateway/server/hooks.ts",
    start: 15,
    end: 83,
    language: "ts",
  },
};

export function hasSnippet(id: string) {
  return Boolean(SNIPPET_INDEX[id]);
}

export function getSnippet(id: string) {
  const spec = SNIPPET_INDEX[id];
  if (!spec) {
    throw new Error(`Unknown snippet id: ${id}`);
  }
  return {
    ...spec,
    code: readRepoSnippet({
      repoPath: spec.repoPath,
      start: spec.start,
      end: spec.end,
    }),
  };
}

export function listSnippetSpecs() {
  return Object.values(SNIPPET_INDEX);
}
