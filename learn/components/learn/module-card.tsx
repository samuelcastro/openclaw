import { Badge } from "@/components/ui/badge";

export type ModuleCardProps = {
  title: string;
  level: string;
  badgeTitle: string;
  chapterCount: number;
  locked?: boolean;
};

export function ModuleCard({
  title,
  level,
  badgeTitle,
  chapterCount,
  locked,
}: ModuleCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border/70 bg-white/90 p-6 shadow-xl shadow-slate-200/40 transition hover:-translate-y-1">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-amber-300 to-accent opacity-80" />
      <div className="flex items-center justify-between">
        <Badge className="bg-primary/15 text-primary" variant="secondary">
          {level}
        </Badge>
        {locked ? (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Locked
          </span>
        ) : (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Active
          </span>
        )}
      </div>
      <h3 className="mt-4 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {chapterCount} chapters · Badge: {badgeTitle}
      </p>
      <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        Continue
        <span className="transition group-hover:translate-x-1">→</span>
      </div>
      <div className="pointer-events-none absolute -right-10 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
    </div>
  );
}
