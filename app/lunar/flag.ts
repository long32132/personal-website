/**
 * 五星红旗, 《国旗制法说明》: 30×20 grid, hoist at the left, y measured from the top.
 * Large star diameter is 3/10 of the height; each small star is 1/10.
 * One point of each small star aims at the centre of the large star.
 */

const RED: [number, number, number] = [0xde, 0x29, 0x10];
const GOLD: [number, number, number] = [0xff, 0xde, 0x00];

const BIG = { x: 5, y: 5, r: 3 };
const SMALL = [
  { x: 10, y: 2, r: 1 },
  { x: 12, y: 4, r: 1 },
  { x: 12, y: 7, r: 1 },
  { x: 10, y: 9, r: 1 },
];

function starPolygon(
  cx: number,
  cy: number,
  outer: number,
  rotation: number,
): Array<[number, number]> {
  const inner = outer * 0.381966;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = rotation + (i * Math.PI) / 5;
    pts.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  return pts;
}

function inside(x: number, y: number, poly: ReadonlyArray<readonly [number, number]>) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const crosses = yi > y !== yj > y;
    if (crosses && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function coverage(x: number, y: number, poly: ReadonlyArray<readonly [number, number]>) {
  let count = 0;
  if (inside(x + 0.25, y + 0.25, poly)) count += 1;
  if (inside(x + 0.75, y + 0.25, poly)) count += 1;
  if (inside(x + 0.25, y + 0.75, poly)) count += 1;
  if (inside(x + 0.75, y + 0.75, poly)) count += 1;
  return count / 4;
}

export function rasterFlag(width = 960, height = 640) {
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = RED[0];
    data[i + 1] = RED[1];
    data[i + 2] = RED[2];
    data[i + 3] = 255;
  }

  const unit = height / 20;
  const stars = [
    starPolygon(BIG.x * unit, BIG.y * unit, BIG.r * unit, -Math.PI / 2),
    ...SMALL.map((star) => {
      const rotation = Math.atan2(BIG.y - star.y, BIG.x - star.x);
      return starPolygon(star.x * unit, star.y * unit, star.r * unit, rotation);
    }),
  ];

  for (const poly of stars) {
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    for (const [x, y] of poly) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    const x0 = Math.max(0, Math.floor(minX - 1));
    const y0 = Math.max(0, Math.floor(minY - 1));
    const x1 = Math.min(width - 1, Math.ceil(maxX + 1));
    const y1 = Math.min(height - 1, Math.ceil(maxY + 1));
    for (let y = y0; y <= y1; y += 1) {
      for (let x = x0; x <= x1; x += 1) {
        const cover = coverage(x, y, poly);
        if (cover <= 0) continue;
        const i = (y * width + x) * 4;
        data[i] = RED[0] + (GOLD[0] - RED[0]) * cover;
        data[i + 1] = RED[1] + (GOLD[1] - RED[1]) * cover;
        data[i + 2] = RED[2] + (GOLD[2] - RED[2]) * cover;
      }
    }
  }

  return { data, width, height };
}
