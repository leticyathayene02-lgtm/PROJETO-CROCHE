"use client";

import { useEffect, useState, type ReactNode } from "react";

interface HeroCardCarouselProps {
  cards: ReactNode[];
  /** Interval in ms between swaps (default 5000) */
  interval?: number;
}

export function HeroCardCarousel({
  cards,
  interval = 5000,
}: HeroCardCarouselProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % cards.length);
    }, interval);
    return () => clearInterval(timer);
  }, [cards.length, interval]);

  return (
    <div className="relative mx-auto w-full max-w-[22rem] sm:max-w-sm">
      {/* Glow behind cards */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-rose-300/35 via-pink-300/25 to-violet-300/20 blur-[60px] dark:from-rose-700/15 dark:via-pink-700/10 dark:to-violet-700/10"
      />

      {/* Card layers — responsive minHeight */}
      <div className="relative" style={{ minHeight: "clamp(320px, 50vw, 400px)" }}>
        {cards.map((card, i) => {
          const isFront = i === active;
          return (
            <div
              key={i}
              className="absolute inset-0 transition-all duration-700 ease-in-out"
              style={{
                zIndex: isFront ? 20 : 10,
                opacity: isFront ? 1 : 0.6,
                transform: isFront
                  ? "translateY(0) scale(1)"
                  : "translateY(-16px) translateX(12px) scale(0.93)",
                filter: isFront ? "none" : "blur(1px)",
                pointerEvents: isFront ? "auto" : "none",
              }}
            >
              {card}
            </div>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div className="mt-4 flex justify-center gap-2">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Ver card ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === active
                ? "w-6 bg-rose-500 dark:bg-rose-400"
                : "w-2 bg-rose-300/50 hover:bg-rose-300 dark:bg-rose-700/50 dark:hover:bg-rose-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
