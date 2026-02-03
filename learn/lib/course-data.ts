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
          summary: "Meet the CLI entrypoint and how OpenClaw boots.",
          snippetIds: ["cli-entry"],
          principle: {
            title: "Single entrypoint, predictable boot",
            summary:
              "The CLI entrypoint stays tiny so startup is deterministic and compiled code loads fast.",
            takeaways: [
              "Keep boot logic minimal and stable.",
              "Enable Node compile cache when available.",
              "Load the compiled runtime as the source of truth.",
            ],
          },
          quiz: [
            {
              id: "q-install-1",
              prompt:
                "Why does the CLI entrypoint only enable compile cache and then import dist/entry.js?",
              options: [
                "To keep boot deterministic and defer real logic to compiled code",
                "To force skills to run before config loads",
                "To avoid loading the Node module system",
              ],
              correctIndex: 0,
              explanation:
                "The entrypoint is intentionally tiny: it enables Node cache if possible, then hands off to the compiled runtime so startup is predictable.",
            },
          ],
        },
        {
          id: "launchpad-paths",
          title: "Session storage paths",
          summary: "Understand where session transcripts and metadata live.",
          snippetIds: ["session-paths"],
          principle: {
            title: "Sessions are agent scoped and JSONL",
            summary:
              "Transcripts are stored under the agent id, using JSONL for append-only durability.",
            takeaways: [
              "Agent id becomes part of the path.",
              "Each session transcript is a JSONL file.",
              "Store paths expand safely from templates.",
            ],
          },
          quiz: [
            {
              id: "q-paths-1",
              prompt:
                "What guarantees transcripts are isolated per agent in the default layout?",
              options: [
                "Paths resolve to ~/.openclaw/agents/<agentId>/sessions",
                "Transcripts are stored in a single global SQLite file",
                "Each channel gets a fixed hard-coded directory",
              ],
              correctIndex: 0,
              explanation:
                "Paths are derived from the normalized agent id, keeping transcripts under agents/<agentId>/sessions as JSONL files.",
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
          title: "Gateway bootstrap",
          summary: "Trace gateway startup, config validation, and plugin auto-enable.",
          snippetIds: ["gateway-server"],
          principle: {
            title: "Fail fast before state becomes mutable",
            summary:
              "Gateway startup validates and migrates config, then auto-enables plugins before serving requests.",
            takeaways: [
              "Invalid config blocks startup.",
              "Auto-enable changes are persisted for consistency.",
              "Plugins load after a stable runtime config exists.",
            ],
          },
          quiz: [
            {
              id: "q-gateway-1",
              prompt:
                "Why does the gateway refuse to start on invalid config rather than booting anyway?",
              options: [
                "To prevent unsafe or inconsistent runtime state",
                "To allow tools to auto-fix configuration",
                "To keep the UI responsive during validation",
              ],
              correctIndex: 0,
              explanation:
                "Failing fast keeps the gateway from running with unknown state and points you to openclaw doctor for repair.",
            },
          ],
        },
        {
          id: "gateway-lanes",
          title: "Lane concurrency",
          summary: "See how the gateway applies per-lane concurrency settings.",
          snippetIds: ["gateway-lanes"],
          principle: {
            title: "Lanes isolate workloads",
            summary:
              "Cron, main, and subagent lanes have separate concurrency limits to avoid collisions.",
            takeaways: [
              "Main lane protects interactive chat.",
              "Cron lane throttles scheduled work.",
              "Subagent lane caps parallel subagents.",
            ],
          },
          quiz: [
            {
              id: "q-lanes-1",
              prompt:
                "What is the practical benefit of keeping cron runs in their own lane?",
              options: [
                "Scheduled work cannot starve live chat interactions",
                "Cron jobs get unlimited concurrency",
                "Cron jobs bypass config validation",
              ],
              correctIndex: 0,
              explanation:
                "Cron uses its own lane so scheduled runs do not block or overwhelm interactive runs in the main lane.",
            },
          ],
        },
      ],
    },
    {
      id: "agent-loop",
      title: "Agent Loop",
      level: "core",
      badge: { id: "badge-agent", title: "Loop Operator", points: 200 },
      chapters: [
        {
          id: "agent-runner",
          title: "runReplyAgent",
          summary: "Follow the core agent loop parameters and flow control.",
          snippetIds: ["agent-runner"],
          principle: {
            title: "Reply routing is channel aware",
            summary:
              "The agent loop computes reply routing from session context to avoid sending responses to the wrong surface.",
            takeaways: [
              "Reply mode is resolved per channel.",
              "Streaming toggles are explicit flags.",
              "Tool output emission is scoped by session context.",
            ],
          },
          quiz: [
            {
              id: "q-agent-1",
              prompt:
                "Why does runReplyAgent resolve replyToMode using channel and session context?",
              options: [
                "To ensure replies follow each channel's delivery rules",
                "To increase model context window size",
                "To skip tool execution on some channels",
              ],
              correctIndex: 0,
              explanation:
                "Reply routing is channel aware so messages end up in the correct place and respect each channel's rules.",
            },
          ],
        },
        {
          id: "embedded-runner",
          title: "Embedded lanes",
          summary: "Learn how the embedded runner uses session + global lanes.",
          snippetIds: ["embedded-runner"],
          principle: {
            title: "Two-tier queues prevent collisions",
            summary:
              "Embedded runs enqueue into a session lane and a global lane to serialize per-session work while capping global concurrency.",
            takeaways: [
              "Session lane prevents two runs in the same session.",
              "Global lane limits total concurrent runs.",
              "Both lanes apply to embedded agents.",
            ],
          },
          quiz: [
            {
              id: "q-embedded-1",
              prompt:
                "Why does the embedded runner enqueue a session lane inside the global lane?",
              options: [
                "To serialize per-session work while respecting global concurrency",
                "To increase memory for each request",
                "To bypass queue limits for subagents",
              ],
              correctIndex: 0,
              explanation:
                "The double-queue structure prevents session collisions and still caps total concurrent work.",
            },
          ],
        },
      ],
    },
    {
      id: "tools-browser",
      title: "Tools + Browser",
      level: "core",
      badge: { id: "badge-tools", title: "Toolsmith", points: 220 },
      chapters: [
        {
          id: "browser-tool",
          title: "Browser tool contract",
          summary: "Understand the browser tool capabilities and constraints.",
          snippetIds: ["browser-tool"],
          principle: {
            title: "Tool access is policy gated",
            summary:
              "Browser control respects sandbox/host policy and chooses stable refs when requested.",
            takeaways: [
              "Host control can be blocked by policy.",
              "Chrome relay defaults to host if attached.",
              "ARIA refs are the most stable for repeat calls.",
            ],
          },
          quiz: [
            {
              id: "q-browser-1",
              prompt:
                "Which snapshot ref type is most stable across calls and why?",
              options: [
                "ARIA refs because they map to accessibility nodes",
                "Role refs because they are always pixel-perfect",
                "Pixels because screenshots never change",
              ],
              correctIndex: 0,
              explanation:
                "ARIA refs are stored by accessibility node, which is far more stable across calls than pixel or role-only maps.",
            },
          ],
        },
        {
          id: "browser-snapshots",
          title: "Snapshot formats",
          summary: "See how OpenClaw builds AI snapshots and registers refs.",
          snippetIds: ["browser-snapshot"],
          principle: {
            title: "Snapshots trade size for reliability",
            summary:
              "Playwright AI snapshots are truncated safely and generate ref maps for action targeting.",
            takeaways: [
              "Large pages are truncated with a marker.",
              "ARIA refs are stored for the target id.",
              "Snapshot and ref map travel together.",
            ],
          },
          quiz: [
            {
              id: "q-browser-2",
              prompt: "What happens when a snapshot exceeds the max character limit?",
              options: [
                "It is truncated and marked as truncated",
                "It is cached and retried later",
                "It errors and stops the run",
              ],
              correctIndex: 0,
              explanation:
                "Snapshots are truncated with a clear marker so the agent can still act on a consistent view.",
            },
          ],
        },
      ],
    },
    {
      id: "memory-automation",
      title: "Memory + Automation",
      level: "advanced",
      badge: { id: "badge-automation", title: "Runtime Architect", points: 260 },
      chapters: [
        {
          id: "memory-session-files",
          title: "Session file extraction",
          summary: "Learn how sessions are summarized into memory entries.",
          snippetIds: ["memory-session-files"],
          principle: {
            title: "Memory is curated, not raw",
            summary:
              "Session memory is built from user and assistant messages, ignoring tool chatter.",
            takeaways: [
              "Only message records are scanned.",
              "Roles are filtered to user and assistant.",
              "Text is normalized for indexing.",
            ],
          },
          quiz: [
            {
              id: "q-memory-1",
              prompt:
                "Which roles are included when extracting session text for memory?",
              options: ["user + assistant", "system only", "tool only"],
              correctIndex: 0,
              explanation:
                "Memory extraction filters to user and assistant message roles to preserve conversational context.",
            },
          ],
        },
        {
          id: "automation-hooks",
          title: "Cron + hooks",
          summary: "Trigger runs via cron jobs or inbound hooks.",
          snippetIds: ["gateway-cron", "gateway-hooks"],
          principle: {
            title: "Automation runs are isolated",
            summary:
              "Cron and hook runs use isolated sessions to keep automation separate from live chats.",
            takeaways: [
              "Cron jobs run in the cron lane.",
              "Hook jobs create isolated sessions.",
              "Summaries are reported back to main session.",
            ],
          },
          quiz: [
            {
              id: "q-hooks-1",
              prompt: "What session target is used for hook-driven runs?",
              options: ["isolated", "global", "none"],
              correctIndex: 0,
              explanation:
                "Hooks create isolated sessions so automated runs do not collide with the main chat session.",
            },
          ],
        },
      ],
    },
  ],
};
