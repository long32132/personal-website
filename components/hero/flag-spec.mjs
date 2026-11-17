/**
 * Construction sheet for the flag of the People's Republic of China.
 *
 * Source: 《国旗制法说明》, published 28 September 1949 by the presidium of
 * the first plenary session of the Chinese People's Political Consultative
 * Conference, and incorporated by the National Flag Law.
 *
 * The field is 3:2. The upper hoist quarter is divided into 15 by 10 equal
 * cells, so the full field is a 30 by 20 grid. The origin is the top-left
 * corner; x grows toward the fly and y grows downward.
 *
 * The large star's circumdiameter is 3/10 of the flag height (radius 3).
 * Each small star's circumdiameter is 1/10 of the flag height (radius 1).
 * One point of the large star faces straight up. One point of each small
 * star lies on the line from its center to the large star's center.
 *
 * Red and yellow are the conventional sRGB values used for the national
 * standard flag colors (#DE2910, #FFDE00).
 */

export const FLAG = {
  ratio: [3, 2],
  red: "#DE2910",
  yellow: "#FFDE00",
  grid: { width: 30, height: 20 },
  large: { x: 5, y: 5, radius: 3 },
  small: [
    { x: 10, y: 2, radius: 1 },
    { x: 12, y: 4, radius: 1 },
    { x: 12, y: 7, radius: 1 },
    { x: 10, y: 9, radius: 1 },
  ],
};

/** Inner radius / outer radius of a regular five-pointed star. */
export const STAR_INNER_RATIO =
  Math.cos((72 * Math.PI) / 180) / Math.cos((36 * Math.PI) / 180);

/**
 * Rotation, in radians, that aims one outer point at the large star.
 * @param {number} x
 * @param {number} y
 */
export function smallStarRotation(x, y) {
  return Math.atan2(FLAG.large.y - y, FLAG.large.x - x) + Math.PI / 2;
}

/**
 * Ten vertices of a star. Rotation 0 puts an outer point straight up.
 * @param {number} cx
 * @param {number} cy
 * @param {number} outerRadius
 * @param {number} rotation
 * @returns {Array<[number, number]>}
 */
export function starPolygon(cx, cy, outerRadius, rotation) {
  /** @type {Array<[number, number]>} */
  const points = [];
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outerRadius : outerRadius * STAR_INNER_RATIO;
    const angle = rotation + (i * Math.PI) / 5 - Math.PI / 2;
    points.push([
      cx + Math.cos(angle) * radius,
      cy + Math.sin(angle) * radius,
    ]);
  }
  return points;
}
