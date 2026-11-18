"use client";

import { useEffect, useRef } from "react";

export function MeadowCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cleanup = () => {};
    let cancelled = false;

    import("./meadow")
      .then(({ mountMeadow }) => {
        if (cancelled || !hostRef.current) return;
        cleanup = mountMeadow(host, {
          reduced,
          onNight(value) {
            document.documentElement.classList.toggle("is-night", value > 0.46);
          },
        });
      })
      .catch((error: unknown) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return <div ref={hostRef} className="meadow-canvas" />;
}
