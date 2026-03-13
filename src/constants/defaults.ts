import type { ShedDesign } from '../types/shed.ts';

export const DEFAULT_SHED: ShedDesign = {
  name: 'My Shed',
  width: 10,
  length: 12,
  wallHeight: 8,
  roof: {
    style: 'gable',
    pitch: 6,
    overhang: 12,
  },
  foundation: 'concrete-blocks',
  framing: {
    studSpacing: 16,
    joistSpacing: 16,
    rafterSpacing: 24,
    studSize: '2x4',
    joistSize: '2x8',
    rafterSize: '2x6',
  },
  siding: 't1-11',
  openings: [
    {
      id: 'door-1',
      type: 'double-door',
      width: 64,
      height: 78,
      wall: 'front',
      position: 28,
    },
    {
      id: 'window-1',
      type: 'window',
      width: 36,
      height: 36,
      wall: 'left',
      position: 54,
    },
  ],
};

export const DIMENSION_LIMITS = {
  width: { min: 6, max: 24 },
  length: { min: 6, max: 40 },
  wallHeight: { min: 7, max: 12 },
  pitch: { min: 2, max: 12 },
  overhang: { min: 0, max: 24 },
};

export const OPENING_DEFAULTS: Record<string, { width: number; height: number }> = {
  'single-door': { width: 36, height: 78 },
  'double-door': { width: 64, height: 78 },
  'window': { width: 36, height: 36 },
  'loft-door': { width: 48, height: 48 },
};
