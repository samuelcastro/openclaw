#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const args = process.argv.slice(2);

const hasFlag = (flag) => args.includes(`--${flag}`);
const getArg = (flag, fallback) => {
  const long = `--${flag}`;
  const match = args.find((arg) => arg.startsWith(`${long}=`));
  if (match) {
    return match.split("=")[1] ?? fallback;
  }
  const index = args.indexOf(long);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  return fallback;
};

if (hasFlag("help")) {
  console.log(`OpenClaw Academy verify CLI

Usage:
  pnpm learn:verify [--port 3000] [--headful] [--skip-dev-server] [--base-url http://localhost:3000]
`);
  process.exit(0);
}

const headful = hasFlag("headful");
const skipDevServer = hasFlag("skip-dev-server") || process.env.LEARN_SKIP_DEV_SERVER === "1";
const baseUrlOverride = getArg("base-url", process.env.LEARN_BASE_URL);
const requestedPort = Number(getArg("port", process.env.LEARN_PORT ?? "3000"));
const timeoutMs = Number(getArg("timeout", process.env.LEARN_TIMEOUT ?? "60000"));
const verbose = hasFlag("verbose");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const learnRoot = path.resolve(__dirname, "..");
const artifactsDir = path.join(learnRoot, ".artifacts");

const checkpoints = [];
const log = (message) => {
  checkpoints.push({ time: new Date().toISOString(), message });
  console.log(message);
};

const runReport = {
  status: "unknown",
  baseUrl: "",
  port: requestedPort,
  checkpoints,
};

async function findAvailablePort(start) {
  for (let port = start; port < start + 20; port += 1) {
    const ok = await new Promise((resolve) => {
      const server = net.createServer();
      server.once("error", () => resolve(false));
      server.listen(port, () => {
        server.close(() => resolve(true));
      });
    });
    if (ok) {
      return port;
    }
  }
  throw new Error(`No available port starting at ${start}`);
}

function devArgsFor(cmd, port) {
  switch (cmd) {
    case "npm":
      return ["run", "dev", "--", "--port", String(port)];
    case "yarn":
      return ["dev", "--port", String(port)];
    case "bun":
      return ["dev", "--port", String(port)];
    case "pnpm":
    default:
      return ["dev", "--port", String(port)];
  }
}

async function startDevServer(port) {
  const candidates = [
    process.env.LEARN_PM,
    "pnpm",
    "npm",
    "bun",
    "yarn",
  ].filter(Boolean);

  for (const cmd of candidates) {
    log(`Starting dev server with ${cmd} on port ${port}...`);
    const child = spawn(cmd, devArgsFor(cmd, port), {
      cwd: learnRoot,
      env: { ...process.env, PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const spawnResult = await new Promise((resolve, reject) => {
      child.once("spawn", () => resolve({ ok: true, child }));
      child.once("error", (err) => reject(err));
    }).catch((err) => ({ ok: false, err }));

    if (spawnResult.ok) {
      if (child.stdout) {
        child.stdout.on("data", (data) => {
          if (verbose) {
            process.stdout.write(data);
          }
        });
      }
      if (child.stderr) {
        child.stderr.on("data", (data) => {
          if (verbose) {
            process.stderr.write(data);
          }
        });
      }
      return { child, cmd };
    }

    if (spawnResult.err && spawnResult.err.code === "ENOENT") {
      log(`Command not found: ${cmd}`);
      continue;
    }

    throw spawnResult.err;
  }

  throw new Error("No package manager found. Install pnpm or set LEARN_PM.");
}

async function waitForReady(baseUrl) {
  log(`Waiting for ${baseUrl}/course to be ready...`);
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${baseUrl}/course`);
      if (res.ok) {
        const body = await res.text();
        if (body.includes("OpenClaw Learning Map")) {
          log("Server is ready.");
          return true;
        }
      }
    } catch {
      // ignore
    }
    await delay(500);
  }
  return false;
}

async function runPlaywrightChecks(baseUrl) {
  log("Launching Playwright...");
  const browser = await chromium.launch({ headless: !headful });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    log("Opening course map...");
    await page.goto(`${baseUrl}/course`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "OpenClaw Learning Map" }).waitFor();

    log("Answering quiz...");
    await page
      .getByRole("button", {
        name: /keep boot deterministic and defer real logic/i,
      })
      .click();
    await page.getByRole("button", { name: "Submit answer" }).click();
    await page.getByText("Correct. Principle captured.").waitFor();

    const pointsText = await page.getByText(/Points:/).first().textContent();
    const points = Number((pointsText ?? "").replace(/\D+/g, ""));
    if (!Number.isFinite(points) || points < 50) {
      throw new Error(`Points did not increment as expected. Points: ${pointsText}`);
    }

    log("Unlocking share panel...");
    await page.evaluate(() => {
      localStorage.setItem(
        "openclaw.learn.progress",
        JSON.stringify({
          completedChapters: [
            "launchpad-install",
            "launchpad-paths",
            "gateway-server",
            "gateway-lanes",
            "agent-runner",
            "embedded-runner",
            "browser-tool",
            "browser-snapshots",
            "memory-session-files",
            "automation-hooks",
          ],
          earnedBadges: [
            "badge-launchpad",
            "badge-gateway",
            "badge-agent",
            "badge-tools",
            "badge-automation",
          ],
          points: 1500,
          lastActiveAt: Date.now(),
        }),
      );
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("link", { name: "Share on X" }).waitFor();
    await page.getByRole("link", { name: "Share on LinkedIn" }).waitFor();

    log("Playwright checks complete.");
  } finally {
    await browser.close();
  }
}

async function writeReport() {
  fs.mkdirSync(artifactsDir, { recursive: true });
  const reportPath = path.join(artifactsDir, "learn-verify.json");
  fs.writeFileSync(reportPath, JSON.stringify(runReport, null, 2));
}

async function main() {
  let devProcess;
  let baseUrl = baseUrlOverride;
  try {
    if (!baseUrl) {
      const port = skipDevServer ? requestedPort : await findAvailablePort(requestedPort);
      runReport.port = port;
      baseUrl = `http://localhost:${port}`;
    }
    runReport.baseUrl = baseUrl;

    if (!skipDevServer && !baseUrlOverride) {
      const dev = await startDevServer(runReport.port);
      devProcess = dev.child;
    }

    const ready = await waitForReady(baseUrl);
    if (!ready) {
      throw new Error("Server did not become ready in time.");
    }

    await runPlaywrightChecks(baseUrl);
    runReport.status = "passed";
    log("Verification PASSED.");
  } catch (err) {
    runReport.status = "failed";
    log(`Verification FAILED: ${String(err)}`);
    try {
      fs.mkdirSync(artifactsDir, { recursive: true });
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
      if (baseUrl) {
        await page.goto(`${baseUrl}/course`, { waitUntil: "domcontentloaded" }).catch(() => {});
      }
      const screenshotPath = path.join(
        artifactsDir,
        `learn-verify-failure-${Date.now()}.png`,
      );
      await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
      await browser.close();
      log(`Saved screenshot to ${screenshotPath}`);
    } catch {
      // ignore
    }
    process.exitCode = 1;
  } finally {
    await writeReport();
    if (devProcess) {
      devProcess.kill("SIGINT");
      await delay(1_000);
      if (!devProcess.killed) {
        devProcess.kill("SIGTERM");
      }
    }
  }
}

main();
