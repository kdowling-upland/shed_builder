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
 * Both slopes scale with pitch so the full gambrel shape responds to changes.
 * The lower slope receives 75% of the total rise and the upper slope 25%,
 * producing the characteristic steep-lower / shallow-upper barn profile.
 * The total peak height matches an equivalent gable at the same pitch.
 *
 * Returns { lowerRad, upperRad } — angles from horizontal in radians.
 */
export function gambrelAngles(pitch: number): { lowerRad: number; upperRad: number } {
  // With quarter-width runs and a 75/25 rise split the width cancels out:
  //   lowerRad = atan(pitch / 8),  upperRad = atan(pitch / 24)
  const lowerRad = Math.atan(pitch / 8);
  const upperRad = Math.atan(pitch / 24);
  return { lowerRad, upperRad };
}
