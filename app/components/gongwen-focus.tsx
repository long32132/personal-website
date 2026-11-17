"use client";

import { useEffect } from "react";

export function GongwenFocus() {
  useEffect(() => {
    const frame = document.querySelector<HTMLIFrameElement>(".gongwen-frame iframe");
    if (!frame) return;

    const started = performance.now();
    const stopAutoscroll = () => {
      if (performance.now() - started > 1600) {
        window.removeEventListener("scroll", stopAutoscroll);
        return;
      }
      if (document.activeElement === frame && window.scrollY > 12) {
        frame.blur();
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    };

    window.addEventListener("scroll", stopAutoscroll, { passive: true });
    return () => window.removeEventListener("scroll", stopAutoscroll);
  }, []);

  return null;
}
