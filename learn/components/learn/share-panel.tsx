import { Button } from "@/components/ui/button";
import { buildShareUrl } from "@/lib/share";

export function SharePanel({
  enabled,
  message,
  shareUrl,
}: {
  enabled: boolean;
  message: string;
  shareUrl: string;
}) {
  const xUrl = buildShareUrl("https://x.com/intent/tweet", message);
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl,
  )}`;

  return (
    <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-xl shadow-amber-200/30">
      <h3 className="text-lg font-semibold text-foreground">
        Share your climb
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Post your badge unlocks and invite collaborators.
      </p>
      <div className="mt-5 grid gap-3">
        {enabled ? (
          <Button asChild variant="default">
            <a href={xUrl} target="_blank" rel="noreferrer">
              Share on X
            </a>
          </Button>
        ) : (
          <Button disabled variant="default">
            Share on X
          </Button>
        )}
        {enabled ? (
          <Button asChild variant="secondary">
            <a href={linkedInUrl} target="_blank" rel="noreferrer">
              Share on LinkedIn
            </a>
          </Button>
        ) : (
          <Button disabled variant="secondary">
            Share on LinkedIn
          </Button>
        )}
      </div>
      {!enabled ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Finish all modules to unlock sharing.
        </p>
      ) : null}
    </div>
  );
}
