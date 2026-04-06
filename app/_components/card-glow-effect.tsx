"use client";

import { useEffect } from "react";

/**
 * Adds a reactive rose/violet glow behind all cards on the page.
 * Targets: .landing-card and .group\/card elements.
 * Works with mouse (desktop) and touch (mobile).
 * Mount once in the layout or page — no per-card wiring needed.
 */
export function CardGlowEffect() {
  useEffect(() => {
    const SELECTOR = ".landing-card, .group\\/card";
    const GLOW_ATTR = "data-glow-initialized";

    function initCard(card: HTMLElement) {
      if (card.getAttribute(GLOW_ATTR)) return;
      card.setAttribute(GLOW_ATTR, "1");

      // Ensure card can be a positioning parent
      const pos = getComputedStyle(card).position;
      if (pos === "static") card.style.position = "relative";

      // Create the glow element behind the card
      const glow = document.createElement("div");
      glow.setAttribute("aria-hidden", "true");
      Object.assign(glow.style, {
        position: "absolute",
        inset: "-1px",
        borderRadius: getComputedStyle(card).borderRadius || "1.5rem",
        pointerEvents: "none",
        zIndex: "-1",
        opacity: "0",
        transition: "opacity 0.4s ease",
        background:
          "radial-gradient(400px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(244,63,94,0.18), rgba(139,92,246,0.12), transparent 70%)",
      });

      // Insert glow as first child (behind content)
      card.insertBefore(glow, card.firstChild);

      function updateGlow(clientX: number, clientY: number) {
        const rect = card.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        glow.style.setProperty("--glow-x", `${x}px`);
        glow.style.setProperty("--glow-y", `${y}px`);
        glow.style.opacity = "1";
      }

      function hideGlow() {
        glow.style.opacity = "0";
      }

      // Mouse events
      card.addEventListener("mouseenter", (e: MouseEvent) => updateGlow(e.clientX, e.clientY));
      card.addEventListener("mousemove", (e: MouseEvent) => updateGlow(e.clientX, e.clientY));
      card.addEventListener("mouseleave", hideGlow);

      // Touch events — passive so they don't block scroll
      card.addEventListener(
        "touchstart",
        (e: TouchEvent) => {
          const t = e.touches[0];
          updateGlow(t.clientX, t.clientY);
        },
        { passive: true },
      );
      card.addEventListener(
        "touchmove",
        (e: TouchEvent) => {
          const t = e.touches[0];
          updateGlow(t.clientX, t.clientY);
        },
        { passive: true },
      );
      card.addEventListener("touchend", () => {
        // Fade out after a short delay so the glow doesn't vanish instantly
        setTimeout(hideGlow, 150);
      });
    }

    // Init all existing cards
    document.querySelectorAll<HTMLElement>(SELECTOR).forEach(initCard);

    // Watch for dynamically added cards
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches(SELECTOR)) initCard(node);
          node.querySelectorAll?.<HTMLElement>(SELECTOR).forEach(initCard);
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
