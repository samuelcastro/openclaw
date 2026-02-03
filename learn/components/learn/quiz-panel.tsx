"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export type QuizQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export function QuizPanel({
  question,
  onComplete,
}: {
  question: QuizQuestion;
  onComplete: (params: { correct: number; total: number; isCorrect: boolean }) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = selected === question.correctIndex;

  return (
    <div className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-xl shadow-amber-200/30">
      <h3 className="text-lg font-semibold text-foreground">Quick quiz</h3>
      <p className="mt-2 text-sm text-muted-foreground">{question.prompt}</p>
      <div className="mt-4 grid gap-3">
        {question.options.map((option, index) => (
          <button
            key={option}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
              selected === index
                ? "border-primary/70 bg-primary/5 text-foreground"
                : "border-border/60 bg-white text-foreground hover:border-primary/50"
            }`}
            type="button"
            onClick={() => {
              setSelected(index);
              setSubmitted(false);
            }}
          >
            {option}
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {selected === index ? "selected" : "select"}
            </span>
          </button>
        ))}
      </div>
      <Button
        className="mt-5 w-full"
        onClick={() => {
          if (selected === null) {
            return;
          }
          setSubmitted(true);
          onComplete({ correct: isCorrect ? 1 : 0, total: 1, isCorrect });
        }}
      >
        Submit answer
      </Button>
      {submitted ? (
        <div className="mt-4 rounded-2xl border border-border/60 bg-white/80 p-4 text-sm">
          <p className={isCorrect ? "font-semibold text-emerald-600" : "font-semibold text-amber-600"}>
            {isCorrect ? "Correct. Principle captured." : "Not yet. Revisit the principle."}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{question.explanation}</p>
        </div>
      ) : null}
    </div>
  );
}
