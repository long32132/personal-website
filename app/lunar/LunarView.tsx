"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CAM } from "./plan";
import { LunarLights, LunarWorld } from "./LunarWorld";

const start = new THREE.Vector3();
const end = new THREE.Vector3();
const lookA = new THREE.Vector3();
const lookB = new THREE.Vector3();
const pos = new THREE.Vector3();
const look = new THREE.Vector3();

function smootherstep(value: number) {
  const x = Math.min(1, Math.max(0, value));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

function readProgress() {
  const runway = document.querySelector(".lunar-runway");
  if (!runway) return 0;
  const total = runway.clientHeight - window.innerHeight;
  if (total <= 0) return 0;
  const scrolled = -runway.getBoundingClientRect().top;
  return Math.min(1, Math.max(0, scrolled / total));
}

function CameraRig({
  mobile,
  onReady,
}: {
  mobile: boolean;
  onReady: () => void;
}) {
  const { camera } = useThree();
  const progress = useRef(0);
  const frames = useRef(0);
  const revealed = useRef(false);

  useEffect(() => {
    const update = () => {
      progress.current = readProgress();
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useFrame(({ clock }) => {
    const preset = mobile ? CAM.mobile : CAM.desktop;
    const t = smootherstep(progress.current);
    start.fromArray(preset.start);
    end.fromArray(preset.end);
    pos.lerpVectors(start, end, t);
    const arc = Math.sin(Math.PI * t);
    pos.x += arc * (mobile ? 0.8 : 2.4);
    pos.y += arc * (mobile ? 1.2 : 2.2);
    const drift = 1 - t * 0.72;
    const time = clock.elapsedTime;
    pos.x += Math.sin(time * 0.12) * 1.35 * drift;
    pos.y += Math.sin(time * 0.08) * 0.18 * drift;
    pos.z += Math.cos(time * 0.1) * 1.05 * drift;
    lookA.fromArray(preset.startLook);
    lookB.fromArray(preset.endLook);
    look.lerpVectors(lookA, lookB, t);
    camera.position.copy(pos);
    camera.lookAt(look);

    frames.current += 1;
    if (frames.current === 2 && !revealed.current) {
      revealed.current = true;
      onReady();
    }
  });

  return null;
}

export default function LunarView({
  onReady,
  onLost,
}: {
  onReady: () => void;
  onLost: () => void;
}) {
  const [mobile, setMobile] = useState(() =>
    window.matchMedia("(max-width: 760px)").matches,
  );
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");
  const preset = mobile ? CAM.mobile : CAM.desktop;

  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const onChange = () => setMobile(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const runway = document.querySelector(".lunar-runway");
    if (!runway) return;
    const apply = (visible: boolean) => {
      setFrameloop(!document.hidden && visible ? "always" : "never");
    };
    const observer = new IntersectionObserver(([entry]) => {
      apply(entry.isIntersecting);
    });
    observer.observe(runway);
    const onVis = () => {
      const rect = runway.getBoundingClientRect();
      apply(rect.bottom > 0 && rect.top < window.innerHeight);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <Canvas
      className="lunar-canvas"
      style={{ position: "absolute", inset: 0 }}
      dpr={mobile ? 1 : [1, 1.5]}
      shadows={{ type: THREE.PCFSoftShadowMap, autoUpdate: false }}
      frameloop={frameloop}
      camera={{
        fov: preset.fov,
        near: 0.2,
        far: 1800,
        position: preset.start,
      }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#000000", 1);
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.shadowMap.autoUpdate = false;
        gl.shadowMap.needsUpdate = true;
        gl.domElement.tabIndex = -1;
        gl.domElement.addEventListener(
          "webglcontextlost",
          (event) => {
            event.preventDefault();
            onLost();
          },
          { once: true },
        );
      }}
    >
      <LunarLights mobile={mobile} />
      <LunarWorld mobile={mobile} />
      <CameraRig mobile={mobile} onReady={onReady} />
    </Canvas>
  );
}
