import type { CoursePrinciple } from "@/lib/course-types";

export function PrincipleCard({ principle }: { principle: CoursePrinciple }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-xl shadow-amber-200/30">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
        Core principle
      </p>
      <h3 className="mt-3 text-lg font-semibold text-foreground">
        {principle.title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {principle.summary}
      </p>
      <ul className="mt-4 space-y-2 text-sm text-foreground">
        {principle.takeaways.map((takeaway) => (
          <li key={takeaway} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
            <span>{takeaway}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
