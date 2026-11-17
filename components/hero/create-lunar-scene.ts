import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { drawFlag } from "./draw-flag";

const INK = 0x14202b;
const PAPER = 0xf7f5f0;
const REGOLITH = 0xe7e2d6;
const REGOLITH_DUST = 0xddd6c8;
const PAD = 0xf3efe6;
const SOLAR = 0x2c343b;
const POLE = 0x243038;

export type LunarSceneOptions = {
  compact: boolean;
  reducedMotion: boolean;
};

export type LunarScene = {
  resize: (width: number, height: number, pixelRatio: number) => void;
  setRunning: (running: boolean) => void;
  setCompact: (compact: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  dispose: () => void;
};

type Frame = {
  fov: number;
  polar: number;
  azimuth: number;
  radius: number;
  target: [number, number, number];
};

const DESKTOP_FRAME: Frame = {
  fov: 32,
  polar: 0.9,
  azimuth: 0.22,
  radius: 18.2,
  target: [0.15, 0.15, 1.15],
};

const COMPACT_FRAME: Frame = {
  fov: 34,
  polar: 0.96,
  azimuth: 0.18,
  radius: 13.4,
  target: [0.35, 0.2, 1.45],
};

const FLAG = {
  x: 1.15,
  z: 3.15,
  width: 2.55,
  height: 2.55 * (2 / 3),
  pole: 2.05,
};

function addLinePositions(positions: number[], ax: number, ay: number, az: number, bx: number, by: number, bz: number) {
  positions.push(ax, ay, az, bx, by, bz);
}

export function createLunarScene(
  canvas: HTMLCanvasElement,
  options: LunarSceneOptions,
): LunarScene {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    stencil: false,
    powerPreference: "default",
  });
  if (!renderer.getContext()) {
    renderer.dispose();
    throw new Error("WebGL unavailable");
  }

  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(new Color(REGOLITH), 1);

  const scene = new Scene();
  const camera = new PerspectiveCamera(DESKTOP_FRAME.fov, 1, 0.1, 80);

  const disposables: Array<{ dispose: () => void }> = [];
  function keep<T extends { dispose: () => void }>(value: T): T {
    disposables.push(value);
    return value;
  }

  const paper = keep(
    new MeshLambertMaterial({
      color: PAPER,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
  );
  const regolith = keep(new MeshBasicMaterial({ color: REGOLITH }));
  const dust = keep(
    new MeshBasicMaterial({ color: REGOLITH_DUST }),
  );
  const padMat = keep(new MeshBasicMaterial({ color: PAD }));
  const solarMat = keep(new MeshBasicMaterial({ color: SOLAR }));
  const poleMat = keep(new MeshBasicMaterial({ color: POLE }));
  const ink = keep(new LineBasicMaterial({ color: INK }));
  const inkSoft = keep(
    new LineBasicMaterial({ color: INK, transparent: true, opacity: 0.45 }),
  );
  const inkFaint = keep(
    new LineBasicMaterial({ color: INK, transparent: true, opacity: 0.28 }),
  );
  const solarLine = keep(
    new LineBasicMaterial({ color: 0xe6e0d4, transparent: true, opacity: 0.55 }),
  );
  const contactMat = keep(
    new MeshBasicMaterial({
      color: INK,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
    }),
  );

  const boxUnit = keep(new BoxGeometry(1, 1, 1));
  const boxEdges = keep(new EdgesGeometry(boxUnit, 20));
  const drumUnit = keep(new CylinderGeometry(1, 1, 1, 8));
  const drumEdges = keep(new EdgesGeometry(drumUnit, 20));
  const domeUnit = keep(new SphereGeometry(1, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2));
  const domeEdges = keep(new EdgesGeometry(domeUnit, 1));
  const rockUnit = keep(new SphereGeometry(1, 5, 3));
  const rockEdges = keep(new EdgesGeometry(rockUnit, 1));

  // three.js Lambert divides by π, so these intensities stay near paper-white.
  scene.add(new AmbientLight(0xffffff, 2.5));
  const sun = new DirectionalLight(0xfff6ea, 0.95);
  sun.position.set(-6, 11, 7);
  scene.add(sun);
  const fill = new DirectionalLight(0xd5dce6, 0.14);
  fill.position.set(7, 4, -5);
  scene.add(fill);

  const ground = new Mesh(keep(new PlaneGeometry(80, 80)), regolith);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const base = new Group();
  scene.add(base);
  const farField = new Group();
  scene.add(farField);

  const placeEdges = (
    parent: Object3D,
    edges: BufferGeometry,
    material: LineBasicMaterial,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    rotX = 0,
    rotY = 0,
    rotZ = 0,
  ) => {
    const lines = new LineSegments(edges, material);
    lines.position.set(x, y, z);
    lines.scale.set(sx, sy, sz);
    lines.rotation.set(rotX, rotY, rotZ);
    parent.add(lines);
    return lines;
  };

  const addBox = (
    parent: Object3D,
    x: number,
    z: number,
    w: number,
    h: number,
    d: number,
    material: MeshLambertMaterial | MeshBasicMaterial = paper,
    rotY = 0,
  ) => {
    const mesh = new Mesh(boxUnit, material);
    mesh.scale.set(w, h, d);
    mesh.position.set(x, h / 2, z);
    mesh.rotation.y = rotY;
    parent.add(mesh);
    placeEdges(parent, boxEdges, ink, x, h / 2, z, w, h, d, 0, rotY, 0);
    return mesh;
  };

  const addDrum = (
    parent: Object3D,
    x: number,
    z: number,
    radius: number,
    height: number,
    material: MeshLambertMaterial | MeshBasicMaterial = paper,
  ) => {
    const mesh = new Mesh(drumUnit, material);
    mesh.scale.set(radius, height, radius);
    mesh.position.set(x, height / 2, z);
    parent.add(mesh);
    placeEdges(parent, drumEdges, ink, x, height / 2, z, radius, height, radius);
    return mesh;
  };

  const addDome = (parent: Object3D, x: number, z: number, radius: number) => {
    const height = radius * 0.62;
    const mesh = new Mesh(domeUnit, paper);
    mesh.scale.set(radius, height, radius);
    mesh.position.set(x, 0.03, z);
    parent.add(mesh);
    placeEdges(parent, domeEdges, ink, x, 0.03, z, radius, height, radius);
    return mesh;
  };

  const contact = (parent: Object3D, x: number, z: number, rx: number, rz: number) => {
    const mesh = new Mesh(keep(new CircleGeometry(1, 18)), contactMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.02, z);
    mesh.scale.set(rx, rz, 1);
    parent.add(mesh);
  };

  const ring = (
    parent: Object3D,
    x: number,
    y: number,
    z: number,
    radius: number,
    segments: number,
    material: LineBasicMaterial,
  ) => {
    const positions: number[] = [];
    for (let i = 0; i <= segments; i += 1) {
      const angle = (i / segments) * Math.PI * 2;
      positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    }
    const geometry = keep(new BufferGeometry());
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    const line = new Line(geometry, material);
    line.position.set(x, 0, z);
    parent.add(line);
    return line;
  };

  const addCrater = (parent: Object3D, x: number, z: number, radius: number) => {
    const disc = new Mesh(keep(new CircleGeometry(radius * 0.72, 20)), dust);
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(x, 0.015, z);
    parent.add(disc);
    ring(parent, x, 0.03, z, radius, 28, inkSoft);
    ring(parent, x, 0.035, z, radius * 0.62, 20, inkFaint);
  };

  const addSolar = (
    parent: Object3D,
    x: number,
    z: number,
    w: number,
    d: number,
    tilt: number,
  ) => {
    const h = 0.05;
    const y = 0.1;
    const mesh = new Mesh(boxUnit, solarMat);
    mesh.scale.set(w, h, d);
    mesh.position.set(x, y, z);
    mesh.rotation.x = tilt;
    parent.add(mesh);
    placeEdges(parent, boxEdges, ink, x, y, z, w, h, d, tilt, 0, 0);

    const cols = Math.max(3, Math.round(w / 0.72));
    const rows = Math.max(2, Math.round(d / 0.72));
    const positions: number[] = [];
    const gy = 0.78;
    for (let i = 0; i <= cols; i += 1) {
      const px = -0.5 + i / cols;
      addLinePositions(positions, px, gy, -0.5, px, gy, 0.5);
    }
    for (let j = 0; j <= rows; j += 1) {
      const pz = -0.5 + j / rows;
      addLinePositions(positions, -0.5, gy, pz, 0.5, gy, pz);
    }
    const geometry = keep(new BufferGeometry());
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    const grid = new LineSegments(geometry, solarLine);
    mesh.add(grid);
    contact(parent, x, z + Math.sin(tilt) * d * 0.15, w * 0.48, d * 0.42);
  };

  const corridor = (x1: number, z1: number, x2: number, z2: number) => {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.hypot(dx, dz);
    const height = 0.36;
    const width = 0.52;
    const rotY = Math.atan2(-dz, dx);
    addBox(base, (x1 + x2) / 2, (z1 + z2) / 2, length, height, width, paper, rotY);
  };

  // Core of the base. Kept compact so the plan reads from a high oblique.
  addDrum(base, -0.15, -0.45, 1.42, 0.92);
  contact(base, -0.15, -0.45, 1.7, 1.7);
  ring(base, -0.15, 0.95, -0.45, 0.72, 24, ink);

  addBox(base, -4.05, -0.15, 3.35, 0.7, 1.55);
  contact(base, -4.05, -0.15, 1.85, 0.95);
  roofRect(base, keep, ink, -4.05, 0.74, -0.15, 1.15, 0.48);

  addBox(base, 3.55, -1.2, 3.05, 0.76, 1.48);
  contact(base, 3.55, -1.2, 1.7, 0.9);
  roofRect(base, keep, ink, 3.55, 0.8, -1.2, 1.05, 0.46);

  addDome(base, 0.15, -3.45, 1.38);
  contact(base, 0.15, -3.45, 1.45, 1.45);
  addDome(base, 1.55, 1.85, 1.02);
  contact(base, 1.55, 1.85, 1.1, 1.1);

  addDrum(base, 5.45, 0.45, 0.36, 0.72);
  addDrum(base, 5.5, 1.35, 0.3, 0.6);
  contact(base, 5.48, 0.9, 0.7, 1.15);

  corridor(-1.5, -0.4, -2.4, -0.2);
  corridor(1.2, -0.55, 2.05, -1.05);
  corridor(-0.05, -1.85, 0.1, -2.15);
  corridor(0.2, 0.85, 0.85, 1.2);
  corridor(2.35, 1.35, 2.15, -0.55);

  addSolar(base, -1.85, -6.35, 3.15, 2.25, -0.14);
  addSolar(base, 1.85, -6.55, 3.15, 2.25, -0.14);
  const westSolar = new Group();
  farField.add(westSolar);
  addSolar(westSolar, -6.2, -0.85, 1.85, 3.8, 0.1);

  const mastHeight = 1.45;
  const mast = new Mesh(
    keep(new CylinderGeometry(0.02, 0.028, 1, 6)),
    poleMat,
  );
  mast.scale.y = mastHeight;
  mast.position.set(-0.15, 0.92 + mastHeight / 2, -0.45);
  base.add(mast);
  const dipole = new Mesh(boxUnit, poleMat);
  dipole.scale.set(0.62, 0.024, 0.024);
  dipole.position.set(-0.15, 0.92 + mastHeight, -0.45);
  base.add(dipole);

  // Sintered path from the pad up to the hub.
  const path = addBox(base, -1.55, 1.7, 0.7, 0.04, 3.6, padMat, 0.18);
  path.position.y = 0.02;

  addLandingPad(base, keep, padMat, ink, inkSoft, -3.2, 3.45, 2.05);

  const craters: Array<[number, number, number, boolean]> = [
    [-8.2, 5.2, 1.55, true],
    [7.4, 5.6, 1.15, false],
    [-6.6, -6.6, 1.9, true],
    [8.6, -2.6, 1.35, true],
    [5.8, 4.6, 0.72, false],
    [-2.4, -7.4, 0.95, true],
    [1.6, 7.1, 1.2, true],
    [-9.4, -0.4, 0.8, true],
    [10.1, 1.6, 1.55, true],
    [-5.2, 2.4, 0.55, false],
  ];
  for (const [x, z, radius, far] of craters) {
    addCrater(far ? farField : base, x, z, radius);
  }

  const rocks: Array<[number, number, number]> = [
    [-6.2, 4.2, 0.28],
    [6.8, -5.1, 0.22],
    [8.2, 3.4, 0.18],
    [-8.8, -3.6, 0.24],
  ];
  for (const [x, z, size] of rocks) {
    const mesh = new Mesh(rockUnit, dust);
    mesh.scale.set(size, size * 0.38, size * 0.82);
    mesh.position.set(x, size * 0.12, z);
    mesh.rotation.y = x;
    farField.add(mesh);
    placeEdges(
      farField,
      rockEdges,
      inkSoft,
      x,
      size * 0.12,
      z,
      size,
      size * 0.38,
      size * 0.82,
      0,
      x,
      0,
    );
  }

  const { swing, flagGeometry, basePositions } = addFlag(
    scene,
    keep,
    poleMat,
    renderer,
    DESKTOP_FRAME,
  );

  let compact = options.compact;
  let reducedMotion = options.reducedMotion;
  let running = false;
  let raf = 0;
  let elapsed = 0;
  let lastTick = 0;

  const apply = (time: number) => {
    const frame = compact ? COMPACT_FRAME : DESKTOP_FRAME;
    const drift = reducedMotion ? 0 : time;
    const azimuth = frame.azimuth + Math.sin(drift * 0.2) * 0.09;
    const polar = frame.polar + Math.sin(drift * 0.13) * 0.018;
    const radius = frame.radius + Math.sin(drift * 0.09) * 0.22;
    const [tx, ty, tz] = frame.target;
    camera.fov = frame.fov;
    camera.position.set(
      tx + Math.sin(polar) * Math.sin(azimuth) * radius,
      ty + Math.cos(polar) * radius,
      tz + Math.sin(polar) * Math.cos(azimuth) * radius,
    );
    camera.lookAt(tx, ty, tz);
    camera.updateProjectionMatrix();

    swing.rotation.y = reducedMotion ? 0 : Math.sin(drift * 0.65) * 0.05;
    waveFlag(flagGeometry, basePositions, reducedMotion ? 0 : drift);
    farField.visible = !compact;
  };

  const render = () => {
    renderer.render(scene, camera);
  };

  const tick = (now: number) => {
    const delta = Math.min(0.05, (now - lastTick) / 1000);
    lastTick = now;
    elapsed += delta;
    apply(elapsed);
    render();
    if (running) raf = window.requestAnimationFrame(tick);
  };

  apply(0);
  render();

  return {
    resize(width, height, pixelRatio) {
      if (width <= 0 || height <= 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      render();
    },
    setRunning(next) {
      if (next === running) return;
      running = next;
      if (running) {
        lastTick = performance.now();
        raf = window.requestAnimationFrame(tick);
      } else if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    setCompact(next) {
      if (next === compact) return;
      compact = next;
      apply(reducedMotion ? 0 : elapsed);
      render();
    },
    setReducedMotion(next) {
      reducedMotion = next;
      if (next) {
        elapsed = 0;
        apply(0);
        render();
      }
    },
    dispose() {
      running = false;
      if (raf) window.cancelAnimationFrame(raf);
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

type Keep = <T extends { dispose: () => void }>(value: T) => T;

function roofRect(
  parent: Object3D,
  keep: Keep,
  material: LineBasicMaterial,
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
) {
  const positions = [
    x - w, y, z - d,
    x + w, y, z - d,
    x + w, y, z + d,
    x - w, y, z + d,
    x - w, y, z - d,
  ];
  const geometry = keep(new BufferGeometry());
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  parent.add(new Line(geometry, material));
}

function addLandingPad(
  parent: Object3D,
  keep: Keep,
  padMat: MeshBasicMaterial,
  ink: LineBasicMaterial,
  inkSoft: LineBasicMaterial,
  x: number,
  z: number,
  radius: number,
) {
  const disc = new Mesh(keep(new CircleGeometry(radius, 40)), padMat);
  disc.rotation.x = -Math.PI / 2;
  disc.position.set(x, 0.025, z);
  parent.add(disc);

  const ringAt = (r: number, y: number, material: LineBasicMaterial, segments: number) => {
    const positions: number[] = [];
    for (let i = 0; i <= segments; i += 1) {
      const angle = (i / segments) * Math.PI * 2;
      positions.push(x + Math.cos(angle) * r, y, z + Math.sin(angle) * r);
    }
    const geometry = keep(new BufferGeometry());
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    parent.add(new Line(geometry, material));
  };

  ringAt(radius, 0.04, ink, 48);
  ringAt(radius * 0.62, 0.045, inkSoft, 32);
  ringAt(radius * 1.18, 0.03, inkSoft, 48);

  const cross = keep(new BufferGeometry());
  const arm = radius * 0.42;
  cross.setAttribute(
    "position",
    new Float32BufferAttribute(
      [
        x - arm, 0.05, z, x + arm, 0.05, z,
        x, 0.05, z - arm, x, 0.05, z + arm,
      ],
      3,
    ),
  );
  parent.add(new LineSegments(cross, ink));
}

function addFlag(
  scene: Scene,
  keep: Keep,
  poleMat: MeshBasicMaterial,
  renderer: WebGLRenderer,
  frame: Frame,
) {
  const cloth = document.createElement("canvas");
  cloth.width = 960;
  cloth.height = 640;
  const ctx = cloth.getContext("2d");
  if (!ctx) throw new Error("Could not draw the flag");
  drawFlag(ctx, cloth.width, cloth.height);

  const texture = keep(new CanvasTexture(cloth));
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.needsUpdate = true;

  const flagMaterial = keep(
    new MeshBasicMaterial({ map: texture, toneMapped: false }),
  );

  const planted = new Group();
  const camX =
    frame.target[0] +
    Math.sin(frame.polar) * Math.sin(frame.azimuth) * frame.radius;
  const camZ =
    frame.target[2] +
    Math.sin(frame.polar) * Math.cos(frame.azimuth) * frame.radius;
  planted.position.set(FLAG.x, 0, FLAG.z);
  planted.rotation.y = Math.atan2(camX - FLAG.x, camZ - FLAG.z);
  scene.add(planted);

  const pole = new Mesh(
    keep(new CylinderGeometry(0.035, 0.045, 1, 8)),
    poleMat,
  );
  pole.scale.y = FLAG.pole;
  pole.position.y = FLAG.pole / 2;
  planted.add(pole);

  const swing = new Group();
  planted.add(swing);

  const elevation = Math.PI / 2 - frame.polar;
  const tilt = new Group();
  tilt.position.y = FLAG.pole - 0.08;
  tilt.rotation.x = -elevation;
  swing.add(tilt);

  const yard = new Mesh(
    keep(new CylinderGeometry(0.02, 0.02, FLAG.width, 6)),
    poleMat,
  );
  yard.rotation.z = Math.PI / 2;
  yard.position.x = FLAG.width / 2;
  tilt.add(yard);

  const flagGeometry = keep(new PlaneGeometry(FLAG.width, FLAG.height, 18, 1));
  const basePositions = new Float32Array(flagGeometry.attributes.position.array);
  const flag = new Mesh(flagGeometry, flagMaterial);
  flag.position.set(FLAG.width / 2, -FLAG.height / 2, 0.01);
  tilt.add(flag);

  return { swing, flagGeometry, basePositions };
}

function waveFlag(geometry: PlaneGeometry, base: Float32Array, time: number) {
  const position = geometry.attributes.position;
  const array = position.array as Float32Array;
  const half = FLAG.width / 2;
  for (let i = 0; i < array.length; i += 3) {
    const x = base[i];
    const along = (x + half) / FLAG.width;
    const belly = time === 0 ? 0 : Math.sin(time * 0.7 + along * 2.4) * 0.055 * along * along;
    array[i] = base[i];
    array[i + 1] = base[i + 1];
    array[i + 2] = base[i + 2] + belly;
  }
  position.needsUpdate = true;
}
