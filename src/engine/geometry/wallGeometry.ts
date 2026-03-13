import * as THREE from 'three';
import type { Opening } from '../../types/shed.ts';
import { gambrelAngles } from './utils.ts';

function cutOpenings(shape: THREE.Shape, openings: Opening[]): void {
  for (const opening of openings) {
    const ox = opening.position / 12; // inches to feet
    const oy = opening.type === 'window' ? 3 : 0; // windows at 3ft, doors at floor
    const ow = opening.width / 12;
    const oh = opening.height / 12;

    const hole = new THREE.Path();
    hole.moveTo(ox, oy);
    hole.lineTo(ox + ow, oy);
    hole.lineTo(ox + ow, oy + oh);
    hole.lineTo(ox, oy + oh);
    hole.lineTo(ox, oy);
    shape.holes.push(hole);
  }
}

/** Flat rectangular wall (used for hip side walls, gable side walls, etc.) */
export function createFlatWallShape(
  widthFt: number,
  heightFt: number,
  openings: Opening[],
): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(widthFt, 0);
  shape.lineTo(widthFt, heightFt);
  shape.lineTo(0, heightFt);
  shape.lineTo(0, 0);
  cutOpenings(shape, openings);
  return shape;
}

/** Gable wall: rectangle with a triangle on top (symmetric peak at center). */
export function createGableWallShape(
  widthFt: number,
  wallHeight: number,
  gableRise: number,
  openings: Opening[],
): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(widthFt, 0);
  shape.lineTo(widthFt, wallHeight);
  shape.lineTo(widthFt / 2, wallHeight + gableRise);
  shape.lineTo(0, wallHeight);
  shape.lineTo(0, 0);
  cutOpenings(shape, openings);
  return shape;
}

/** Gambrel (barn-style) wall: rectangle + lower steep break + upper shallow peak. */
export function createGambrelWallShape(
  widthFt: number,
  wallHeight: number,
  openings: Opening[],
  pitch: number = 6,
): THREE.Shape {
  const { lowerRad, upperRad } = gambrelAngles(pitch);
  const qw = widthFt / 4;
  const lowerRise = qw * Math.tan(lowerRad);
  const upperRise = qw * Math.tan(upperRad);
  const midH = wallHeight + lowerRise;
  const peakH = midH + upperRise;

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(widthFt, 0);
  shape.lineTo(widthFt, wallHeight);
  shape.lineTo(widthFt - qw, midH);
  shape.lineTo(widthFt / 2, peakH);
  shape.lineTo(qw, midH);
  shape.lineTo(0, wallHeight);
  shape.lineTo(0, 0);
  cutOpenings(shape, openings);
  return shape;
}

/** Lean-to front/back wall: trapezoid (left side shorter, right side taller). */
export function createLeanToFBWallShape(
  widthFt: number,
  leftHeight: number,
  rightHeight: number,
  openings: Opening[],
): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(widthFt, 0);
  shape.lineTo(widthFt, rightHeight);
  shape.lineTo(0, leftHeight);
  shape.lineTo(0, 0);
  cutOpenings(shape, openings);
  return shape;
}
