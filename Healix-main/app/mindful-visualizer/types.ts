export enum ShapeType {
  DNA = 'DNA',
  SPHERE = 'SPHERE',
  HEART = 'HEART',
  FLOWER = 'FLOWER',
  SPIRAL = 'SPIRAL',
  SATURN = 'SATURN',
  BUDDHA = 'BUDDHA',
  FIREWORKS = 'FIREWORKS'
}

export enum ControlMode {
  HAND = 'HAND',
  AUDIO_BREATH = 'AUDIO_BREATH',
  VISUAL_BREATH = 'VISUAL_BREATH'
}

export interface HandData {
  tension: number;
  isPresent: boolean;
}

export interface ColorPalette {
  name: string;
  hex: number;
  rgb: [number, number, number];
}

export const PALETTES: ColorPalette[] = [
  { name: 'Cyan', hex: 0x00ffff, rgb: [0, 255, 255] },
  { name: 'Magenta', hex: 0xff00ff, rgb: [255, 0, 255] },
  { name: 'Yellow', hex: 0xffff00, rgb: [255, 255, 0] },
  { name: 'Red', hex: 0xff0000, rgb: [255, 0, 0] },
  { name: 'Green', hex: 0x00ff00, rgb: [0, 255, 0] },
  { name: 'Blue', hex: 0x0000ff, rgb: [0, 0, 255] },
  { name: 'Orange', hex: 0xff8000, rgb: [255, 128, 0] },
  { name: 'Purple', hex: 0x8000ff, rgb: [128, 0, 255] }
];

// Particle system constants
export const PARTICLE_COUNT = 2000;
export const TRAIL_LENGTH = 5;