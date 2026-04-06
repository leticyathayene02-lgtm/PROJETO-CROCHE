"use client";

import { useEffect, useRef, useCallback } from "react";

interface YarnBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rgb: [number, number, number];
  opacity: number;
  /** Pre-rendered sprite for this ball */
  sprite: HTMLCanvasElement;
}

interface BallpitBackgroundProps {
  className?: string;
  count?: number;
  colors?: [number, number, number][];
  gravity?: number;
  mouseRadius?: number;
}

const DEFAULT_COLORS: [number, number, number][] = [
  [225, 29, 72],
  [244, 63, 94],
  [251, 113, 133],
  [236, 72, 153],
  [219, 39, 119],
  [190, 18, 60],
  [253, 164, 175],
  [167, 139, 250],
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Pre-render a single yarn ball onto an offscreen canvas.
 * This is called ONCE per ball, not every frame.
 */
function createYarnSprite(
  r: number,
  rgb: [number, number, number],
  seed: number,
): HTMLCanvasElement {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = Math.ceil((r + 2) * 2 * dpr);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cx = r + 2;
  const cy = r + 2;
  const [cr, cg, cb] = rgb;
  const rng = seededRandom(seed);

  // 1. Clip
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // 2. Base sphere gradient
  const baseGrad = ctx.createRadialGradient(
    cx - r * 0.35, cy - r * 0.35, r * 0.05,
    cx + r * 0.1, cy + r * 0.1, r * 1.1,
  );
  baseGrad.addColorStop(0, `rgb(${Math.min(cr + 80, 255)}, ${Math.min(cg + 65, 255)}, ${Math.min(cb + 65, 255)})`);
  baseGrad.addColorStop(0.35, `rgb(${Math.min(cr + 30, 255)}, ${Math.min(cg + 20, 255)}, ${Math.min(cb + 20, 255)})`);
  baseGrad.addColorStop(0.6, `rgb(${cr}, ${cg}, ${cb})`);
  baseGrad.addColorStop(0.85, `rgb(${Math.max(cr - 50, 0)}, ${Math.max(cg - 40, 0)}, ${Math.max(cb - 40, 0)})`);
  baseGrad.addColorStop(1, `rgb(${Math.max(cr - 90, 0)}, ${Math.max(cg - 70, 0)}, ${Math.max(cb - 70, 0)})`);

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = baseGrad;
  ctx.fill();

  // 3. Yarn wrap lines (fewer than before — 18-24 is enough for visual)
  const numWraps = 18 + Math.floor(rng() * 6);
  const strandWidth = Math.max(1, r * 0.04);

  for (let i = 0; i < numWraps; i++) {
    const angle = rng() * Math.PI * 2;
    const offset = (rng() - 0.5) * r * 1.6;
    const curvature = 0.7 + rng() * 0.5;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const px = -sinA;
    const py = cosA;

    const lx = cx + px * offset;
    const ly = cy + py * offset;
    const halfLen = Math.sqrt(Math.max(0, r * r - offset * offset)) * curvature;

    const x1 = lx - cosA * halfLen;
    const y1 = ly - sinA * halfLen;
    const x2 = lx + cosA * halfLen;
    const y2 = ly + sinA * halfLen;
    const bulge = (rng() - 0.5) * r * 0.3;
    const cpx = lx + px * bulge;
    const cpy = ly + py * bulge;

    const lightDist = Math.sqrt((lx - cx + r * 0.35) ** 2 + (ly - cy + r * 0.35) ** 2) / r;
    const lightFactor = Math.max(0.3, 1 - lightDist * 0.5);

    // Groove
    ctx.beginPath();
    ctx.moveTo(x1, y1 + 1);
    ctx.quadraticCurveTo(cpx, cpy + 1, x2, y2 + 1);
    ctx.strokeStyle = `rgba(${Math.max(cr - 70, 0)}, ${Math.max(cg - 55, 0)}, ${Math.max(cb - 55, 0)}, ${0.3 * lightFactor})`;
    ctx.lineWidth = strandWidth + 0.8;
    ctx.lineCap = "round";
    ctx.stroke();

    // Strand
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cpx, cpy, x2, y2);
    ctx.strokeStyle = `rgba(${Math.min(cr + 50 * lightFactor, 255)}, ${Math.min(cg + 40 * lightFactor, 255)}, ${Math.min(cb + 40 * lightFactor, 255)}, ${0.25 + 0.2 * lightFactor})`;
    ctx.lineWidth = strandWidth;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  // 4. Band wraps (fewer — 5-7)
  const numBands = 5 + Math.floor(rng() * 3);
  const bandWidth = Math.max(1.5, r * 0.06);

  for (let i = 0; i < numBands; i++) {
    const angle = rng() * Math.PI * 2;
    const offset = (rng() - 0.5) * r * 1.2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const px = -sinA;
    const py = cosA;
    const lx = cx + px * offset;
    const ly = cy + py * offset;
    const halfLen = Math.sqrt(Math.max(0, r * r - offset * offset)) * 0.85;
    const x1 = lx - cosA * halfLen;
    const y1 = ly - sinA * halfLen;
    const x2 = lx + cosA * halfLen;
    const y2 = ly + sinA * halfLen;
    const bulge = (rng() - 0.5) * r * 0.25;
    const cpx = lx + px * bulge;
    const cpy = ly + py * bulge;
    const lightDist = Math.sqrt((lx - cx + r * 0.35) ** 2 + (ly - cy + r * 0.35) ** 2) / r;
    const lightFactor = Math.max(0.3, 1 - lightDist * 0.5);

    ctx.beginPath();
    ctx.moveTo(x1, y1 + 1.2);
    ctx.quadraticCurveTo(cpx, cpy + 1.2, x2, y2 + 1.2);
    ctx.strokeStyle = `rgba(${Math.max(cr - 80, 0)}, ${Math.max(cg - 65, 0)}, ${Math.max(cb - 65, 0)}, ${0.35 * lightFactor})`;
    ctx.lineWidth = bandWidth + 1;
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cpx, cpy, x2, y2);
    ctx.strokeStyle = `rgba(${Math.min(cr + 40 * lightFactor, 255)}, ${Math.min(cg + 30 * lightFactor, 255)}, ${Math.min(cb + 30 * lightFactor, 255)}, ${0.35 + 0.25 * lightFactor})`;
    ctx.lineWidth = bandWidth;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  ctx.restore(); // unclip

  // 5. Specular
  const specGrad = ctx.createRadialGradient(
    cx - r * 0.3, cy - r * 0.3, r * 0.02,
    cx - r * 0.2, cy - r * 0.2, r * 0.5,
  );
  specGrad.addColorStop(0, "rgba(255,255,255,0.3)");
  specGrad.addColorStop(0.5, "rgba(255,255,255,0.08)");
  specGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = specGrad;
  ctx.fill();

  // 6. Edge
  ctx.beginPath();
  ctx.arc(cx, cy, r - 0.5, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${Math.max(cr - 60, 0)}, ${Math.max(cg - 50, 0)}, ${Math.max(cb - 50, 0)}, 0.15)`;
  ctx.lineWidth = 1;
  ctx.stroke();

  return canvas;
}

export function BallpitBackground({
  className = "",
  count,
  colors = DEFAULT_COLORS,
  gravity = 0.08,
  mouseRadius = 140,
}: BallpitBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<YarnBall[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const visibleRef = useRef(true);

  const createBalls = useCallback(
    (canvasW: number, canvasH: number) => {
      const isMobile = canvasW < 640;
      const n = count ?? (isMobile ? 8 : 14);
      const balls: YarnBall[] = [];
      const minR = isMobile ? 22 : 28;
      const maxR = isMobile ? 38 : 50;
      for (let i = 0; i < n; i++) {
        const r = minR + Math.random() * (maxR - minR);
        const rgb = colors[Math.floor(Math.random() * colors.length)];
        const seed = Math.floor(Math.random() * 2147483646) + 1;
        balls.push({
          x: r + Math.random() * (canvasW - 2 * r),
          y: r + Math.random() * (canvasH - 2 * r),
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          r,
          rgb,
          opacity: 0.6 + Math.random() * 0.35,
          sprite: createYarnSprite(r, rgb, seed),
        });
      }
      return balls;
    },
    [count, colors],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    // Pause when not visible (huge perf win — stops the second instance entirely when off-screen)
    const visObserver = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting; },
      { threshold: 0 },
    );
    visObserver.observe(canvas);

    function resize() {
      if (!canvas || !parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ballsRef.current = createBalls(rect.width, rect.height);
    }

    resize();

    resizeObserverRef.current = new ResizeObserver(resize);
    resizeObserverRef.current.observe(parent);

    function handleMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function handleMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999 };
    }
    function handleTouchMove(e: TouchEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      mouseRef.current = { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleMouseLeave);

    function animate() {
      rafRef.current = requestAnimationFrame(animate);

      // Skip rendering when off-screen
      if (!visibleRef.current || !canvas || !ctx) return;

      const w = parseFloat(canvas.style.width);
      const h = parseFloat(canvas.style.height);
      ctx.clearRect(0, 0, w, h);

      const balls = ballsRef.current;
      const mouse = mouseRef.current;
      const damping = 0.992;
      const bounce = 0.65;

      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];

        b.vy += gravity;

        // Mouse repulsion
        const dx = b.x - mouse.x;
        const dy = b.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRadius + b.r && dist > 0) {
          const force = ((mouseRadius + b.r - dist) / (mouseRadius + b.r)) * 0.7;
          b.vx += (dx / dist) * force;
          b.vy += (dy / dist) * force;
        }

        // Collisions
        for (let j = i + 1; j < balls.length; j++) {
          const o = balls[j];
          const cx = b.x - o.x;
          const cy = b.y - o.y;
          const d = Math.sqrt(cx * cx + cy * cy);
          const minDist = b.r + o.r;
          if (d < minDist && d > 0) {
            const overlap = (minDist - d) * 0.3;
            const nx = cx / d;
            const ny = cy / d;
            b.x += nx * overlap;
            b.y += ny * overlap;
            o.x -= nx * overlap;
            o.y -= ny * overlap;
            const relV = (b.vx - o.vx) * nx + (b.vy - o.vy) * ny;
            if (relV > 0) {
              b.vx -= nx * relV * 0.4;
              b.vy -= ny * relV * 0.4;
              o.vx += nx * relV * 0.4;
              o.vy += ny * relV * 0.4;
            }
          }
        }

        b.vx *= damping;
        b.vy *= damping;

        const maxV = 6;
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (speed > maxV) {
          b.vx = (b.vx / speed) * maxV;
          b.vy = (b.vy / speed) * maxV;
        }

        b.x += b.vx;
        b.y += b.vy;

        // Walls
        if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx) * bounce; }
        if (b.x + b.r > w) { b.x = w - b.r; b.vx = -Math.abs(b.vx) * bounce; }
        if (b.y - b.r < 0) { b.y = b.r; b.vy = Math.abs(b.vy) * bounce; }
        if (b.y + b.r > h) { b.y = h - b.r; b.vy = -Math.abs(b.vy) * bounce; }

        // Draw pre-rendered sprite — ONE drawImage call per ball instead of ~90 strokes
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const spriteW = b.sprite.width / dpr;
        const spriteH = b.sprite.height / dpr;
        ctx.globalAlpha = b.opacity;
        ctx.drawImage(b.sprite, b.x - spriteW / 2, b.y - spriteH / 2, spriteW, spriteH);
        ctx.globalAlpha = 1;
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserverRef.current?.disconnect();
      visObserver.disconnect();
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleMouseLeave);
    };
  }, [createBalls, gravity, mouseRadius]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-auto absolute inset-0 ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
