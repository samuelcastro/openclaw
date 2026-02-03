export function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(252,211,77,0.3),transparent_45%),radial-gradient(circle_at_20%_40%,_rgba(56,189,248,0.25),transparent_50%),radial-gradient(circle_at_80%_20%,_rgba(244,114,182,0.25),transparent_45%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-16">
        <header className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            OpenClaw Academy
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-foreground sm:text-6xl">
            Learn how OpenClaw actually works — through a game you can finish.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            A guided, hands-on course that takes you from Gateway basics to
            advanced tools, memory, and automation. Earn badges, unlock
            chapters, and share your progress.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:translate-y-[-1px]"
              href="/course"
            >
              Start the quest
            </a>
            <a
              className="inline-flex items-center justify-center rounded-full border border-border/80 bg-white/80 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur transition hover:border-primary/50"
              href="/course"
            >
              Preview the map
            </a>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Gateway Control",
              detail: "Understand sessions, lanes, hooks, and channel routing.",
            },
            {
              title: "Agent Loop",
              detail: "See the tool loop, compaction, and failover in action.",
            },
            {
              title: "Operator Mode",
              detail: "Run safely with approvals, memory, and automation.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-border/60 bg-white/80 p-6 shadow-xl shadow-amber-200/30 backdrop-blur"
            >
              <h3 className="text-lg font-semibold text-foreground">
                {card.title}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                {card.detail}
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
