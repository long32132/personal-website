"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";

const LunarView = dynamic(() => import("./LunarView"), { ssr: false });

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function LunarBackdrop() {
  const [enabled, setEnabled] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    document.body.classList.add("has-lunar");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame =
      !reduce && hasWebGL() ? requestAnimationFrame(() => setEnabled(true)) : 0;
    return () => {
      cancelAnimationFrame(frame);
      document.body.classList.remove("has-lunar");
    };
  }, []);

  return (
    <div className={live ? "lunar-backdrop is-live" : "lunar-backdrop"} aria-hidden="true">
      <picture>
        <source media="(prefers-reduced-motion: reduce)" srcSet="/lunar/poster-final.jpg" />
        <source media="(max-width: 760px)" srcSet="/lunar/poster-mobile.jpg" />
        <img
          className="lunar-poster"
          src="/lunar/poster.jpg"
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      {enabled ? (
        <SceneBoundary onError={() => setLive(false)}>
          <LunarView onReady={() => setLive(true)} onLost={() => setLive(false)} />
        </SceneBoundary>
      ) : null}
    </div>
  );
}
