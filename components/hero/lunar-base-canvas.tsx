"use client";

import { useEffect, useRef } from "react";
import { createLunarScene, type LunarScene } from "./create-lunar-scene";

const COMPACT_QUERY = "(max-width: 760px)";
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function pixelRatioCap(compact: boolean) {
  const cap = compact ? 1.25 : 1.5;
  return Math.min(window.devicePixelRatio || 1, cap);
}

export default function LunarBaseCanvas({
  label,
  onUnavailable,
  onReady,
}: {
  label?: string;
  onUnavailable: () => void;
  onReady: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const unavailableRef = useRef(onUnavailable);
  const readyRef = useRef(onReady);

  useEffect(() => {
    unavailableRef.current = onUnavailable;
    readyRef.current = onReady;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const compactQuery = window.matchMedia(COMPACT_QUERY);
    const motionQuery = window.matchMedia(MOTION_QUERY);
    let lunar: LunarScene | null = null;
    let frame = 0;
    let disposed = false;
    let visible = true;
    let pageVisible = !document.hidden;
    let reduced = motionQuery.matches;

    const syncLoop = () => {
      lunar?.setRunning(visible && pageVisible && !reduced);
    };

    const resize = () => {
      if (!lunar) return;
      const compact = compactQuery.matches;
      lunar.setCompact(compact);
      lunar.resize(host.clientWidth, host.clientHeight, pixelRatioCap(compact));
    };

    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncLoop();
      },
      { threshold: 0.08 },
    );
    visibility.observe(host);

    const onPageVisibility = () => {
      pageVisible = !document.hidden;
      syncLoop();
    };
    document.addEventListener("visibilitychange", onPageVisibility);

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(host);

    const onCompact = () => resize();
    compactQuery.addEventListener("change", onCompact);

    const onMotion = () => {
      reduced = motionQuery.matches;
      lunar?.setReducedMotion(reduced);
      syncLoop();
    };
    motionQuery.addEventListener("change", onMotion);

    const onLost = (event: Event) => {
      event.preventDefault();
      if (!disposed) unavailableRef.current();
    };
    canvas.addEventListener("webglcontextlost", onLost);

    // Wait a frame so React strict mode can cancel this setup before a
    // context is created and immediately lost.
    frame = window.requestAnimationFrame(() => {
      if (disposed) return;
      try {
        lunar = createLunarScene(canvas, {
          compact: compactQuery.matches,
          reducedMotion: motionQuery.matches,
        });
      } catch {
        unavailableRef.current();
        return;
      }
      resize();
      canvas.classList.add("is-ready");
      readyRef.current();
      syncLoop();
    });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      visibility.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onPageVisibility);
      compactQuery.removeEventListener("change", onCompact);
      motionQuery.removeEventListener("change", onMotion);
      canvas.removeEventListener("webglcontextlost", onLost);
      lunar?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
