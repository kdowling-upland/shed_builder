import type { ShedDesign, Opening, WallId } from '../types/shed.ts';
import { DIMENSION_LIMITS } from '../constants/defaults.ts';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateDesign(design: ShedDesign): ValidationError[] {
  const errors: ValidationError[] = [];

  if (design.width < DIMENSION_LIMITS.width.min || design.width > DIMENSION_LIMITS.width.max) {
    errors.push({ field: 'width', message: `Width must be between ${DIMENSION_LIMITS.width.min}' and ${DIMENSION_LIMITS.width.max}'` });
  }
  if (design.length < DIMENSION_LIMITS.length.min || design.length > DIMENSION_LIMITS.length.max) {
    errors.push({ field: 'length', message: `Length must be between ${DIMENSION_LIMITS.length.min}' and ${DIMENSION_LIMITS.length.max}'` });
  }
  if (design.wallHeight < DIMENSION_LIMITS.wallHeight.min || design.wallHeight > DIMENSION_LIMITS.wallHeight.max) {
    errors.push({ field: 'wallHeight', message: `Wall height must be between ${DIMENSION_LIMITS.wallHeight.min}' and ${DIMENSION_LIMITS.wallHeight.max}'` });
  }
  if (design.roof.pitch < DIMENSION_LIMITS.pitch.min || design.roof.pitch > DIMENSION_LIMITS.pitch.max) {
    errors.push({ field: 'pitch', message: `Roof pitch must be between ${DIMENSION_LIMITS.pitch.min} and ${DIMENSION_LIMITS.pitch.max}` });
  }
  if (design.roof.overhang < DIMENSION_LIMITS.overhang.min || design.roof.overhang > DIMENSION_LIMITS.overhang.max) {
    errors.push({ field: 'overhang', message: `Overhang must be between ${DIMENSION_LIMITS.overhang.min}" and ${DIMENSION_LIMITS.overhang.max}"` });
  }

  // Validate openings don't exceed wall dimensions or overlap
  for (const opening of design.openings) {
    const wallLen = getWallLengthInches(design, opening.wall);
    if (opening.position + opening.width > wallLen) {
      errors.push({ field: `opening-${opening.id}`, message: `${opening.type} extends past the ${opening.wall} wall` });
    }
    if (opening.position < 0) {
      errors.push({ field: `opening-${opening.id}`, message: `${opening.type} position cannot be negative` });
    }
  }

  // Check for overlapping openings on same wall
  const wallOpenings: Record<string, Opening[]> = {};
  for (const opening of design.openings) {
    if (!wallOpenings[opening.wall]) wallOpenings[opening.wall] = [];
    wallOpenings[opening.wall].push(opening);
  }
  for (const [wall, openings] of Object.entries(wallOpenings)) {
    const sorted = [...openings].sort((a, b) => a.position - b.position);
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (current.position + current.width > next.position) {
        errors.push({ field: `wall-${wall}`, message: `Overlapping openings on ${wall} wall` });
      }
    }
  }

  return errors;
}

function getWallLengthInches(design: ShedDesign, wall: WallId): number {
  return (wall === 'front' || wall === 'back' ? design.width : design.length) * 12;
}
