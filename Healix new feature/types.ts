
export enum ShapeType {
  SPHERE = 'Sphere',
  HEART = 'Heart',
  FLOWER = 'Flower',
  DNA = 'DNA',
  SPIRAL = 'Spiral',
  SATURN = 'Saturn',
  BUDDHA = 'Buddha',
  FIREWORKS = 'Fireworks',
}

export enum ControlMode {
  HAND = 'Hand',
  AUDIO_BREATH = 'Audio Breath',
  VISUAL_BREATH = 'Visual Breath'
}

export const PARTICLE_COUNT = 4000; // Base count, actual vertices will be x5 due to trails
export const TRAIL_LENGTH = 5;

export interface HandData {
  tension: number; // 0.0 (Open) to 1.0 (Fist)
  isPresent: boolean;
}

export const PALETTES = [
  { name: 'Cyan', hex: 0x00ffff, css: '#00ffff' },
  { name: 'Magenta', hex: 0xff00ff, css: '#ff00ff' },
  { name: 'Gold', hex: 0xffd700, css: '#ffd700' },
  { name: 'Emerald', hex: 0x50c878, css: '#50c878' },
  { name: 'Lavender', hex: 0xe6e6fa, css: '#e6e6fa' },
];
