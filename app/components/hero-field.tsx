"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  phase: number;
  speed: number;
  size: number;
};

type Dot = {
  x: number;
  y: number;
};

const GAP = 28;

function unit(index: number) {
  const value = Math.sin(index * 127.1 + 9.2) * 43758.5453;
  return value - Math.floor(value);
}

export function HeroField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.closest(".hero");
    if (!canvas || !(hero instanceof HTMLElement)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const colors = {
      dot: "#14202b",
      hot: "#d8613c",
      star: "#14202b",
    };
    const pointer = { x: -9999, y: -9999, power: 0, target: 0 };
    let width = 0;
    let height = 0;
    let dots: Dot[] = [];
    let stars: Star[] = [];
    let frame = 0;
    let running = true;
    let onScreen = true;
    let lastDraw = 0;

    const readColors = () => {
      const styles = getComputedStyle(document.documentElement);
      colors.dot = styles.getPropertyValue("--grid-dot").trim() || colors.dot;
      colors.hot = styles.getPropertyValue("--grid-hot").trim() || colors.hot;
      colors.star = styles.getPropertyValue("--star").trim() || colors.star;
    };

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, width < 760 ? 1.5 : 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      dots = [];
      for (let y = -GAP; y <= height + GAP; y += GAP) {
        for (let x = -GAP; x <= width + GAP; x += GAP) {
          dots.push({ x, y });
        }
      }

      stars = Array.from({ length: 8 }, (_, index) => ({
        x: width * (0.06 + unit(index + 1) * 0.88),
        y: height * (0.08 + unit(index + 19) * 0.78),
        phase: unit(index + 4) * Math.PI * 2,
        speed: 0.00055 + unit(index + 8) * 0.0007,
        size: unit(index + 3) > 0.72 ? 1.7 : 1.15,
      }));
    };

    const draw = (now: number) => {
      if (!running) return;
      frame = window.requestAnimationFrame(draw);
      if (!onScreen || document.visibilityState === "hidden") return;

      const interacting = pointer.target > 0 || pointer.power > 0.015;
      const minDelta = interacting || !finePointer ? 16 : 100;
      if (now - lastDraw < minDelta) return;
      lastDraw = now;

      if (!hero.classList.contains("has-field")) hero.classList.add("has-field");

      context.clearRect(0, 0, width, height);
      const driftX = finePointer ? 0 : Math.sin(now * 0.00011) * 12;
      const driftY = finePointer ? 0 : Math.cos(now * 0.00009) * 8;
      const originX = ((driftX % GAP) + GAP) % GAP;
      const originY = ((driftY % GAP) + GAP) % GAP;
      pointer.power += (pointer.target - pointer.power) * (pointer.target > pointer.power ? 0.14 : 0.055);

      for (const dot of dots) {
        let px = dot.x + originX;
        let py = dot.y + originY;
        const dx = px - pointer.x;
        const dy = py - pointer.y;
        const dist = Math.hypot(dx, dy) || 1;
        const influence = pointer.power * Math.exp(-(dist * dist) / (2 * 150 * 150));
        const ripple =
          pointer.power * Math.sin(dist * 0.045 - now * 0.0026) * Math.exp(-dist / 210);

        if (influence > 0.02) {
          px += (dx / dist) * ripple * 3.4;
          py += (dy / dist) * ripple * 3.4;
        }

        const hot = influence > 0.38;
        context.fillStyle = hot ? colors.hot : colors.dot;
        context.globalAlpha = 0.22 + influence * 0.72 + Math.max(0, ripple) * 0.14;
        const size = hot ? 3.6 : 1.7;
        context.fillRect(px, py, size, size);
      }

      for (const star of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(now * star.speed + star.phase);
        context.globalAlpha = 0.04 + twinkle * 0.1;
        context.fillStyle = colors.star;
        context.fillRect(star.x + driftX * 0.2, star.y + driftY * 0.2, star.size, star.size);
      }

      context.globalAlpha = 1;
    };

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = hero.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.target = 1;
    };

    const onLeave = () => {
      pointer.target = 0;
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") lastDraw = 0;
    };

    const colorQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true;
      if (onScreen) lastDraw = 0;
    });

    readColors();
    layout();
    observer.observe(hero);
    frame = window.requestAnimationFrame(draw);
    colorQuery.addEventListener("change", readColors);
    hero.addEventListener("pointermove", onPointer);
    hero.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    const resizeObserver = new ResizeObserver(() => {
      layout();
      lastDraw = 0;
    });
    resizeObserver.observe(hero);

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      hero.classList.remove("has-field");
      colorQuery.removeEventListener("change", readColors);
      hero.removeEventListener("pointermove", onPointer);
      hero.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-field" aria-hidden="true" />;
}
