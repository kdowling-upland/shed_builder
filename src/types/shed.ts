export type RoofStyle = 'gable' | 'lean-to' | 'gambrel' | 'hip';
export type FoundationType = 'skids' | 'concrete-blocks' | 'gravel-pad' | 'concrete-slab';
export type SidingMaterial = 't1-11' | 'lp-smartside' | 'vinyl' | 'cedar' | 'board-and-batten';
export type OpeningType = 'single-door' | 'double-door' | 'window' | 'loft-door';
export type WallId = 'front' | 'back' | 'left' | 'right';
export type LumberSize = '2x4' | '2x6' | '2x8' | '2x10' | '2x12';

export interface Opening {
  id: string;
  type: OpeningType;
  width: number;   // inches
  height: number;  // inches
  wall: WallId;
  position: number; // inches from left edge of wall
}

export interface RoofConfig {
  style: RoofStyle;
  pitch: number;       // rise per 12 run (e.g., 4, 6, 8)
  overhang: number;    // inches
}

export interface FramingConfig {
  studSpacing: 16 | 24;
  joistSpacing: 16 | 24;
  rafterSpacing: 16 | 24;
  studSize: '2x4' | '2x6';
  joistSize: '2x6' | '2x8' | '2x10';
  rafterSize: '2x4' | '2x6' | '2x8';
}

export interface ShedDesign {
  name: string;
  width: number;   // feet
  length: number;  // feet
  wallHeight: number; // feet
  roof: RoofConfig;
  foundation: FoundationType;
  framing: FramingConfig;
  siding: SidingMaterial;
  openings: Opening[];
}
