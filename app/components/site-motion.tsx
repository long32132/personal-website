"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SECTION_IDS = ["about", "work", "workflow", "contact"];

export function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion-ready");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const header = document.querySelector<HTMLElement>(".site-header");
    const links = Array.from(
      header?.querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]') ?? [],
    );
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (section): section is HTMLElement => section instanceof HTMLElement,
    );

    let frame = 0;
    const updateChrome = () => {
      frame = 0;
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);

      if (!sections.length || !links.length) return;

      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const mark = window.scrollY + Math.min(window.innerHeight * 0.34, 240);
      let current = "";

      if (nearBottom) {
        current = sections[sections.length - 1]?.id ?? "";
      } else {
        for (const section of sections) {
          if (section.offsetTop <= mark) current = section.id;
        }
      }

      for (const link of links) {
        const active = current !== "" && link.getAttribute("href") === `#${current}`;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateChrome);
    };

    updateChrome();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const cleanups: Array<() => void> = [];
    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (reduced || !("IntersectionObserver" in window)) {
      cards.forEach((card) => card.classList.add("is-revealed"));
    } else if (cards.length) {
      let batch: HTMLElement[] = [];
      let batchFrame = 0;
      const flush = () => {
        batchFrame = 0;
        batch.forEach((card, index) => {
          card.style.setProperty("--reveal-index", String(index));
          card.classList.add("is-revealed");
        });
        batch = [];
      };
      const observer = new IntersectionObserver(
        (entries) => {
          let queued = false;
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            batch.push(entry.target as HTMLElement);
            observer.unobserve(entry.target);
            queued = true;
          }
          if (queued && !batchFrame) batchFrame = window.requestAnimationFrame(flush);
        },
        { threshold: 0, rootMargin: "0px 0px 48px 0px" },
      );
      cards.forEach((card) => observer.observe(card));
      cleanups.push(() => {
        observer.disconnect();
        if (batchFrame) window.cancelAnimationFrame(batchFrame);
      });
    }

    if (!reduced) {
      const tiltCards = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
      for (const card of tiltCards) {
        const media = card.querySelector<HTMLElement>(".tilt-media");
        if (!media) continue;

        const move = (event: PointerEvent) => {
          if (event.pointerType === "touch") return;
          const rect = media.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const clamp = (value: number) => Math.max(-0.5, Math.min(0.5, value));
          const px = clamp((event.clientX - rect.left) / rect.width - 0.5);
          const py = clamp((event.clientY - rect.top) / rect.height - 0.5);
          media.style.setProperty("--tilt-y", `${(px * 11).toFixed(2)}deg`);
          media.style.setProperty("--tilt-x", `${(-py * 8).toFixed(2)}deg`);
          media.style.setProperty("--tilt-scale", "1.04");
        };
        const reset = () => {
          media.style.removeProperty("--tilt-x");
          media.style.removeProperty("--tilt-y");
          media.style.removeProperty("--tilt-scale");
        };

        card.addEventListener("pointermove", move);
        card.addEventListener("pointerleave", reset);
        cleanups.push(() => {
          card.removeEventListener("pointermove", move);
          card.removeEventListener("pointerleave", reset);
        });
      }
    }

    return () => {
      root.classList.remove("motion-ready");
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [pathname]);

  return null;
}
