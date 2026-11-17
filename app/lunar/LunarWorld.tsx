"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  CABINET,
  CREW,
  DISH,
  EGGS,
  FLAG,
  FLAG_H,
  FLAG_POLE_H,
  FLAG_W,
  MODULES,
  PAD,
  PANEL_NORMAL,
  ROVER,
  SOLAR,
  TOWER,
} from "./plan";
import { createGrain, createTerrain } from "./terrain";
import {
  createEarthTexture,
  createEggGeometry,
  createFlagCloth,
  createFlagTexture,
  createNozzle,
  createPlantTexture,
  createSolarTexture,
  createStarTexture,
} from "./textures";

const PANEL_QUAT = new THREE.Quaternion().setFromUnitVectors(
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(...PANEL_NORMAL).normalize(),
);

function buildAssets() {
  const grain = createGrain();
  const flagTex = createFlagTexture();
  const solarTex = createSolarTexture();
  const earthTex = createEarthTexture();
  const plantTex = createPlantTexture();
  const starTex = createStarTexture();
  const egg = createEggGeometry();
  const cloth = createFlagCloth(FLAG_W, FLAG_H);
  const nozzle = createNozzle();
  const terrain = createTerrain();

  const regolith = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1,
    metalness: 0,
    bumpMap: grain,
    bumpScale: 0.16,
  });
  const berm = new THREE.MeshStandardMaterial({
    color: "#a49d94",
    roughness: 1,
    metalness: 0,
  });
  const white = new THREE.MeshStandardMaterial({
    color: "#e5e8ed",
    roughness: 0.56,
    metalness: 0.05,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: "#a78445",
    roughness: 0.38,
    metalness: 0.88,
  });
  const solarMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: solarTex,
    roughness: 0.62,
    metalness: 0.06,
  });
  const truss = new THREE.MeshStandardMaterial({
    color: "#c8ccd1",
    roughness: 0.36,
    metalness: 0.74,
  });
  const metal = new THREE.MeshStandardMaterial({
    color: "#8e949b",
    roughness: 0.4,
    metalness: 0.8,
  });
  const nozzleMat = new THREE.MeshStandardMaterial({
    color: "#16181b",
    roughness: 0.48,
    metalness: 0.62,
  });
  const printed = new THREE.MeshStandardMaterial({
    color: "#8d887f",
    roughness: 0.96,
    metalness: 0,
  });
  const printedDark = printed.clone();
  printedDark.color.set("#7a756f");
  const door = new THREE.MeshStandardMaterial({
    color: "#2c2a28",
    roughness: 0.82,
    metalness: 0.08,
  });
  const flagMat = new THREE.MeshStandardMaterial({
    map: flagTex,
    roughness: 0.76,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const pole = new THREE.MeshStandardMaterial({
    color: "#c9ced3",
    roughness: 0.38,
    metalness: 0.72,
  });
  const sleeve = new THREE.MeshStandardMaterial({
    color: "#f4f5f7",
    roughness: 0.52,
    metalness: 0.04,
  });
  const pad = new THREE.MeshStandardMaterial({
    color: "#6e6b67",
    roughness: 0.93,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -2,
  });
  const ring = new THREE.MeshStandardMaterial({
    color: "#918c86",
    roughness: 1,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -4,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: "#9fb892",
    transparent: true,
    opacity: 0.22,
    roughness: 0.08,
    metalness: 0,
    emissive: "#4d8a46",
    emissiveIntensity: 0.18,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const plantMat = new THREE.MeshStandardMaterial({
    map: plantTex,
    emissive: "#2f7a32",
    emissiveMap: plantTex,
    emissiveIntensity: 0.38,
    roughness: 0.72,
    metalness: 0,
  });
  const windowMat = new THREE.MeshStandardMaterial({
    color: "#171b1f",
    roughness: 0.16,
    metalness: 0.5,
    emissive: "#3c342b",
    emissiveIntensity: 0.28,
  });
  const suit = new THREE.MeshStandardMaterial({
    color: "#f4f1eb",
    roughness: 0.6,
    metalness: 0.03,
  });
  const visor = new THREE.MeshStandardMaterial({
    color: "#2a261f",
    roughness: 0.14,
    metalness: 0.84,
  });
  const rubber = new THREE.MeshStandardMaterial({
    color: "#1b1d21",
    roughness: 0.72,
    metalness: 0.18,
  });
  const earthMat = new THREE.MeshBasicMaterial({ map: earthTex });
  const starMat = new THREE.PointsMaterial({
    map: starTex,
    color: "#e8eeff",
    size: 1.45,
    sizeAttenuation: false,
    transparent: true,
    depthWrite: false,
  });

  const textures = [grain, flagTex, solarTex, earthTex, plantTex, starTex];
  const geometries = [egg, cloth, nozzle, terrain];
  const materials = [
    regolith,
    berm,
    white,
    gold,
    solarMat,
    truss,
    metal,
    nozzleMat,
    printed,
    printedDark,
    door,
    flagMat,
    pole,
    sleeve,
    pad,
    ring,
    glass,
    plantMat,
    windowMat,
    suit,
    visor,
    rubber,
    earthMat,
    starMat,
  ];

  return {
    textures,
    geometries,
    materials,
    terrain,
    berm,
    egg,
    cloth,
    nozzle,
    regolith,
    white,
    gold,
    solarMat,
    truss,
    metal,
    nozzleMat,
    printed,
    printedDark,
    door,
    flagMat,
    pole,
    sleeve,
    pad,
    ring,
    glass,
    plantMat,
    windowMat,
    suit,
    visor,
    rubber,
    earthMat,
    starMat,
  };
}

type Assets = ReturnType<typeof buildAssets>;

const AssetContext = createContext<Assets | null>(null);

function useAssets() {
  const value = useContext(AssetContext);
  if (!value) throw new Error("lunar assets missing");
  return value;
}

function Rod({
  a,
  b,
  radius,
  material,
  castShadow = false,
}: {
  a: [number, number, number];
  b: [number, number, number];
  radius: number;
  material: THREE.Material;
  castShadow?: boolean;
}) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const dir = end.clone().sub(start);
  const length = Math.max(dir.length(), 0.001);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.normalize(),
  );
  return (
    <mesh position={mid} quaternion={quaternion} material={material} castShadow={castShadow}>
      <cylinderGeometry args={[radius, radius, length, 6]} />
    </mesh>
  );
}

function Stars({ mobile }: { mobile: boolean }) {
  const { starMat } = useAssets();
  const positions = useMemo(() => {
    const count = mobile ? 200 : 480;
    const data = new Float32Array(count * 3);
    let seed = 19;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < count; i += 1) {
      const radius = 480 + rand() * 280;
      const theta = rand() * Math.PI * 2;
      const lift = 0.15 + rand() * 0.85;
      data[i * 3] = radius * Math.cos(theta) * (1 - lift * 0.2);
      data[i * 3 + 1] = 40 + lift * radius * 0.72;
      data[i * 3 + 2] = radius * Math.sin(theta);
    }
    return data;
  }, [mobile]);

  return (
    <points material={starMat} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
    </points>
  );
}

function Earth() {
  const { earthMat } = useAssets();
  return (
    <mesh position={[-16, 22.6, -128]} rotation={[0.08, 1.15, 0]} material={earthMat}>
      <sphereGeometry args={[5.1, 32, 24]} />
    </mesh>
  );
}

function Ground() {
  const { terrain, regolith } = useAssets();
  return (
    <mesh
      geometry={terrain}
      material={regolith}
      receiveShadow
      dispose={null}
    />
  );
}

function Pad() {
  const { pad, ring } = useAssets();
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[PAD.x, 0.035, PAD.z]}
        material={pad}
        receiveShadow
      >
        <circleGeometry args={[PAD.r, 64]} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[PAD.x, 0.05, PAD.z]}
        material={ring}
      >
        <ringGeometry args={[7.2, 7.38, 64]} />
      </mesh>
    </group>
  );
}

function Lanyue({ mobile }: { mobile: boolean }) {
  const a = useAssets();
  const lattice = mobile ? 8 : 12;
  return (
    <group position={[PAD.x, 0, PAD.z]}>
      <mesh
        geometry={a.nozzle}
        position={[0, 0.36, 0]}
        material={a.nozzleMat}
        castShadow
        dispose={null}
      />
      <mesh position={[0, 2.5, 0]} material={a.gold} castShadow receiveShadow>
        <cylinderGeometry args={[1.02, 1.1, 2.05, 20]} />
      </mesh>
      {Array.from({ length: lattice }, (_, i) => {
        const ang = (i / lattice) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(ang) * 1.56, 2.55, Math.sin(ang) * 1.56]}
            material={a.truss}
            castShadow={!mobile}
          >
            <cylinderGeometry args={[0.032, 0.032, 2.55, 4]} />
          </mesh>
        );
      })}
      {[1.35, 2.55, 3.72].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={a.truss}>
          <torusGeometry args={[1.56, 0.04, 6, 20]} />
        </mesh>
      ))}
      <mesh position={[0, 3.95, 0]} material={a.gold} castShadow>
        <cylinderGeometry args={[1.46, 1.5, 0.28, 20]} />
      </mesh>
      <mesh position={[0, 4.82, 0]} material={a.white} castShadow receiveShadow>
        <cylinderGeometry args={[1.26, 1.4, 1.5, 22]} />
      </mesh>
      <mesh position={[0, 5.72, 0]} material={a.white} castShadow>
        <cylinderGeometry args={[0.58, 1.26, 0.48, 20]} />
      </mesh>
      <mesh position={[0, 6.08, 0]} material={a.white} castShadow>
        <sphereGeometry args={[0.6, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, 6.62, 0]} material={a.metal}>
        <cylinderGeometry args={[0.025, 0.035, 0.7, 6]} />
      </mesh>
      <mesh position={[1.22, 4.7, 0.15]} material={a.gold} castShadow>
        <boxGeometry args={[0.22, 0.72, 0.86]} />
      </mesh>
      <mesh position={[-1.18, 4.85, -0.1]} material={a.gold} castShadow>
        <boxGeometry args={[0.2, 0.55, 0.7]} />
      </mesh>
      {[-0.36, 0.34].map((x) => (
        <mesh key={x} position={[x, 4.9, 1.34]} material={a.windowMat}>
          <circleGeometry args={[0.13, 12]} />
        </mesh>
      ))}
      {Array.from({ length: 4 }, (_, i) => {
        const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const c = Math.cos(ang);
        const s = Math.sin(ang);
        const top: [number, number, number] = [c * 1.18, 4.15, s * 1.18];
        const mid: [number, number, number] = [c * 1.4, 2.35, s * 1.4];
        const foot: [number, number, number] = [c * 3.25, 0.05, s * 3.25];
        return (
          <group key={i}>
            <Rod a={top} b={foot} radius={0.045} material={a.gold} castShadow />
            <Rod a={mid} b={foot} radius={0.028} material={a.truss} castShadow={!mobile} />
            <mesh position={foot} material={a.gold} receiveShadow>
              <cylinderGeometry args={[0.4, 0.46, 0.07, 10]} />
            </mesh>
          </group>
        );
      })}
      {[-1, 1].map((side) => (
        <group key={side}>
          <group position={[side * 3.4, 5.02, 0.4]} quaternion={PANEL_QUAT}>
            <mesh material={a.solarMat} castShadow>
              <cylinderGeometry args={[2.42, 2.42, 0.07, 32]} />
            </mesh>
          </group>
          <Rod
            a={[side * 1.35, 4.95, 0.25]}
            b={[side * 3.15, 5.02, 0.4]}
            radius={0.05}
            material={a.truss}
            castShadow={!mobile}
          />
        </group>
      ))}
    </group>
  );
}

function Eggs() {
  const { egg, printed, printedDark, door } = useAssets();
  return (
    <group>
      {EGGS.map((eggPos, index) => {
        const yaw = Math.atan2(-(PAD.z - eggPos.z), PAD.x - eggPos.x);
        return (
          <group
            key={`${eggPos.x}-${eggPos.z}`}
            position={[eggPos.x, 0.02, eggPos.z]}
            rotation={[0, yaw, 0]}
          >
            <mesh
              geometry={egg}
              material={index % 2 === 0 ? printed : printedDark}
              castShadow
              receiveShadow
              dispose={null}
            />
            <mesh position={[1.16, 0.82, 0]} material={door}>
              <boxGeometry args={[0.1, 0.92, 0.5]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Greenhouse({ mobile }: { mobile: boolean }) {
  const a = useAssets();
  return (
    <group>
      {MODULES.map((mod) => (
        <group key={mod.x} position={[mod.x, 0, mod.z]}>
          {mod.greenhouse ? (
            <>
              <mesh
                position={[0, 0.02, 0]}
                rotation={[0, 0, Math.PI / 2]}
                material={a.white}
                castShadow
                receiveShadow
              >
                <cylinderGeometry args={[1.38, 1.38, mod.length, 24, 1, false, Math.PI / 2, Math.PI]} />
              </mesh>
              <mesh
                position={[0, 0.05, 0]}
                rotation={[0, 0, Math.PI / 2]}
                material={a.glass}
                renderOrder={2}
              >
                <cylinderGeometry args={[1.42, 1.42, mod.length * 0.78, 20, 1, true, -Math.PI / 2, Math.PI]} />
              </mesh>
              <mesh position={[0, 0.72, 0]} material={a.plantMat}>
                <boxGeometry args={[mod.length * 0.72, 0.22, 2.05]} />
              </mesh>
              {[-2.6, -0.9, 0.9, 2.6].map((rib) => (
                <mesh
                  key={rib}
                  position={[rib, 0.04, 0]}
                  rotation={[0, Math.PI / 2, 0]}
                  material={a.truss}
                >
                  <torusGeometry args={[1.34, 0.028, 5, 12, Math.PI]} />
                </mesh>
              ))}
              <mesh position={[0, 1.36, 0]} material={a.truss}>
                <boxGeometry args={[mod.length * 0.76, 0.035, 0.035]} />
              </mesh>
            </>
          ) : (
            <mesh
              position={[0, 0.08, 0]}
              rotation={[0, 0, Math.PI / 2]}
              material={a.white}
              castShadow
              receiveShadow
            >
              <cylinderGeometry args={[1.38, 1.38, mod.length, 24]} />
            </mesh>
          )}
          <mesh
            position={[0, 0.03, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            material={a.berm}
          >
            <torusGeometry args={[1.38, 0.15, 6, 16]} />
          </mesh>
          {mod.greenhouse ? null : (
            [-0.7, 1.15].map((offset) => (
              <mesh key={offset} position={[offset, 0.7, 1.22]} material={a.windowMat}>
                <sphereGeometry args={[0.13, 10, 8]} />
              </mesh>
            ))
          )}
          {mod.airlock ? (
            <mesh position={[-mod.length / 2 + 0.2, 1.12, 0]} material={a.white} castShadow>
              <cylinderGeometry args={[1.0, 1.02, 2.0, 16]} />
            </mesh>
          ) : null}
        </group>
      ))}
      {[-6.45, 6.65].map((x) => (
        <mesh
          key={x}
          position={[x, 0.82, MODULES[0].z]}
          rotation={[0, 0, Math.PI / 2]}
          material={a.white}
          castShadow={!mobile}
        >
          <cylinderGeometry args={[0.55, 0.55, 3.5, 12]} />
        </mesh>
      ))}
      {!mobile ? (
        <pointLight
          position={[0.2, 2.4, MODULES[1].z]}
          color="#d5ecc0"
          intensity={2.4}
          distance={8}
          decay={2}
        />
      ) : null}
    </group>
  );
}

function SolarFarm({ mobile }: { mobile: boolean }) {
  const discs = useRef<THREE.InstancedMesh>(null);
  const posts = useRef<THREE.InstancedMesh>(null);
  const { solarMat, metal } = useAssets();

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    SOLAR.forEach((panel, index) => {
      dummy.position.set(panel.x, 3.2, panel.z);
      dummy.quaternion.copy(PANEL_QUAT);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      discs.current?.setMatrixAt(index, dummy.matrix);
      dummy.position.set(panel.x, 0.82, panel.z);
      dummy.quaternion.identity();
      dummy.updateMatrix();
      posts.current?.setMatrixAt(index, dummy.matrix);
    });
    if (discs.current) discs.current.instanceMatrix.needsUpdate = true;
    if (posts.current) posts.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      <instancedMesh
        ref={discs}
        args={[undefined, undefined, SOLAR.length]}
        material={solarMat}
        castShadow
      >
        <cylinderGeometry args={[1.6, 1.6, 0.06, 28]} />
      </instancedMesh>
      <instancedMesh
        ref={posts}
        args={[undefined, undefined, SOLAR.length]}
        material={metal}
        castShadow={!mobile}
      >
        <cylinderGeometry args={[0.065, 0.085, 1.64, 6]} />
      </instancedMesh>
    </group>
  );
}

function Comms() {
  const { white, metal, gold } = useAssets();
  return (
    <group>
      <group position={[TOWER.x, 0, TOWER.z]}>
        <mesh position={[0, 4.15, 0]} material={white} castShadow>
          <cylinderGeometry args={[0.22, 0.36, 8.3, 8]} />
        </mesh>
        <mesh position={[0, 7.85, 0]} material={metal}>
          <boxGeometry args={[1.35, 0.07, 1.35]} />
        </mesh>
        <mesh position={[0, 8.85, 0]} material={metal}>
          <cylinderGeometry args={[0.02, 0.02, 1.5, 5]} />
        </mesh>
        <mesh position={[0.4, 8.35, 0]} material={metal}>
          <cylinderGeometry args={[0.015, 0.015, 0.9, 4]} />
        </mesh>
      </group>
      <group position={[DISH.x, 0, DISH.z]}>
        <mesh position={[0, 1.45, 0]} material={metal} castShadow>
          <cylinderGeometry args={[0.07, 0.1, 2.9, 8]} />
        </mesh>
        <mesh
          position={[0.1, 2.95, 0.05]}
          rotation={[0.9, 0.35, 0.05]}
          material={white}
          castShadow
        >
          <sphereGeometry args={[1.05, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2.35]} />
        </mesh>
      </group>
      <group position={[CABINET.x, 0, CABINET.z]}>
        <mesh position={[0, 0.62, 0]} material={white} castShadow>
          <boxGeometry args={[2.1, 1.24, 1.4]} />
        </mesh>
        <mesh position={[0, 1.28, 0]} material={gold}>
          <boxGeometry args={[1.95, 0.07, 1.22]} />
        </mesh>
        <mesh position={[0, 0.58, 0.71]} material={metal}>
          <boxGeometry args={[1.55, 0.72, 0.04]} />
        </mesh>
      </group>
    </group>
  );
}

function Astronaut({
  position,
  yaw,
  cast,
}: {
  position: [number, number, number];
  yaw: number;
  cast: boolean;
}) {
  const { suit, visor, metal } = useAssets();
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[-0.09, 0.4, 0]} material={suit} castShadow={cast}>
        <cylinderGeometry args={[0.075, 0.085, 0.58, 7]} />
      </mesh>
      <mesh position={[0.09, 0.4, 0.03]} material={suit} castShadow={cast}>
        <cylinderGeometry args={[0.075, 0.085, 0.58, 7]} />
      </mesh>
      <mesh position={[-0.09, 0.08, 0.03]} material={suit}>
        <boxGeometry args={[0.11, 0.07, 0.2]} />
      </mesh>
      <mesh position={[0.09, 0.08, 0.05]} material={suit}>
        <boxGeometry args={[0.11, 0.07, 0.2]} />
      </mesh>
      <mesh position={[0, 1.02, 0]} material={suit} castShadow={cast}>
        <capsuleGeometry args={[0.18, 0.34, 3, 8]} />
      </mesh>
      <mesh position={[0, 1.08, -0.16]} material={metal} castShadow={cast}>
        <boxGeometry args={[0.28, 0.38, 0.16]} />
      </mesh>
      <mesh position={[0, 1.48, 0]} material={suit}>
        <cylinderGeometry args={[0.07, 0.08, 0.1, 6]} />
      </mesh>
      <mesh position={[0, 1.64, 0.02]} material={suit} castShadow={cast}>
        <sphereGeometry args={[0.14, 14, 12]} />
      </mesh>
      <mesh position={[0, 1.645, 0.1]} scale={[1.05, 0.72, 0.42]} material={visor}>
        <sphereGeometry args={[0.11, 12, 10]} />
      </mesh>
      <Rod
        a={[-0.18, 1.28, 0]}
        b={[-0.24, 0.9, 0.08]}
        radius={0.045}
        material={suit}
        castShadow={cast}
      />
      <Rod
        a={[0.18, 1.28, 0]}
        b={[0.22, 0.92, 0.1]}
        radius={0.045}
        material={suit}
        castShadow={cast}
      />
    </group>
  );
}

function Crew({ mobile }: { mobile: boolean }) {
  const { white, suit, rubber, metal } = useAssets();
  const cast = !mobile;
  const wheels: Array<[number, number]> = [
    [-0.72, 0.52],
    [0.78, 0.52],
    [-0.72, -0.52],
    [0.78, -0.52],
  ];
  return (
    <group>
      <group position={[ROVER.x, 0, ROVER.z]} rotation={[0, ROVER.yaw, 0]}>
        <mesh position={[0.05, 0.76, 0]} material={white} castShadow={cast}>
          <boxGeometry args={[2.2, 0.34, 1.08]} />
        </mesh>
        <mesh position={[-0.92, 0.92, 0]} material={white} castShadow={cast}>
          <boxGeometry args={[0.58, 0.46, 1.02]} />
        </mesh>
        {[0.22, -0.22].map((z) => (
          <group key={z}>
            <mesh position={[0.28, 0.96, z]} material={suit}>
              <boxGeometry args={[0.4, 0.1, 0.36]} />
            </mesh>
            <mesh position={[0.22, 1.14, z * 0.35]} material={suit}>
              <boxGeometry args={[0.38, 0.28, 0.07]} />
            </mesh>
          </group>
        ))}
        {wheels.map(([x, z]) => (
          <mesh
            key={`${x}-${z}`}
            position={[x, 0.38, z]}
            rotation={[0, 0, Math.PI / 2]}
            material={rubber}
            castShadow={cast}
          >
            <cylinderGeometry args={[0.38, 0.38, 0.24, 12]} />
          </mesh>
        ))}
        <Rod a={[0.2, 1.02, 0]} b={[1.05, 1.28, 0]} radius={0.025} material={metal} />
      </group>
      {CREW.map((person) => (
        <Astronaut
          key={`${person.x}-${person.z}`}
          position={[person.x, 0, person.z]}
          yaw={person.yaw}
          cast={cast}
        />
      ))}
    </group>
  );
}

function NationalFlag({ mobile }: { mobile: boolean }) {
  const { cloth, flagMat, pole, sleeve, metal } = useAssets();
  const cast = !mobile;
  return (
    <group position={[FLAG.x, 0, FLAG.z]}>
      <mesh position={[0, FLAG_POLE_H / 2, 0]} material={pole} castShadow={cast}>
        <cylinderGeometry args={[0.028, 0.032, FLAG_POLE_H, 8]} />
      </mesh>
      <mesh position={[0, 0.025, 0]} material={metal}>
        <cylinderGeometry args={[0.11, 0.13, 0.05, 10]} />
      </mesh>
      <mesh position={[0, FLAG_POLE_H - 0.16, 0]} material={sleeve}>
        <cylinderGeometry args={[0.045, 0.045, 0.2, 8]} />
      </mesh>
      <mesh
        position={[FLAG_W / 2, FLAG_POLE_H - 0.012, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={pole}
        castShadow={cast}
      >
        <cylinderGeometry args={[0.011, 0.011, FLAG_W, 6]} />
      </mesh>
      <mesh
        geometry={cloth}
        material={flagMat}
        position={[FLAG_W / 2, FLAG_POLE_H - FLAG_H / 2 - 0.012, 0]}
        castShadow={cast}
        dispose={null}
      />
    </group>
  );
}

export function LunarWorld({ mobile }: { mobile: boolean }) {
  const assets = useMemo(() => buildAssets(), []);
  useEffect(() => {
    return () => {
      for (const tex of assets.textures) tex.dispose();
      for (const geo of assets.geometries) geo.dispose();
      for (const mat of assets.materials) {
        mat.dispose();
      }
    };
  }, [assets]);

  return (
    <AssetContext.Provider value={assets}>
      <Stars mobile={mobile} />
      <Earth />
      <Ground />
      <Pad />
      <Lanyue mobile={mobile} />
      <Eggs />
      <Greenhouse mobile={mobile} />
      <SolarFarm mobile={mobile} />
      <Comms />
      <Crew mobile={mobile} />
      <NationalFlag mobile={mobile} />
    </AssetContext.Provider>
  );
}

export function LunarLights({ mobile }: { mobile: boolean }) {
  return (
    <>
      <ambientLight intensity={0.028} color="#c5d0dc" />
      <directionalLight
        position={[100, 15, 38]}
        intensity={4.4}
        color="#fff1df"
        castShadow
        shadow-mapSize-width={mobile ? 1024 : 2048}
        shadow-mapSize-height={mobile ? 1024 : 2048}
        shadow-camera-near={8}
        shadow-camera-far={280}
        shadow-camera-left={-95}
        shadow-camera-right={95}
        shadow-camera-top={95}
        shadow-camera-bottom={-95}
        shadow-bias={-0.00035}
        shadow-normalBias={0.045}
      />
      <directionalLight position={[-60, 22, -90]} intensity={0.07} color="#b7c6d8" />
    </>
  );
}
