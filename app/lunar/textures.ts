import * as THREE from "three";
import { rasterFlag } from "./flag";

function canvasTexture(canvas: HTMLCanvasElement, color = true) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;
  return tex;
}

export function createFlagTexture() {
  const { data, width, height } = rasterFlag(960, 640);
  const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = true;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

export function createSolarTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("solar");
  g.fillStyle = "#071428";
  g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#0c326f";
  g.beginPath();
  g.arc(256, 256, 236, 0, Math.PI * 2);
  g.fill();

  g.strokeStyle = "#1a4c96";
  g.lineWidth = 3;
  for (let i = 1; i <= 6; i += 1) {
    g.beginPath();
    g.arc(256, 256, 28 + i * 32, 0, Math.PI * 2);
    g.stroke();
  }
  g.strokeStyle = "#b08a49";
  g.lineWidth = 2;
  for (let i = 0; i < 18; i += 1) {
    const a = (i / 18) * Math.PI * 2;
    g.beginPath();
    g.moveTo(256 + Math.cos(a) * 30, 256 + Math.sin(a) * 30);
    g.lineTo(256 + Math.cos(a) * 228, 256 + Math.sin(a) * 228);
    g.stroke();
  }
  g.strokeStyle = "#c6a15e";
  g.lineWidth = 10;
  g.beginPath();
  g.arc(256, 256, 228, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#d9d4cb";
  g.beginPath();
  g.arc(256, 256, 18, 0, Math.PI * 2);
  g.fill();
  return canvasTexture(canvas);
}

export function createEarthTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("earth");
  g.fillStyle = "#1a4e89";
  g.fillRect(0, 0, 512, 256);
  g.fillStyle = "#163f72";
  for (let i = 0; i < 18; i += 1) {
    g.globalAlpha = 0.35;
    g.beginPath();
    g.ellipse(40 + i * 28, 40 + (i % 5) * 36, 30, 14, i, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;
  const land = "#7d8f52";
  const dry = "#b89a62";
  const blob = (
    x: number,
    y: number,
    rx: number,
    ry: number,
    rot: number,
    color: string,
  ) => {
    g.fillStyle = color;
    g.beginPath();
    g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    g.fill();
  };
  blob(78, 78, 36, 26, -0.4, land);
  blob(108, 92, 18, 16, 0.2, dry);
  blob(112, 148, 20, 38, 0.3, land);
  blob(250, 70, 26, 18, -0.2, land);
  blob(268, 118, 24, 46, 0.1, "#6f8a48");
  blob(250, 150, 16, 14, 0, dry);
  blob(330, 78, 58, 32, -0.15, land);
  blob(360, 96, 28, 16, 0.4, dry);
  blob(400, 168, 20, 12, -0.3, land);
  g.globalAlpha = 0.22;
  g.fillStyle = "#f4f7fb";
  for (let i = 0; i < 14; i += 1) {
    g.beginPath();
    g.ellipse(
      (i * 73) % 512,
      30 + ((i * 47) % 190),
      28 + (i % 4) * 8,
      8 + (i % 3) * 3,
      i * 0.4,
      0,
      Math.PI * 2,
    );
    g.fill();
  }
  g.globalAlpha = 1;
  return canvasTexture(canvas);
}

export function createPlantTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 128;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("plants");
  g.fillStyle = "#24301c";
  g.fillRect(0, 0, 384, 128);
  for (let row = 0; row < 5; row += 1) {
    const y = 8 + row * 24;
    g.fillStyle = row % 2 === 0 ? "#2f7a32" : "#3e9a3c";
    g.fillRect(12, y, 360, 16);
    g.fillStyle = "#1d4e22";
    for (let x = 18; x < 364; x += 16) {
      g.fillRect(x, y + 2, 8, 12);
    }
  }
  g.fillStyle = "rgba(210, 230, 170, 0.35)";
  g.fillRect(178, 2, 22, 124);
  return canvasTexture(canvas);
}

export function createStarTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("star");
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.85)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  const tex = canvasTexture(canvas, false);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createEggGeometry() {
  const pts: THREE.Vector2[] = [];
  const steps = 32;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const y = t * 3.42;
    const s = Math.sin(Math.PI * t);
    const lower = t < 0.62 ? 1 : 1 - (t - 0.62) * 0.55;
    let r = 1.32 * Math.pow(Math.max(s, 0), 0.58) * (0.82 + 0.28 * lower);
    r *= 1 + 0.055 * Math.sin(t * Math.PI * 14);
    pts.push(new THREE.Vector2(Math.max(r, 0.015), y));
  }
  const geo = new THREE.LatheGeometry(pts, 22);
  geo.computeVertexNormals();
  return geo;
}

export function createFlagCloth(width: number, height: number) {
  const geo = new THREE.PlaneGeometry(width, height, 16, 8);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const u = (x + width / 2) / width;
    const down = (height / 2 - y) / height;
    const sag = Math.sin(u * Math.PI) * 0.05 * down;
    const fold = Math.sin(u * Math.PI * 2) * 0.01 * (0.3 + down);
    pos.setY(i, y - sag);
    pos.setZ(i, fold);
  }
  geo.computeVertexNormals();
  return geo;
}

export function createNozzle() {
  const pts = [
    new THREE.Vector2(0.16, 0),
    new THREE.Vector2(0.46, 0.12),
    new THREE.Vector2(0.62, 0.42),
    new THREE.Vector2(0.5, 0.86),
    new THREE.Vector2(0.26, 1.12),
  ];
  return new THREE.LatheGeometry(pts, 20);
}
