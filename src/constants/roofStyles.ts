import type { RoofStyle } from '../types/shed.ts';

export const ROOF_STYLE_LABELS: Record<RoofStyle, string> = {
  'gable': 'Gable',
  'lean-to': 'Lean-To (Shed)',
  'gambrel': 'Gambrel (Barn)',
  'hip': 'Hip',
};

export const ROOF_STYLE_DESCRIPTIONS: Record<RoofStyle, string> = {
  'gable': 'Classic triangular roof with two sloping sides',
  'lean-to': 'Single slope from high side to low side',
  'gambrel': 'Barn-style roof with two slopes per side',
  'hip': 'All four sides slope inward to a ridge',
};
