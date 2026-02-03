import { Badge } from "@/components/ui/badge";

export type CodeSnippetProps = {
  title: string;
  language?: string;
  fileHint?: string;
  code: string;
  caption?: string;
};

export function CodeSnippet({
  title,
  language = "ts",
  fileHint,
  code,
  caption,
}: CodeSnippetProps) {
  return (
    <div className="rounded-3xl border border-border/70 bg-slate-950/95 p-6 text-slate-100 shadow-2xl shadow-slate-900/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">
            {title}
          </h4>
          {fileHint ? (
            <p className="mt-2 text-xs text-slate-400">{fileHint}</p>
          ) : null}
        </div>
        <Badge className="bg-slate-800 text-slate-200" variant="secondary">
          {language}
        </Badge>
      </div>
      <pre className="mt-5 max-h-72 overflow-auto rounded-2xl bg-black/40 p-4 text-xs leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
      {caption ? (
        <p className="mt-3 text-xs text-slate-400">{caption}</p>
      ) : null}
    </div>
  );
}
