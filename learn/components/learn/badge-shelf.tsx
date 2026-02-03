import { Badge } from "@/components/ui/badge";

type BadgeEntry = {
  title: string;
  points: number;
};

export function BadgeShelf({ badges }: { badges: BadgeEntry[] }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-xl shadow-amber-200/30">
      <h3 className="text-lg font-semibold text-foreground">Badges earned</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Collect badges to unlock the next arc.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {badges.length === 0 ? (
          <span className="text-xs text-muted-foreground">
            No badges yet — complete a quiz to earn your first.
          </span>
        ) : (
          badges.map((badge) => (
            <Badge key={badge.title} className="bg-accent/20 text-accent">
              {badge.title} · {badge.points}xp
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
