"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

export function PlanCard3D() {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 20,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const features = [
    "Precificação ilimitada",
    "Pedidos e clientes",
    "Financeiro completo",
    "Estoque e materiais",
  ];

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className="relative w-80 rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950 via-rose-900/50 to-gray-950 p-8 shadow-2xl"
    >
      {/* Shine overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent" />

      {/* Content */}
      <div style={{ transform: "translateZ(20px)" }}>
        <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-rose-400">
          Plano Pro
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">R$ 19,90</span>
          <span className="text-sm text-rose-300/70">/mês</span>
        </div>
        <p className="mt-3 text-sm text-rose-200/60">
          Acesso completo a todas as funcionalidades
        </p>

        <ul className="mt-6 space-y-2">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-rose-100/80">
              <span className="text-rose-400">✓</span> {f}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
