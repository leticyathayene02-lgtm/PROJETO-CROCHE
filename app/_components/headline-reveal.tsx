"use client";

import { useEffect, useRef, useState } from "react";

interface WordDef {
  text: string;
  className?: string;
  tag?: "em" | "span";
}

interface HeadlineRevealProps {
  words: WordDef[];
  className?: string;
  as?: "h1" | "h2" | "h3";
  startDelay?: number;
  stagger?: number;
}

export function HeadlineReveal({
  words,
  className = "",
  as: Heading = "h1",
  startDelay = 300,
  stagger = 35,
}: HeadlineRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Flatten all characters across all words into a single array
  // so we can compute a single global stagger index.
  const chars: { char: string; wordIndex: number; isSpace: boolean }[] = [];
  for (let wi = 0; wi < words.length; wi++) {
    const letters = words[wi].text.split("");
    for (const ch of letters) {
      chars.push({ char: ch, wordIndex: wi, isSpace: false });
    }
    // Add space between words (not after the last word)
    if (wi < words.length - 1) {
      chars.push({ char: "\u00A0", wordIndex: wi, isSpace: true });
    }
  }

  // Group chars back into word-chunks for nowrap rendering.
  // Each chunk = all chars of a word + trailing space (if any).
  type Chunk = { wordIndex: number; items: { char: string; globalIdx: number; isSpace: boolean }[] };
  const chunks: Chunk[] = [];
  let gi = 0;
  for (let wi = 0; wi < words.length; wi++) {
    const chunk: Chunk = { wordIndex: wi, items: [] };
    const letters = words[wi].text.split("");
    for (const ch of letters) {
      chunk.items.push({ char: ch, globalIdx: gi++, isSpace: false });
    }
    chunks.push(chunk);
    // Space goes into its own tiny chunk so line can break there
    if (wi < words.length - 1) {
      chunks.push({
        wordIndex: wi,
        items: [{ char: "\u00A0", globalIdx: gi++, isSpace: true }],
      });
    }
  }

  return (
    <Heading ref={ref} className={className}>
      {chunks.map((chunk, ci) => {
        const w = words[chunk.wordIndex];
        const isSpaceChunk = chunk.items.length === 1 && chunk.items[0].isSpace;
        const Tag = w.tag === "em" ? "em" : "span";

        // Space chunks are inline (allow line break here)
        if (isSpaceChunk) {
          const item = chunk.items[0];
          const delay = startDelay + item.globalIdx * stagger;
          return (
            <span key={ci} className="inline-block overflow-hidden align-bottom">
              <span
                className="inline-block"
                style={{
                  transform: visible ? "translateY(0)" : "translateY(115%)",
                  transitionProperty: "transform",
                  transitionDuration: "1000ms",
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  transitionDelay: `${delay}ms`,
                }}
              >
                {"\u00A0"}
              </span>
            </span>
          );
        }

        // Word chunk — nowrap so letters stay together
        return (
          <span key={ci} className="inline-flex whitespace-nowrap">
            {chunk.items.map((item) => {
              const delay = startDelay + item.globalIdx * stagger;
              // Apply the word's className directly on the innermost span
              // that holds the character. This is critical for bg-clip-text
              // to work — the gradient background + text-transparent must be
              // on the same element that contains the text node.
              return (
                <span
                  key={item.globalIdx}
                  className="inline-block overflow-hidden align-bottom"
                >
                  <Tag
                    className={`inline-block ${w.className ?? ""}`}
                    style={{
                      transform: visible ? "translateY(0)" : "translateY(115%)",
                      transitionProperty: "transform",
                      transitionDuration: "1000ms",
                      transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                      transitionDelay: `${delay}ms`,
                    }}
                  >
                    {item.char}
                  </Tag>
                </span>
              );
            })}
          </span>
        );
      })}
    </Heading>
  );
}
