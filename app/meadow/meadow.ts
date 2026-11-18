/**
 * Original meadow. Grass, tree, flowers, sky and fireflies are generated here.
 * No assets or code are taken from the reference. Leaf, flower and glow
 * textures are drawn at runtime. Provenance: procedural, this file only.
 */
import * as THREE from "three";

const TREE_X = 0.25;
const TREE_Z = -0.35;
const TRAIL_SLOTS = 4;
const BLOSSOM_COUNT = 36;

const TERRAIN_GLSL = /* glsl */ `
float meadowHeight(vec2 p) {
  float dz = p.y + 0.15;
  float mainHill = exp(-(p.x * p.x + dz * dz) / 70.0);
  float lx = p.x + 6.4;
  float lz = p.y + 3.1;
  float left = exp(-(lx * lx + lz * lz) / 30.0);
  float rx = p.x - 7.2;
  float rz = p.y + 2.6;
  float right = exp(-(rx * rx + rz * rz) / 36.0);
  float fz = p.y + 8.8;
  float far = exp(-(fz * fz) / 46.0) * (0.46 + 0.12 * sin(p.x * 0.31));
  float ripple = 0.035 * sin(p.x * 1.05 + p.y * 0.62);
  float ridge = exp(-(p.y + 0.05) * (p.y + 0.05) / 48.0);
  return 1.45 * mainHill + 0.42 * left + 0.32 * right + 0.22 * far + 0.78 * ridge + ripple;
}
`;

export function meadowHeight(x: number, z: number) {
  const mainHill = Math.exp(-(x * x + (z + 0.15) ** 2) / 70);
  const left = Math.exp(-((x + 6.4) ** 2 + (z + 3.1) ** 2) / 30);
  const right = Math.exp(-((x - 7.2) ** 2 + (z + 2.6) ** 2) / 36);
  const far = Math.exp(-((z + 8.8) ** 2) / 46) * (0.46 + 0.12 * Math.sin(x * 0.31));
  const ripple = 0.035 * Math.sin(x * 1.05 + z * 0.62);
  const ridge = Math.exp(-((z + 0.05) ** 2) / 48);
  return 1.45 * mainHill + 0.42 * left + 0.32 * right + 0.22 * far + 0.78 * ridge + ripple;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function makeTexture(draw: (ctx: CanvasRenderingContext2D, size: number) => void, size = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d unavailable");
  draw(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function leafTexture() {
  return makeTexture((ctx, size) => {
    ctx.clearRect(0, 0, size, size);
    ctx.translate(size / 2, size / 2);
    ctx.scale(1, 1.35);
    ctx.beginPath();
    ctx.moveTo(0, -46);
    ctx.bezierCurveTo(34, -28, 40, 10, 0, 48);
    ctx.bezierCurveTo(-40, 10, -34, -28, 0, -46);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -34);
    ctx.lineTo(0, 36);
    ctx.stroke();
  });
}

function flowerTexture() {
  return makeTexture((ctx, size) => {
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size * 0.46;
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, size - 8);
    ctx.quadraticCurveTo(cx + 6, size * 0.72, cx, cy + 8);
    ctx.stroke();
    for (let i = 0; i < 6; i += 1) {
      const angle = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(angle) * 18, cy + Math.sin(angle) * 14, 12, 18, angle, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#fff6d4";
    ctx.fill();
  });
}

function glowTexture() {
  return makeTexture((ctx, size) => {
    const g = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.7)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }, 64);
}

function canopyTexture() {
  return makeTexture((ctx, size) => {
    ctx.clearRect(0, 0, size, size);
    const cx = size * 0.5;
    const cy = size * 0.56;
    const shade = ctx.createRadialGradient(cx, cy + size * 0.02, size * 0.04, cx, cy, size * 0.42);
    shade.addColorStop(0, "rgba(36, 92, 34, 0.96)");
    shade.addColorStop(0.55, "rgba(46, 112, 38, 0.9)");
    shade.addColorStop(0.82, "rgba(70, 132, 42, 0.55)");
    shade.addColorStop(1, "rgba(80, 140, 46, 0)");
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.4, size * 0.27, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 2200; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.62);
      const x = cx + Math.cos(angle) * radius * size * 0.4;
      const y = cy + Math.sin(angle) * radius * size * 0.26 - radius * size * 0.04;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI);
      const lit = y < cy ? 1 : 0;
      const red = 50 + lit * 70 + Math.floor(Math.random() * 40);
      const green = 100 + lit * 70 + Math.floor(Math.random() * 40);
      const blue = 28 + Math.floor(Math.random() * 20);
      ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${0.35 + Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, 3 + Math.random() * 6, 1.4 + Math.random() * 2.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, 1024);
}

function bladeGeometry() {
  const segments = 3;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const width = 0.032 * (1 - t * 0.9);
    positions.push(-width, t, 0, width, t, 0);
    uvs.push(0, t, 1, t);
  }
  for (let i = 0; i < segments; i += 1) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

function alongCurve(points: THREE.Vector3[], radial = 10, tubular = 16, radiusAt: (t: number) => number) {
  const curve = new THREE.CatmullRomCurve3(points);
  const positions: number[] = [];
  const indices: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= tubular; i += 1) {
    const t = i / tubular;
    const center = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const normal = new THREE.Vector3().crossVectors(up, tangent);
    if (normal.lengthSq() < 1e-4) normal.set(1, 0, 0);
    normal.normalize();
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
    const radius = radiusAt(t);
    for (let j = 0; j <= radial; j += 1) {
      const angle = (j / radial) * Math.PI * 2;
      const wobble = 1 + 0.05 * Math.sin(t * 46 + j);
      const offset = normal
        .clone()
        .multiplyScalar(Math.cos(angle) * radius * wobble)
        .add(binormal.clone().multiplyScalar(Math.sin(angle) * radius * wobble));
      const p = center.clone().add(offset);
      positions.push(p.x, p.y, p.z);
    }
  }
  const stride = radial + 1;
  for (let i = 0; i < tubular; i += 1) {
    for (let j = 0; j < radial; j += 1) {
      const a = i * stride + j;
      const b = a + stride;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function buildTree() {
  const group = new THREE.Group();
  const trunk = alongCurve(
    [
      new THREE.Vector3(0.04, 0, 0.02),
      new THREE.Vector3(0.01, 0.42, 0),
      new THREE.Vector3(-0.03, 0.86, -0.02),
      new THREE.Vector3(0.02, 1.28, 0.01),
    ],
    12,
    18,
    (t) => 0.16 * (1 - t * 0.55),
  );
  const roots = [
    [new THREE.Vector3(0.02, 0.08, 0.01), new THREE.Vector3(0.22, 0.02, 0.12), new THREE.Vector3(0.42, -0.02, 0.18)],
    [new THREE.Vector3(-0.01, 0.08, 0), new THREE.Vector3(-0.24, 0.01, -0.08), new THREE.Vector3(-0.4, -0.03, -0.16)],
    [new THREE.Vector3(0, 0.06, 0.02), new THREE.Vector3(0.05, 0.01, 0.22), new THREE.Vector3(0.08, -0.02, 0.38)],
  ].map((pts) => alongCurve(pts.map((p) => new THREE.Vector3(...p.toArray())), 7, 8, (t) => 0.045 * (1 - t * 0.7)));

  const branches = [
    [new THREE.Vector3(-0.01, 0.95, 0), new THREE.Vector3(-0.35, 1.15, 0.12), new THREE.Vector3(-0.72, 1.28, 0.2)],
    [new THREE.Vector3(0.01, 1.02, 0), new THREE.Vector3(0.38, 1.22, -0.08), new THREE.Vector3(0.78, 1.32, -0.16)],
    [new THREE.Vector3(0, 1.12, 0.01), new THREE.Vector3(0.12, 1.38, 0.22), new THREE.Vector3(0.2, 1.58, 0.36)],
    [new THREE.Vector3(-0.01, 1.08, -0.01), new THREE.Vector3(-0.16, 1.32, -0.28), new THREE.Vector3(-0.28, 1.5, -0.42)],
    [new THREE.Vector3(0.02, 1.2, 0), new THREE.Vector3(0.22, 1.48, 0.02), new THREE.Vector3(0.34, 1.7, 0.04)],
  ].map((pts) => alongCurve(pts.map((p) => new THREE.Vector3(...p.toArray())), 6, 8, (t) => 0.028 * (1 - t * 0.75)));

  const wood = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL1,
    side: THREE.DoubleSide,
    uniforms: {},
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      varying vec3 vNormal;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vWorld;
      varying vec3 vNormal;
      uniform float uNight;
      uniform vec3 uSun;
      float hash(vec3 p) {
        return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
      }
      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float n = mix(mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
                           mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
                      mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
                           mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
        return n;
      }
      vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
      void main() {
        float n = noise(vWorld * vec3(7.0, 3.0, 7.0));
        float streak = noise(vec3(vWorld.x * 2.0, vWorld.y * 11.0, vWorld.z * 2.0));
        vec3 bark = mix(vec3(0.29, 0.16, 0.09), vec3(0.48, 0.30, 0.17), n);
        bark = mix(bark, bark * 0.72, smoothstep(0.45, 0.8, streak));
        bark = mix(bark, bark * vec3(0.45, 0.55, 0.7), uNight * 0.72);
        float wrap = clamp(dot(normalize(vNormal), uSun) * 0.5 + 0.55, 0.0, 1.0);
        gl_FragColor = vec4(toLinear(bark * (0.38 + 0.75 * wrap)), 1.0);
      }
    `,
  });
  const trunkMesh = new THREE.Mesh(trunk, wood);
  group.add(trunkMesh);
  for (const geometry of [...roots, ...branches]) group.add(new THREE.Mesh(geometry, wood));

  const clusters = [
    { c: new THREE.Vector3(0.02, 1.76, 0.02), r: new THREE.Vector3(1.62, 0.58, 1.34), n: 2400 },
    { c: new THREE.Vector3(-1.05, 1.55, 0.2), r: new THREE.Vector3(0.72, 0.36, 0.58), n: 800 },
    { c: new THREE.Vector3(1.08, 1.58, -0.14), r: new THREE.Vector3(0.74, 0.36, 0.55), n: 800 },
    { c: new THREE.Vector3(0.04, 2.12, 0), r: new THREE.Vector3(0.68, 0.28, 0.52), n: 520 },
    { c: new THREE.Vector3(-0.25, 1.4, 0.5), r: new THREE.Vector3(0.55, 0.26, 0.42), n: 360 },
    { c: new THREE.Vector3(0.28, 1.42, -0.52), r: new THREE.Vector3(0.52, 0.24, 0.4), n: 360 },
  ];
  let leafCount = 0;
  const samples: { p: THREE.Vector3; shell: number; hue: number }[] = [];
  for (const cluster of clusters) {
    for (let i = 0; i < cluster.n; i += 1) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = Math.pow(Math.random(), 0.42);
      if (radius < 0.48) continue;
      const p = new THREE.Vector3(
        cluster.c.x + radius * cluster.r.x * Math.sin(phi) * Math.cos(theta),
        cluster.c.y + radius * cluster.r.y * Math.cos(phi),
        cluster.c.z + radius * cluster.r.z * Math.sin(phi) * Math.sin(theta),
      );
      samples.push({ p, shell: radius, hue: Math.random() });
      leafCount += 1;
    }
  }

  const leaf = new THREE.PlaneGeometry(0.08, 0.115);
  const leafMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL1,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.28,
    uniforms: { uMap: { value: leafTexture() }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float aShell;
      attribute float aHue;
      uniform float uTime;
      varying float vShell;
      varying float vHue;
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vShell = aShell;
        vHue = aHue;
        vec3 p = position;
        float sway = sin(uTime * 1.15 + instanceMatrix[3].x * 2.4 + instanceMatrix[3].z) * uv.y * 0.045;
        p.x += sway;
        vec4 world = modelMatrix * instanceMatrix * vec4(p, 1.0);
        vNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * vec3(0.0, 0.0, 1.0));
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uNight;
      uniform vec3 uSun;
      varying float vShell;
      varying float vHue;
      varying vec2 vUv;
      varying vec3 vNormal;
      vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
      void main() {
        float alpha = texture2D(uMap, vUv).r;
        if (alpha < 0.28) discard;
        vec3 deep = vec3(0.18, 0.48, 0.16);
        vec3 bright = vec3(0.78, 0.88, 0.36);
        vec3 leaf = mix(deep, bright, clamp(vShell * 0.7 + vHue * 0.45, 0.0, 1.0));
        leaf = mix(leaf, vec3(0.92, 0.86, 0.38), step(0.82, vHue) * vShell * (1.0 - uNight));
        leaf = mix(leaf, leaf * vec3(0.42, 0.55, 0.62), uNight * 0.78);
        float wrap = abs(dot(normalize(vNormal), uSun)) * 0.42 + 0.62;
        gl_FragColor = vec4(toLinear(leaf * wrap), 1.0);
      }
    `,
  });
  const leaves = new THREE.InstancedMesh(leaf, leafMat, leafCount);
  const shellAttr = new Float32Array(leafCount);
  const hueAttr = new Float32Array(leafCount);
  const dummy = new THREE.Object3D();
  samples.forEach((sample, index) => {
    dummy.position.copy(sample.p);
    if (hash(index + 1) > 0.4) {
      dummy.rotation.set(hash(index + 2) * Math.PI, hash(index + 5) * Math.PI, hash(index + 8) * Math.PI);
    } else {
      const outward = new THREE.Vector3(sample.p.x, sample.p.y * 0.2, sample.p.z);
      if (outward.lengthSq() < 1e-4) outward.set(0, 1, 0);
      dummy.lookAt(sample.p.clone().add(outward.normalize()));
      dummy.rotateZ(hash(index + 3) * Math.PI);
    }
    const s = 0.72 + hash(index + 9) * 0.7;
    dummy.scale.set(s, s * (0.85 + hash(index + 4) * 0.4), 1);
    dummy.updateMatrix();
    leaves.setMatrixAt(index, dummy.matrix);
    shellAttr[index] = sample.shell;
    hueAttr[index] = sample.hue;
  });
  leaves.instanceMatrix.needsUpdate = true;
  leaves.geometry.setAttribute("aShell", new THREE.InstancedBufferAttribute(shellAttr, 1));
  leaves.geometry.setAttribute("aHue", new THREE.InstancedBufferAttribute(hueAttr, 1));
  leaves.frustumCulled = false;
  group.add(leaves);

  const canopyMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL1,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    uniforms: { uMap: { value: canopyTexture() }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 p = position;
        p.x += sin(uTime * 1.05 + position.x * 1.4 + position.y) * uv.y * 0.05;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uNight;
      varying vec2 vUv;
      vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
      void main() {
        vec4 tex = texture2D(uMap, vUv);
        if (tex.a < 0.05) discard;
        vec3 col = mix(tex.rgb, tex.rgb * vec3(0.42, 0.55, 0.68), uNight * 0.82);
        gl_FragColor = vec4(toLinear(col), tex.a);
      }
    `,
  });
  const canopyGeo = new THREE.PlaneGeometry(2.55, 1.15, 1, 4);
  for (let i = 0; i < 2; i += 1) {
    const card = new THREE.Mesh(canopyGeo, canopyMat);
    card.position.set(0.02, 1.7, 0);
    card.rotation.y = i === 0 ? 0.15 : Math.PI * 0.5;
    card.rotation.x = i === 0 ? -0.04 : 0.02;
    card.renderOrder = 2;
    group.add(card);
  }

  group.position.set(TREE_X, meadowHeight(TREE_X, TREE_Z) - 0.02, TREE_Z);
  group.scale.setScalar(0.78);
  return { group, materials: [wood, leafMat, canopyMat] };
}

type MountOptions = {
  reduced: boolean;
  onNight: (value: number) => void;
};

export function mountMeadow(host: HTMLElement, options: MountOptions) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(1);
  renderer.setSize(host.clientWidth, host.clientHeight);
  renderer.setClearColor(0xb7daf3, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = "meadow-gl";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 160);
  const crest = meadowHeight(TREE_X, TREE_Z);
  camera.position.set(0.15, crest + 0.55, 12.6);
  camera.lookAt(TREE_X + 0.15, crest + 0.72, TREE_Z);

  const fieldUniforms = {
    uNight: { value: 0 },
    uTime: { value: 0 },
    uSun: { value: new THREE.Vector3(-0.55, 0.72, 0.28).normalize() },
    uTrail: { value: Array.from({ length: TRAIL_SLOTS }, () => new THREE.Vector3()) },
    uActive: { value: 0 },
  };
  const skyUniforms = {
    uNight: { value: 0 },
    uTime: { value: 8.5 },
    uSun: { value: fieldUniforms.uSun.value },
  };

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(80, 40, 24),
    new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL1,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: skyUniforms,
      vertexShader: /* glsl */ `
        varying vec3 vWorld;
        void main() {
          vec4 world = modelMatrix * vec4(position, 1.0);
          vWorld = world.xyz;
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vWorld;
        uniform float uNight;
        uniform float uTime;
        uniform vec3 uSun;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 4; i++) {
            v += a * noise(p);
            p *= 2.03;
            a *= 0.5;
          }
          return v;
        }
        vec3 toLinear(vec3 c) { return pow(max(c, 0.0), vec3(2.2)); }
        void main() {
          vec3 dir = normalize(vWorld - cameraPosition);
          float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
          vec3 dayTop = vec3(0.42, 0.70, 0.92);
          vec3 dayHorizon = vec3(0.86, 0.94, 0.90);
          vec3 duskTop = vec3(0.45, 0.38, 0.66);
          vec3 duskHorizon = vec3(0.98, 0.62, 0.46);
          vec3 nightTop = vec3(0.025, 0.045, 0.12);
          vec3 nightHorizon = vec3(0.10, 0.16, 0.32);
          float toDusk = smoothstep(0.0, 0.48, uNight);
          float toNight = smoothstep(0.4, 0.88, uNight);
          vec3 top = mix(mix(dayTop, duskTop, toDusk), nightTop, toNight);
          vec3 horizon = mix(mix(dayHorizon, duskHorizon, toDusk), nightHorizon, toNight);
          vec3 col = mix(horizon, top, smoothstep(0.0, 0.72, h));
          vec2 cloudUv = dir.xz / max(dir.y + 0.38, 0.22) * 1.15;
          float clouds = smoothstep(0.36, 0.62, fbm(cloudUv + vec2(uTime * 0.004, 0.15)));
          float wisp = smoothstep(0.42, 0.7, fbm(cloudUv * 1.8 + vec2(4.0, uTime * 0.003)));
          clouds = max(clouds, wisp * 0.65);
          clouds *= smoothstep(-0.02, 0.16, dir.y);
          vec3 cloudCol = mix(vec3(0.98, 0.99, 0.97), vec3(0.18, 0.24, 0.38), toNight);
          col = mix(col, cloudCol, clouds * mix(0.9, 0.4, toNight));
          float sunDot = dot(dir, normalize(uSun));
          float sun = smoothstep(0.9992, 0.99975, sunDot) * (1.0 - toNight);
          float glow = pow(max(sunDot, 0.0), 6.0) * (1.0 - toNight);
          col += vec3(1.0, 0.93, 0.75) * (sun + glow * 0.55);
          vec3 moonDir = normalize(vec3(0.24, 0.14, -0.96));
          float moonDot = dot(dir, moonDir);
          float moon = smoothstep(0.9988, 0.99955, moonDot) * smoothstep(0.35, 0.7, uNight);
          float moonGlow = pow(max(moonDot, 0.0), 28.0) * smoothstep(0.3, 0.75, uNight);
          col += vec3(0.86, 0.91, 1.0) * (moon * 1.4 + moonGlow * 0.45);
          vec2 starCell = floor(dir.xy * 520.0 + dir.z * 90.0);
          vec2 starFract = fract(dir.xy * 520.0 + dir.z * 90.0) - 0.5;
          float stars = step(0.996, hash(starCell)) * smoothstep(0.16, 0.02, length(starFract));
          stars *= smoothstep(0.45, 0.8, uNight) * smoothstep(0.08, 0.28, dir.y);
          col += vec3(0.9, 0.94, 1.0) * stars;
          gl_FragColor = vec4(toLinear(col), 1.0);
        }
      `,
    }),
  );
  scene.add(sky);

  const groundGeo = new THREE.PlaneGeometry(96, 96, 80, 80);
  groundGeo.rotateX(-Math.PI / 2);
  const groundPos = groundGeo.attributes.position;
  for (let i = 0; i < groundPos.count; i += 1) {
    const x = groundPos.getX(i);
    const z = groundPos.getZ(i);
    groundPos.setY(i, meadowHeight(x, z));
  }
  groundGeo.computeVertexNormals();
  const groundMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL1,
    uniforms: fieldUniforms,
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vWorld;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      ${TERRAIN_GLSL}
      varying vec3 vNormal;
      varying vec3 vWorld;
      uniform float uNight;
      uniform vec3 uSun;
      vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
      void main() {
        float light = clamp(dot(normalize(vNormal), uSun) * 0.65 + 0.4, 0.0, 1.0);
        vec3 low = mix(vec3(0.16, 0.42, 0.14), vec3(0.05, 0.14, 0.09), uNight);
        vec3 high = mix(vec3(0.28, 0.52, 0.16), vec3(0.1, 0.24, 0.12), uNight);
        vec3 col = mix(low, high, light);
        float shade = smoothstep(2.6, 0.25, length(vWorld.xz - vec2(${TREE_X.toFixed(2)}, ${TREE_Z.toFixed(2)})));
        col *= mix(1.0, 0.72, shade * (1.0 - uNight * 0.25));
        float dist = length(vWorld - cameraPosition);
        float fog = smoothstep(10.5, 18.0, dist);
        vec3 fogCol = mix(mix(vec3(0.86, 0.93, 0.90), vec3(0.98, 0.66, 0.48), smoothstep(0.05, 0.5, uNight)), vec3(0.10, 0.16, 0.32), smoothstep(0.45, 0.9, uNight));
        col = mix(col, fogCol, fog);
        gl_FragColor = vec4(toLinear(col), 1.0);
      }
    `,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  scene.add(ground);

  const grassGeo = bladeGeometry();
  const blades: { x: number; z: number; sx: number; sy: number; yaw: number; seed: number }[] = [];
  const bands = [
    { n: 8000, z0: 3.2, z1: 8.8, h: 0.52 },
    { n: 3200, z0: -1.2, z1: 3.3, h: 0.7 },
    { n: 1400, z0: -5.5, z1: -1.1, h: 0.55 },
  ];
  for (const band of bands) {
    for (let i = 0; i < band.n; i += 1) {
      const z = band.z0 + Math.random() * (band.z1 - band.z0);
      const x = (Math.random() - 0.5) * (22 + Math.abs(z) * 0.15);
      const dx = x - TREE_X;
      const dz = z - TREE_Z;
      if (dx * dx + dz * dz < 0.16) continue;
      blades.push({
        x,
        z,
        sx: 0.45 + Math.random() * 1.05,
        sy: (0.22 + Math.random() ** 0.5 * 1.15) * band.h,
        yaw: Math.random() * Math.PI,
        seed: Math.random(),
      });
    }
  }
  const seeds = new Float32Array(blades.length);
  grassGeo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
  const grassMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL1,
    side: THREE.DoubleSide,
    uniforms: fieldUniforms,
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTime;
      uniform float uActive;
      uniform vec3 uTrail[${TRAIL_SLOTS}];
      varying float vSeed;
      varying float vTip;
      varying float vGlow;
      varying vec3 vNormal;
      void main() {
        vSeed = aSeed;
        vTip = uv.y;
        vec3 p = position;
        float bend = sin(uTime * 1.25 + instanceMatrix[3].x * 0.65 + instanceMatrix[3].z * 0.38 + aSeed * 6.0);
        p.x += bend * uv.y * uv.y * 0.16;
        p.z += cos(uTime * 1.05 + instanceMatrix[3].x * 0.4) * uv.y * uv.y * 0.07;
        float glow = 0.0;
        vec2 base = instanceMatrix[3].xz;
        if (uActive > 0.001) {
          for (int i = 0; i < ${TRAIL_SLOTS}; i++) {
            vec2 d = base - uTrail[i].xy;
            float inf = exp(-dot(d, d) / 0.42) * uTrail[i].z;
            glow += inf;
            vec2 push = d / max(length(d), 0.001);
            p.xz += push * inf * uv.y * 0.28;
          }
        }
        vGlow = glow;
        vec4 world = instanceMatrix * vec4(p, 1.0);
        vNormal = normalize(mat3(instanceMatrix) * vec3(bend * 0.2, 0.25, 1.0));
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vSeed;
      varying float vTip;
      varying float vGlow;
      varying vec3 vNormal;
      uniform float uNight;
      uniform vec3 uSun;
      vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
      void main() {
        vec3 root = mix(vec3(0.27, 0.58, 0.2), vec3(0.03, 0.1, 0.05), uNight);
        vec3 tip = mix(vec3(0.86, 0.94, 0.48), vec3(0.14, 0.3, 0.12), uNight);
        vec3 col = mix(root, tip, vTip);
        col *= mix(0.7, 1.24, fract(vSeed * 7.3));
        col = mix(col, vec3(0.5, 0.68, 0.18), smoothstep(0.78, 0.98, fract(vSeed * 13.1)) * vTip * (1.0 - uNight));
        col = mix(col, vec3(0.2, 0.42, 0.14), smoothstep(0.9, 1.0, fract(vSeed * 3.7)) * (1.0 - uNight));
        float wrap = clamp(dot(normalize(vNormal), uSun) * 0.45 + 0.62, 0.0, 1.0);
        col *= wrap;
        col += vec3(0.18, 0.22, 0.05) * vTip * (1.0 - uNight);
        vec3 glowCol = mix(vec3(0.95, 0.98, 0.62), vec3(1.0, 0.86, 0.42), uNight);
        col += glowCol * vGlow * 0.85;
        gl_FragColor = vec4(toLinear(col), 1.0);
      }
    `,
  });
  const grass = new THREE.InstancedMesh(grassGeo, grassMat, blades.length);
  const dummy = new THREE.Object3D();
  blades.forEach((blade, index) => {
    dummy.position.set(blade.x, meadowHeight(blade.x, blade.z), blade.z);
    dummy.rotation.y = blade.yaw;
    dummy.scale.set(blade.sx, blade.sy, 1);
    dummy.updateMatrix();
    grass.setMatrixAt(index, dummy.matrix);
    seeds[index] = blade.seed;
  });
  grass.instanceMatrix.needsUpdate = true;
  grass.frustumCulled = false;
  scene.add(grass);

  const flowerGeo = new THREE.PlaneGeometry(0.22, 0.3);
  flowerGeo.translate(0, 0.15, 0);
  const flowerCount = 900;
  const flowerSeeds = new Float32Array(flowerCount);
  flowerGeo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(flowerSeeds, 1));
  const flowerMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL1,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.25,
    uniforms: { ...fieldUniforms, uMap: { value: flowerTexture() } },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      varying float vSeed;
      varying vec2 vUv;
      void main() {
        vSeed = aSeed;
        vUv = uv;
        gl_Position = projectionMatrix * viewMatrix * instanceMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uNight;
      varying float vSeed;
      varying vec2 vUv;
      vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
      void main() {
        vec4 tex = texture2D(uMap, vUv);
        if (tex.a < 0.25) discard;
        float pick = fract(vSeed * 5.7);
        vec3 tint = pick < 0.25 ? vec3(0.96, 0.84, 0.28) : pick < 0.5 ? vec3(0.96, 0.95, 0.9) : pick < 0.75 ? vec3(0.86, 0.48, 0.78) : vec3(0.62, 0.52, 0.9);
        tint = mix(tint, tint * vec3(0.55, 0.65, 0.8), uNight * 0.65);
        gl_FragColor = vec4(toLinear(tex.rgb * tint), tex.a);
      }
    `,
  });
  const flowers = new THREE.InstancedMesh(flowerGeo, flowerMat, flowerCount);
  for (let i = 0; i < flowerCount; i += 1) {
    const z = -4.6 + Math.random() * 10.2;
    const x = (Math.random() - 0.5) * 16;
    dummy.position.set(x, meadowHeight(x, z), z);
    dummy.rotation.set(0, Math.random() * Math.PI, 0);
    const s = 0.42 + Math.random() * 0.38;
    dummy.scale.set(s, s, 1);
    dummy.updateMatrix();
    flowers.setMatrixAt(i, dummy.matrix);
    flowerSeeds[i] = Math.random();
  }
  flowers.instanceMatrix.needsUpdate = true;
  flowers.frustumCulled = false;
  scene.add(flowers);

  const tree = buildTree();
  for (const material of tree.materials) {
    material.uniforms.uNight = fieldUniforms.uNight;
    material.uniforms.uSun = fieldUniforms.uSun;
    if (material.uniforms.uTime) material.uniforms.uTime = fieldUniforms.uTime;
  }
  scene.add(tree.group);

  const glowMap = glowTexture();
  const fireflyGeo = new THREE.BufferGeometry();
  const fireflyCount = 56;
  const fireflyPos = new Float32Array(fireflyCount * 3);
  const fireflyHome = Array.from({ length: fireflyCount }, (_, index) => ({
    x: (hash(index + 1) - 0.5) * 10,
    z: -3.2 + hash(index + 2) * 7,
    phase: hash(index + 3) * Math.PI * 2,
    y: 0.35 + hash(index + 4) * 0.9,
  }));
  fireflyGeo.setAttribute("position", new THREE.BufferAttribute(fireflyPos, 3));
  const fireflies = new THREE.Points(
    fireflyGeo,
    new THREE.PointsMaterial({
      map: glowMap,
      color: 0xf3e7a2,
      size: 0.16,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    }),
  );
  scene.add(fireflies);

  const blossomGeo = new THREE.PlaneGeometry(1, 1);
  const blossomLife = new Float32Array(BLOSSOM_COUNT);
  blossomGeo.setAttribute("aLife", new THREE.InstancedBufferAttribute(blossomLife, 1));
  const blossomHue = new Float32Array(BLOSSOM_COUNT);
  blossomGeo.setAttribute("aHue", new THREE.InstancedBufferAttribute(blossomHue, 1));
  const blossomMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL1,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { ...fieldUniforms, uMap: { value: glowMap }, uFlower: { value: flowerTexture() } },
    vertexShader: /* glsl */ `
      ${TERRAIN_GLSL}
      attribute float aLife;
      attribute float aHue;
      varying float vLife;
      varying float vHue;
      varying vec2 vUv;
      void main() {
        vLife = aLife;
        vHue = aHue;
        vUv = uv;
        vec3 center = vec3(instanceMatrix[3].x, 0.0, instanceMatrix[3].z);
        center.y = meadowHeight(center.xz) + 0.16 + (1.0 - aLife) * 0.2;
        vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        float s = 0.05 + aLife * 0.2;
        vec3 world = center + right * position.x * s + up * position.y * s;
        gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform sampler2D uFlower;
      uniform float uNight;
      varying float vLife;
      varying float vHue;
      varying vec2 vUv;
      vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
      void main() {
        if (vLife < 0.02) discard;
        vec4 glow = texture2D(uMap, vUv);
        vec4 flower = texture2D(uFlower, vUv);
        vec3 tint = mix(vec3(1.0, 0.92, 0.45), vec3(1.0, 0.72, 0.86), vHue);
        tint = mix(tint, vec3(0.85, 1.0, 0.55), uNight);
        vec3 col = mix(flower.rgb * tint, tint, uNight * 0.65) * glow.r;
        gl_FragColor = vec4(toLinear(col), glow.r * vLife);
      }
    `,
  });
  const blossoms = new THREE.InstancedMesh(blossomGeo, blossomMat, BLOSSOM_COUNT);
  const blossomState = Array.from({ length: BLOSSOM_COUNT }, () => ({ x: 0, z: 0, life: 0, hue: 0 }));
  blossoms.frustumCulled = false;
  scene.add(blossoms);

  const trail: { x: number; z: number; life: number }[] = [];
  let night = 0;
  let targetNight = 0;
  const reduced = options.reduced;
  let running = true;
  let frame = 0;
  let lastStamp = performance.now();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const lastTrail = new THREE.Vector2(99, 99);

  let onScreen = true;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1);

  const resize = () => {
    const width = host.clientWidth || 1;
    const height = host.clientHeight || 1;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    host.dataset.buffer = `${renderer.domElement.width}x${renderer.domElement.height}`;
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  const setPressed = (nightOn: boolean) => {
    document.querySelectorAll<HTMLButtonElement>("[data-meadow='day'], [data-meadow='night']").forEach((button) => {
      const on = (button.dataset.meadow === "night") === nightOn;
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
  };
  setPressed(false);

  const onDay = () => {
    targetNight = 0;
    if (reduced) {
      night = 0;
      paint();
    }
    setPressed(false);
  };
  const onNightClick = () => {
    targetNight = 1;
    if (reduced) {
      night = 1;
      paint();
    }
    setPressed(true);
  };
  const onHide = () => {
    document.documentElement.classList.toggle("is-scenery");
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") document.documentElement.classList.remove("is-scenery");
  };
  document.querySelector("[data-meadow='day']")?.addEventListener("click", onDay);
  document.querySelector("[data-meadow='night']")?.addEventListener("click", onNightClick);
  document.querySelector("[data-meadow='hide']")?.addEventListener("click", onHide);
  window.addEventListener("keydown", onKey);

  const onPointer = (event: PointerEvent) => {
    if (reduced || event.pointerType === "touch") return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const origin = raycaster.ray.origin;
    const direction = raycaster.ray.direction;
    let distance = 0;
    for (let i = 0; i < 40; i += 1) {
      const x = origin.x + direction.x * distance;
      const y = origin.y + direction.y * distance;
      const z = origin.z + direction.z * distance;
      const h = meadowHeight(x, z);
      if (y <= h) {
        if (Math.hypot(x - lastTrail.x, z - lastTrail.y) > 0.18) {
          trail.unshift({ x, z, life: 1 });
          if (trail.length > 18) trail.pop();
          const slot = blossomState.find((item) => item.life <= 0) ?? blossomState[0];
          slot.x = x;
          slot.z = z;
          slot.life = 1;
          slot.hue = Math.random();
          lastTrail.set(x, z);
        }
        return;
      }
      distance += Math.max(0.12, (y - h) * 0.5);
      if (distance > 30) return;
    }
  };
  host.addEventListener("pointermove", onPointer);

  const sun = new THREE.Vector3();
  const moon = new THREE.Vector3(0.62, 0.5, -0.2).normalize();
  let blossomDirty = true;
  let looping = false;
  let primed = false;

  const paint = () => {
    const now = performance.now();
    const wall = primed ? Math.max(0, (now - lastStamp) / 1000) : 0;
    primed = true;
    lastStamp = now;
    const elapsed = Math.min(wall, 0.08);
    if (!reduced) {
      fieldUniforms.uTime.value += elapsed;
      skyUniforms.uTime.value += elapsed;
      const delta = targetNight - night;
      night += Math.sign(delta) * Math.min(Math.abs(delta), wall * 0.3);
    } else {
      night = targetNight;
    }
    const sunLift = 0.78 - smoothstep(0.05, 0.62, night) * 0.95;
    sun.set(-0.72, sunLift, 0.32).normalize();
    fieldUniforms.uSun.value.copy(sun).lerp(moon, smoothstep(0.35, 0.8, night)).normalize();
    fieldUniforms.uNight.value = night;
    skyUniforms.uNight.value = night;
    options.onNight(night);

    let trailActive = 0;
    for (let i = 0; i < TRAIL_SLOTS; i += 1) {
      const point = trail[i];
      const slot = fieldUniforms.uTrail.value[i];
      if (!point || point.life <= 0) slot.set(0, 0, 0);
      else {
        point.life = Math.max(0, point.life - elapsed * 0.55);
        slot.set(point.x, point.z, point.life);
        if (point.life > 0) trailActive = 1;
      }
    }
    fieldUniforms.uActive.value = trailActive;
    for (let i = trail.length - 1; i >= 0; i -= 1) {
      if (trail[i].life <= 0) trail.splice(i, 1);
    }

    let liveBlossoms = 0;
    blossomState.forEach((item) => {
      if (!reduced && item.life > 0) item.life = Math.max(0, item.life - elapsed * 0.42);
      if (item.life > 0) liveBlossoms += 1;
    });
    if (liveBlossoms > 0 || blossomDirty) {
      const lifeAttr = blossomGeo.getAttribute("aLife") as THREE.InstancedBufferAttribute;
      const hueAttr = blossomGeo.getAttribute("aHue") as THREE.InstancedBufferAttribute;
      blossomState.forEach((item, index) => {
        dummy.position.set(item.x, 0, item.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(item.life > 0 ? 1 : 0);
        dummy.updateMatrix();
        blossoms.setMatrixAt(index, dummy.matrix);
        lifeAttr.setX(index, item.life);
        hueAttr.setX(index, item.hue);
      });
      blossoms.instanceMatrix.needsUpdate = true;
      lifeAttr.needsUpdate = true;
      blossomDirty = liveBlossoms > 0;
    }

    const fireflyOpacity = smoothstep(0.4, 0.75, night) * 0.9;
    (fireflies.material as THREE.PointsMaterial).opacity = fireflyOpacity;
    if (fireflyOpacity > 0.01) {
      fireflyHome.forEach((bug, index) => {
        const time = fieldUniforms.uTime.value;
        fireflyPos[index * 3] = bug.x + Math.sin(time * 0.35 + bug.phase) * 0.35;
        fireflyPos[index * 3 + 1] = meadowHeight(bug.x, bug.z) + bug.y + Math.sin(time * 1.4 + bug.phase) * 0.08;
        fireflyPos[index * 3 + 2] = bug.z + Math.cos(time * 0.28 + bug.phase) * 0.28;
      });
      (fireflyGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }

    sky.position.copy(camera.position);
    renderer.render(scene, camera);
    const rendered = renderer.info.render;
    host.dataset.draws = String(rendered.calls);
    host.dataset.triangles = String(rendered.triangles);
    host.classList.add("is-ready");
  };

  const loop = () => {
    looping = false;
    if (!running || reduced || document.hidden || !onScreen) return;
    looping = true;
    frame = window.requestAnimationFrame(loop);
    paint();
  };
  const startLoop = () => {
    if (!running || reduced || document.hidden || !onScreen || looping) return;
    looping = true;
    frame = window.requestAnimationFrame(loop);
  };
  const onVisibility = () => startLoop();
  document.addEventListener("visibilitychange", onVisibility);
  const intersection = new IntersectionObserver((entries) => {
    onScreen = entries.some((entry) => entry.isIntersecting);
    if (onScreen) startLoop();
  });
  intersection.observe(host);
  if (reduced) paint();
  else startLoop();

  return () => {
    running = false;
    window.cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersection.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    host.removeEventListener("pointermove", onPointer);
    window.removeEventListener("keydown", onKey);
    document.querySelector("[data-meadow='day']")?.removeEventListener("click", onDay);
    document.querySelector("[data-meadow='night']")?.removeEventListener("click", onNightClick);
    document.querySelector("[data-meadow='hide']")?.removeEventListener("click", onHide);
    renderer.dispose();
    renderer.domElement.remove();
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      mesh.geometry?.dispose();
      const material = mesh.material;
      if (Array.isArray(material)) material.forEach((item) => item.dispose());
      else material?.dispose();
    });
  };
}
