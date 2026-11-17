import * as THREE from "three";
import { MODULES, PAD } from "./plan";

type Crater = { x: number; z: number; r: number; d: number };

const CRATERS: Crater[] = [
  { x: -78, z: -36, r: 18, d: 2.4 },
  { x: 92, z: 28, r: 24, d: 2.8 },
  { x: -46, z: 78, r: 15, d: 1.7 },
  { x: 58, z: -86, r: 17, d: 1.9 },
  { x: 128, z: -18, r: 12, d: 1.3 },
  { x: -124, z: 16, r: 14, d: 1.5 },
  { x: 24, z: 102, r: 10, d: 1.05 },
  { x: -28, z: -104, r: 11, d: 1.15 },
  { x: 150, z: 70, r: 22, d: 2.2 },
  { x: -146, z: -78, r: 19, d: 1.8 },
  { x: 46, z: 48, r: 6.5, d: 0.72 },
  { x: -62, z: -8, r: 5.2, d: 0.5 },
  { x: 74, z: -34, r: 7.2, d: 0.78 },
  { x: -36, z: 44, r: 4.6, d: 0.42 },
  { x: 18, z: -58, r: 5.6, d: 0.52 },
  { x: -88, z: 42, r: 8.4, d: 0.9 },
  { x: 36, z: -18, r: 4.2, d: 0.36 },
  { x: -8, z: 48, r: 5, d: 0.48 },
  { x: 44, z: 26, r: 8.5, d: 1.05 },
  { x: -52, z: 18, r: 9, d: 1.15 },
  { x: 62, z: 8, r: 6.5, d: 0.7 },
  { x: -70, z: -8, r: 7, d: 0.8 },
];

function hash(x: number, z: number) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function campusMask(x: number, z: number) {
  const ax = Math.abs(x - 2);
  const az = Math.abs(z + 6);
  const fx = 1 - smoothstep(24, 40, ax);
  const fz = 1 - smoothstep(34, 50, az);
  return fx * fz;
}

function distToSegment(
  px: number,
  pz: number,
  ax: number,
  az: number,
  bx: number,
  bz: number,
) {
  const abx = bx - ax;
  const abz = bz - az;
  const len2 = abx * abx + abz * abz || 1;
  const t = Math.min(1, Math.max(0, ((px - ax) * abx + (pz - az) * abz) / len2));
  const dx = px - (ax + abx * t);
  const dz = pz - (az + abz * t);
  return Math.hypot(dx, dz);
}

const PATHS: Array<[number, number, number, number]> = [
  [PAD.x, PAD.z, PAD.x, -22],
  [PAD.x, PAD.z, -12, 6],
  [PAD.x, PAD.z, 0.2, MODULES[0].z],
  [PAD.x, PAD.z, 14.4, 3.6],
  [-16, MODULES[0].z, 16, MODULES[0].z],
];

function pathDarkness(x: number, z: number) {
  let amount = 0;
  for (const [ax, az, bx, bz] of PATHS) {
    const distance = distToSegment(x, z, ax, az, bx, bz);
    if (distance < 1.35) amount = Math.max(amount, 1 - distance / 1.35);
  }
  const ring = Math.abs(Math.hypot(x - PAD.x, z - PAD.z) - 11.45);
  if (ring < 0.85) amount = Math.max(amount, 1 - ring / 0.85);
  return amount;
}

function sampleCrater(x: number, z: number, crater: Crater) {
  const u = Math.hypot(x - crater.x, z - crater.z) / crater.r;
  if (u > 1.9) return { h: 0, dark: 0, rim: 0 };
  let h = 0;
  let dark = 0;
  if (u < 1) {
    h += crater.d * (u * u - 1);
    dark = (1 - u) * (1 - u);
  }
  const rim = Math.exp(-(u - 1) * (u - 1) * 24);
  h += crater.d * 0.4 * rim;
  return { h, dark, rim };
}

export function createTerrain() {
  const size = 520;
  const segments = 188;
  const geo = new THREE.PlaneGeometry(size, size, segments, segments);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const base = new THREE.Color("#b6afa6");
  const rimColor = new THREE.Color("#d2cbc2");
  const scratch = new THREE.Color();

  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const dx = (x - 2) * 0.9;
    const dz = z + 6;
    const radius = Math.hypot(dx, dz);
    let height = 5.2 * (1 - Math.exp(-(radius * radius) / (2 * 96 * 96)));
    height += 0.9 * Math.sin(x * 0.02 + 0.4) * Math.cos(z * 0.017);
    height += 0.4 * Math.sin(x * 0.007 - 1.1) * Math.sin(z * 0.008);

    let dark = 0;
    let rim = 0;
    for (const crater of CRATERS) {
      const sample = sampleCrater(x, z, crater);
      height += sample.h;
      dark = Math.max(dark, sample.dark);
      rim = Math.max(rim, sample.rim);
    }

    height *= 1 - campusMask(x, z);
    pos.setY(i, height);

    const regional = 0.9 + 0.12 * hash(x * 0.03, z * 0.03);
    const speck = 0.96 + 0.08 * hash(x * 0.7, z * 0.7);
    scratch.copy(base);
    scratch.multiplyScalar(regional * speck * (1 - dark * 0.38));
    if (rim > 0.15) scratch.lerp(rimColor, Math.min(0.45, rim * 0.35));
    const track = pathDarkness(x, z);
    if (track > 0) scratch.multiplyScalar(1 - track * 0.2);
    colors[i * 3] = scratch.r;
    colors[i * 3 + 1] = scratch.g;
    colors[i * 3 + 2] = scratch.b;
  }

  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

export function createGrain() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("grain");
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const n =
        hash(x, y) * 0.5 +
        hash(Math.floor(x / 3), Math.floor(y / 3)) * 0.3 +
        hash(Math.floor(x / 11), Math.floor(y / 11)) * 0.2;
      const value = 70 + Math.floor(n * 185);
      const i = (y * size + x) * 4;
      image.data[i] = value;
      image.data[i + 1] = value;
      image.data[i + 2] = value;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(55, 55);
  return tex;
}
