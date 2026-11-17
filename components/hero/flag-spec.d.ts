export const FLAG: {
  ratio: readonly [number, number];
  red: string;
  yellow: string;
  grid: { width: number; height: number };
  large: { x: number; y: number; radius: number };
  small: ReadonlyArray<{ x: number; y: number; radius: number }>;
};

export const STAR_INNER_RATIO: number;

export function smallStarRotation(x: number, y: number): number;

export function starPolygon(
  cx: number,
  cy: number,
  outerRadius: number,
  rotation: number,
): Array<[number, number]>;
