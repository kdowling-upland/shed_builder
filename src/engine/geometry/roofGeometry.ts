import type { RoofConfig } from '../../types/shed.ts';
import { gambrelAngles } from './utils.ts';

export interface GableRoofPoints {
  ridgeHeight: number;
  leftEave: [number, number];
  rightEave: [number, number];
  peak: [number, number];
}

export function getGableRoofPoints(width: number, wallHeight: number, roof: RoofConfig): GableRoofPoints {
  const halfWidth = width / 2;
  const rise = (halfWidth * roof.pitch) / 12;
  const ridgeHeight = wallHeight + rise;

  return {
    ridgeHeight,
    leftEave: [0, wallHeight],
    rightEave: [width, wallHeight],
    peak: [halfWidth, ridgeHeight],
  };
}

export function getLeanToHeights(width: number, wallHeight: number, roof: RoofConfig) {
  const rise = (width * roof.pitch) / 12;
  return {
    highSide: wallHeight + rise,
    lowSide: wallHeight,
  };
}

export function getGambrelPoints(width: number, wallHeight: number, roof: RoofConfig) {
  const { lowerRad, upperRad } = gambrelAngles(roof.pitch);
  const halfWidth = width / 2;
  const lowerBreakX = width / 4;
  const lowerBreakHeight = wallHeight + lowerBreakX * Math.tan(lowerRad);
  const upperRun = halfWidth - lowerBreakX;
  const peakHeight = lowerBreakHeight + upperRun * Math.tan(upperRad);

  return {
    leftEave: [0, wallHeight] as [number, number],
    leftBreak: [lowerBreakX, lowerBreakHeight] as [number, number],
    peak: [halfWidth, peakHeight] as [number, number],
    rightBreak: [width - lowerBreakX, lowerBreakHeight] as [number, number],
    rightEave: [width, wallHeight] as [number, number],
    peakHeight,
  };
}

export function getRafterLength(halfSpan: number, pitch: number, overhangInches: number): number {
  const rise = (halfSpan * pitch) / 12;
  const run = Math.sqrt(halfSpan * halfSpan + rise * rise);
  return run + overhangInches / 12;
}
