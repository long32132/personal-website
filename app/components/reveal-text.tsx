import type { CSSProperties } from "react";

const CLINGS = new Set([
  " ",
  "，",
  "。",
  "、",
  "！",
  "？",
  ",",
  ".",
  "!",
  "?",
  "：",
  ":",
  "；",
  ";",
]);

function clusterGlyphs(text: string) {
  const clusters: string[] = [];

  for (const glyph of Array.from(text)) {
    if (CLINGS.has(glyph) && clusters.length > 0) {
      clusters[clusters.length - 1] += glyph;
    } else {
      clusters.push(glyph);
    }
  }

  return clusters;
}

export function RevealChars({
  text,
  start = 0,
}: {
  text: string;
  start?: number;
}) {
  return (
    <span className="reveal-text">
      <span className="reveal-visual" aria-hidden="true">
        {clusterGlyphs(text).map((cluster, index) => (
          <span
            key={`${cluster}-${index}`}
            className="reveal-char"
            style={{ "--char-index": start + index } as CSSProperties}
          >
            {cluster}
          </span>
        ))}
      </span>
      <span className="visually-hidden">{text}</span>
    </span>
  );
}
