"use client";

import { useEffect, useRef, useState } from "react";

const COLORS = [
  "#c9a227",
  "#e0b83a",
  "#f7f1c8",
  "#f3ebe0",
  "#c43b4a",
  "#9b1d2e",
  "#1a4fbf",
];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  circle: boolean;
};

function spawn(cx: number, cy: number, count: number, speed: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = speed * (0.42 + Math.random() * 0.58);
    const ribbon = Math.random() < 0.35;
    particles.push({
      x: cx + (Math.random() - 0.5) * 36,
      y: cy + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - speed * 0.16,
      w: ribbon ? 5 + Math.random() * 4 : 8 + Math.random() * 8,
      h: ribbon ? 14 + Math.random() * 12 : 4 + Math.random() * 5,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 16,
      color: COLORS[i % COLORS.length],
      circle: !ribbon && Math.random() < 0.2,
    });
  }
  return particles;
}

/** Swaying Smiski placed against the receipt card; the left one is mirrored to face it. */
export function OrderSmiski({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={`order-celebration-smiski order-celebration-smiski--${side}`}
      aria-hidden="true"
    >
      <img
        src="/smiski-horn.png"
        alt=""
        width={500}
        height={500}
        className="order-celebration-smiski-img"
      />
    </div>
  );
}

/** Full-screen confetti burst that clears itself after a couple of seconds. */
export function OrderCelebration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const compact = width < 700;
    const originX = width * 0.5;
    const originY = height * 0.38;
    const pieces = spawn(originX, originY, compact ? 72 : 118, compact ? 620 : 880);
    let secondBurst = false;
    const duration = 2500;
    const start = performance.now();
    let last = start;
    let frame = 0;
    let stopped = false;

    const tick = (now: number) => {
      if (stopped) return;
      const dt = Math.min(0.034, (now - last) / 1000);
      last = now;
      const elapsed = now - start;

      if (!secondBurst && elapsed > 80) {
        pieces.push(
          ...spawn(originX, originY, compact ? 34 : 52, compact ? 460 : 600),
        );
        secondBurst = true;
      }

      ctx.clearRect(0, 0, width, height);
      const fade =
        elapsed > duration - 480 ? Math.max(0, (duration - elapsed) / 480) : 1;

      for (const piece of pieces) {
        piece.vy += 1320 * dt;
        const drag = Math.pow(0.986, dt * 60);
        piece.vx *= drag;
        piece.vy *= drag;
        piece.x += piece.vx * dt;
        piece.y += piece.vy * dt;
        piece.rot += piece.vr * dt;

        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rot);
        ctx.globalAlpha = fade;
        ctx.fillStyle = piece.color;
        if (piece.circle) {
          ctx.beginPath();
          ctx.arc(0, 0, piece.w * 0.36, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const flip = 0.22 + Math.abs(Math.cos(piece.rot)) * 0.78;
          ctx.fillRect((-piece.w * flip) / 2, -piece.h / 2, piece.w * flip, piece.h);
        }
        ctx.restore();
      }

      if (elapsed < duration) {
        frame = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  if (done) return null;

  return (
    <div className="order-celebration" aria-hidden="true">
      <canvas ref={canvasRef} className="order-celebration-canvas" />
    </div>
  );
}
