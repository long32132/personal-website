"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { HeroFallback } from "./hero-fallback";

const LunarBaseCanvas = dynamic(() => import("./lunar-base-canvas"), {
  ssr: false,
});

const LABEL = "俯瞰视角的月球基地轮廓，基地一侧立着五星红旗";

function webglAvailable() {
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
  } catch {
    return false;
  }
}

export function HeroScene() {
  const [webgl, setWebgl] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!webglAvailable()) return undefined;
    let cancelled = false;
    const start = () => {
      if (!cancelled) setWebgl(true);
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 1200 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const id = window.setTimeout(start, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  return (
    <figure className="hero-scene">
      <HeroFallback label={ready ? undefined : LABEL} />
      {webgl ? (
        <LunarBaseCanvas
          label={ready ? LABEL : undefined}
          onUnavailable={() => {
            setWebgl(false);
            setReady(false);
          }}
          onReady={() => setReady(true)}
        />
      ) : null}
      <figcaption className="hero-scene-caption">月球基地 · 俯瞰</figcaption>
    </figure>
  );
}
