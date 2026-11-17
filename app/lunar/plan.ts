/** Site plan in meters. +Y up, +Z south (the camera approaches from the south). */

export const PAD = { x: 2, z: 0, r: 9 };

export const FLAG = { x: 10.4, z: 8.8 };
export const FLAG_W = 1.62;
export const FLAG_H = 1.08;
export const FLAG_POLE_H = 2.72;

export const ROVER = { x: 14.4, z: 3.6, yaw: -0.7 };

export const CREW = [
  { x: 12.15, z: 6.15, yaw: 2.35 },
  { x: 15.85, z: 5.35, yaw: 0.35 },
];

export const EGGS = [
  { x: -16.2, z: 6.6 },
  { x: -11.2, z: 10.2 },
  { x: -18.6, z: 10.6 },
  { x: -12.6, z: 2.8 },
  { x: -7.6, z: 6.0 },
];

export const MODULES = [
  { x: -12.4, z: 16.2, length: 7.2, greenhouse: false, airlock: true },
  { x: 0.2, z: 16.2, length: 8.6, greenhouse: true, airlock: false },
  { x: 12.4, z: 16.2, length: 7.2, greenhouse: false, airlock: false },
];

export const TOWER = { x: 2, z: -32 };
export const DISH = { x: 8.2, z: -26.6 };
export const CABINET = { x: -21.5, z: -11.5 };

/** Direction the circular arrays face: low south-east sun, still open to the southern camera. */
export const PANEL_NORMAL: [number, number, number] = [0.42, 0.16, 0.89];

export const SUN: [number, number, number] = [86, 18, 46];

export const SOLAR = Array.from({ length: 8 }, (_, i) => {
  const a = -Math.PI / 2 + (i - 3.5) * 0.23;
  const radius = 23.5;
  return {
    x: 2 + Math.cos(a) * radius,
    z: -1.5 + Math.sin(a) * radius,
  };
});

export const CAM = {
  desktop: {
    fov: 44,
    start: [-16, 16.6, 56] as [number, number, number],
    startLook: [-16, 3.2, 4] as [number, number, number],
    end: [13.2, 6.4, 23.5] as [number, number, number],
    endLook: [3.4, 1.55, 4.2] as [number, number, number],
  },
  mobile: {
    fov: 50,
    start: [0.5, 40, 58] as [number, number, number],
    startLook: [1, 0.3, 16] as [number, number, number],
    end: [8.2, 11.5, 22] as [number, number, number],
    endLook: [3.2, 2.4, 1.5] as [number, number, number],
  },
};
