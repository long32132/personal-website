import { FLAG, smallStarRotation, starPolygon } from "./flag-spec.mjs";

function pointsToPath(points: Array<[number, number]>) {
  return points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ") + " Z";
}

function FlagMark({ x, y, width }: { x: number; y: number; width: number }) {
  const scale = width / FLAG.grid.width;
  const height = width * (FLAG.ratio[1] / FLAG.ratio[0]);
  const stars = [FLAG.large, ...FLAG.small];
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={width} height={height} fill={FLAG.red} />
      {stars.map((star) => {
        const rotation = star === FLAG.large ? 0 : smallStarRotation(star.x, star.y);
        const path = pointsToPath(
          starPolygon(star.x * scale, star.y * scale, star.radius * scale, rotation),
        );
        return <path key={`${star.x}-${star.y}`} d={path} fill={FLAG.yellow} />;
      })}
    </g>
  );
}

export function HeroFallback({ label }: { label?: string }) {
  return (
    <svg
      className="hero-fallback"
      viewBox="0 0 640 420"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <g fill="none" stroke="#14202b" strokeWidth="1.4">
        <circle cx="150" cy="92" r="34" strokeOpacity="0.4" />
        <circle cx="150" cy="92" r="18" strokeOpacity="0.25" />
        <circle cx="520" cy="70" r="22" strokeOpacity="0.35" />
        <circle cx="78" cy="250" r="26" strokeOpacity="0.4" />
        <circle cx="575" cy="300" r="30" strokeOpacity="0.28" />
        <circle cx="430" cy="360" r="16" strokeOpacity="0.35" />

        <rect x="250" y="48" width="78" height="54" fill="#2c343b" stroke="#14202b" />
        <rect x="338" y="52" width="78" height="54" fill="#2c343b" stroke="#14202b" />
        <path d="M250 66h78M250 84h78M269 48v54M289 48v54M308 48v54M338 70h78M338 88h78M358 52v54M378 52v54M398 52v54" stroke="#e6e0d4" strokeOpacity="0.7" />

        <rect x="86" y="168" width="92" height="40" fill="#f4f1ea" />
        <rect x="292" y="150" width="84" height="38" fill="#f4f1ea" />
        <circle cx="214" cy="188" r="28" fill="#f4f1ea" />
        <circle cx="214" cy="188" r="12" />
        <circle cx="214" cy="118" r="32" fill="#f4f1ea" />
        <circle cx="300" cy="230" r="24" fill="#f4f1ea" />
        <path d="M186 188h-14M242 180h50M214 156v-14M250 214l28 8" />

        <circle cx="168" cy="292" r="46" fill="#f3efe6" />
        <circle cx="168" cy="292" r="28" strokeOpacity="0.45" />
        <path d="M146 292h44M168 270v44" />
      </g>
      <line x1="392" y1="292" x2="392" y2="214" stroke="#243038" strokeWidth="2" />
      <circle cx="392" cy="294" r="5" fill="#243038" />
      <FlagMark x={392} y={214} width={132} />
    </svg>
  );
}
