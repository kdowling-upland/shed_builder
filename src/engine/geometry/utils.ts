export function feetToMeters(feet: number): number {
  return feet * 0.3048;
}

export function inchesToFeet(inches: number): number {
  return inches / 12;
}

export function degreesFromPitch(pitch: number): number {
  return Math.atan(pitch / 12) * (180 / Math.PI);
}

export function radiansFromPitch(pitch: number): number {
  return Math.atan(pitch / 12);
}

/**
 * Derive gambrel slope angles from the user's roof pitch.
 * The pitch controls the upper (shallower) slope; the lower slope is its
 * complement, capped at 60° to prevent extreme geometry at low pitch values.
 * 60° is the most common lower-slope angle in real gambrel construction.
 *
 * Returns { lowerRad, upperRad } — angles from horizontal in radians.
 */
export function gambrelAngles(pitch: number): { lowerRad: number; upperRad: number } {
  const upperRad = Math.atan(pitch / 12);
  // Lower slope is the complement, but capped at 60° (π/3) so that low-pitch
  // values don't produce near-vertical slopes with enormous tan() values.
  const lowerRad = Math.min(Math.PI / 2 - upperRad, Math.PI / 3);
  return { lowerRad, upperRad };
}
