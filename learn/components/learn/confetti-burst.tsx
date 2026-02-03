"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const CONFETTI_COLORS = [
  "#f97316",
  "#facc15",
  "#34d399",
  "#60a5fa",
  "#f472b6",
];

type ConfettiPiece = {
  id: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  rotation: number;
};

function buildPieces(trigger: number, density: number): ConfettiPiece[] {
  return Array.from({ length: density }, (_, index) => {
    const size = 6 + Math.random() * 8;
    return {
      id: `${trigger}-${index}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.15,
      duration: 0.8 + Math.random() * 0.8,
      size,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      rotation: Math.random() * 360,
    };
  });
}

export function ConfettiBurst({
  trigger,
  density = 24,
  className,
}: {
  trigger: number;
  density?: number;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || trigger === 0) {
      setPieces([]);
      return;
    }
    const next = buildPieces(trigger, density);
    setPieces(next);
    const timeout = window.setTimeout(() => setPieces([]), 1600);
    return () => window.clearTimeout(timeout);
  }, [mounted, trigger, density]);

  if (!mounted || pieces.length === 0) {
    return null;
  }

  return (
    <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-0", className)}>
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.size * 0.55}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            borderRadius: `${piece.size}px`,
            ["--confetti-rot" as string]: `${piece.rotation}deg`,
          }}
        />
      ))}
    </div>
  );
}
