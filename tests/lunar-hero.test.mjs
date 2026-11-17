import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import {
  FLAG,
  STAR_INNER_RATIO,
  smallStarRotation,
  starPolygon,
} from "../components/hero/flag-spec.mjs";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const scene = await readFile(
  new URL("../components/hero/hero-scene.tsx", import.meta.url),
  "utf8",
);
const canvas = await readFile(
  new URL("../components/hero/lunar-base-canvas.tsx", import.meta.url),
  "utf8",
);
const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("draws the national flag on the official 30 by 20 grid", () => {
  assert.deepEqual(FLAG.ratio, [3, 2]);
  assert.equal(FLAG.grid.width / FLAG.grid.height, 3 / 2);
  assert.equal(FLAG.red, "#DE2910");
  assert.equal(FLAG.yellow, "#FFDE00");
  assert.deepEqual(FLAG.large, { x: 5, y: 5, radius: 3 });
  assert.deepEqual(
    FLAG.small.map((star) => [star.x, star.y, star.radius]),
    [
      [10, 2, 1],
      [12, 4, 1],
      [12, 7, 1],
      [10, 9, 1],
    ],
  );

  assert.equal(FLAG.large.radius * 2, FLAG.grid.height * 0.3);
  for (const star of FLAG.small) {
    assert.equal(star.radius * 2, FLAG.grid.height * 0.1);
    assert.ok(star.x < 15 && star.y < 10, "small stars stay in the upper hoist");
  }
});

test("aims each small star at the large star and points the large star upward", () => {
  const [upX, upY] = starPolygon(FLAG.large.x, FLAG.large.y, FLAG.large.radius, 0)[0];
  assert.ok(Math.abs(upX - FLAG.large.x) < 1e-9);
  assert.ok(upY < FLAG.large.y);

  const ratio = STAR_INNER_RATIO;
  assert.ok(Math.abs(ratio - Math.cos((72 * Math.PI) / 180) / Math.cos((36 * Math.PI) / 180)) < 1e-12);

  for (const star of FLAG.small) {
    const rotation = smallStarRotation(star.x, star.y);
    const [tipX, tipY] = starPolygon(star.x, star.y, star.radius, rotation)[0];
    const toward = [FLAG.large.x - star.x, FLAG.large.y - star.y];
    const point = [tipX - star.x, tipY - star.y];
    const dot = point[0] * toward[0] + point[1] * toward[1];
    const magnitude = Math.hypot(...point) * Math.hypot(...toward);
    assert.ok(dot / magnitude > 0.999);
  }
});

test("mounts the lunar scene without blocking the hero text", () => {
  assert.match(page, /<HeroScene \/>/);
  assert.match(page, /className="hero-name"/);
  assert.match(scene, /ssr:\s*false/);
  assert.match(scene, /requestIdleCallback/);
  assert.match(scene, /俯瞰视角的月球基地轮廓，基地一侧立着五星红旗/);
  assert.match(canvas, /prefers-reduced-motion/);
  assert.match(canvas, /visibilitychange/);
  assert.match(canvas, /IntersectionObserver/);
  assert.match(canvas, /devicePixelRatio/);
  assert.match(canvas, /aria-hidden/);
  assert.match(styles, /\.hero-scene\s*\{/);
  assert.doesNotMatch(canvas, /tabIndex|tabindex/);
});

test("keeps the lunar scene procedural", async () => {
  const sceneSource = await readFile(
    new URL("../components/hero/create-lunar-scene.ts", import.meta.url),
    "utf8",
  );
  assert.match(sceneSource, /from "three"/);
  assert.doesNotMatch(sceneSource, /\.(glb|gltf|fbx|obj)/i);

  for (const asset of [
    "components/hero/base.glb",
    "public/media/lunar-base.glb",
    "public/models/flag.glb",
  ]) {
    await assert.rejects(access(new URL(`../${asset}`, import.meta.url)));
  }
});
