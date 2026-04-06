"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";

interface TestimonialCardSwapProps {
  cards: ReactNode[];
  /** Auto-swap interval in ms (default 4000) */
  interval?: number;
}

export function TestimonialCardSwap({
  cards,
  interval = 4000,
}: TestimonialCardSwapProps) {
  const [active, setActive] = useState(0);
  const total = cards.length;

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % total);
  }, [total]);

  useEffect(() => {
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [next, interval]);

  function getPosition(index: number): number {
    return (index - active + total) % total;
  }

  return (
    <div className="relative mx-auto w-full max-w-sm sm:max-w-md">
      {/* Card stack — responsive height and perspective */}
      <div
        className="relative"
        style={{
          minHeight: "clamp(240px, 40vw, 300px)",
          perspective: "1000px",
        }}
      >
        {cards.map((card, i) => {
          const pos = getPosition(i);
          const visible = pos < 3;

          // Smaller offsets for clean mobile stacking
          const translateY = pos * -12;
          const translateX = pos * 8;
          const scale = 1 - pos * 0.05;
          const opacity = pos === 0 ? 1 : pos === 1 ? 0.65 : 0.35;
          const blur = pos === 0 ? 0 : pos === 1 ? 0.5 : 1.5;
          const rotateY = pos * -1.5;

          return (
            <div
              key={i}
              className="absolute inset-0 w-full transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                zIndex: visible ? 30 - pos * 10 : 0,
                opacity: visible ? opacity : 0,
                transform: visible
                  ? `translateY(${translateY}px) translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`
                  : `translateY(40px) scale(0.85) rotateY(-6deg)`,
                filter: `blur(${blur}px)`,
                pointerEvents: pos === 0 ? "auto" : "none",
              }}
            >
              {card}
            </div>
          );
        })}
      </div>

      {/* Dot indicators — inside flow, not absolute */}
      <div className="mt-6 flex justify-center gap-2">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Depoimento ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === active
                ? "w-6 bg-rose-500 dark:bg-rose-400"
                : "w-2 bg-rose-300/40 hover:bg-rose-300 dark:bg-rose-700/40 dark:hover:bg-rose-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
