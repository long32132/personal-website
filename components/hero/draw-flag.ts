import { FLAG, smallStarRotation, starPolygon } from "./flag-spec.mjs";

type Star = { x: number; y: number; radius: number };

function fillStar(
  ctx: CanvasRenderingContext2D,
  star: Star,
  rotation: number,
  scale: number,
) {
  const points = starPolygon(star.x * scale, star.y * scale, star.radius * scale, rotation);
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
}

/** Draw the obverse of the flag into a canvas whose aspect ratio is 3:2. */
export function drawFlag(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const scale = width / FLAG.grid.width;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = FLAG.red;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = FLAG.yellow;
  fillStar(ctx, FLAG.large, 0, scale);
  for (const star of FLAG.small) {
    fillStar(ctx, star, smallStarRotation(star.x, star.y), scale);
  }
}
