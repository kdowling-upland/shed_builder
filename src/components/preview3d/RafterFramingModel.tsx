import { useMemo } from 'react';
import type { RoofConfig, FramingConfig } from '../../types/shed.ts';
import { gambrelAngles } from '../../engine/geometry/utils.ts';

interface RafterFramingModelProps {
  widthFt: number;
  lengthFt: number;
  wallHeight: number;
  roof: RoofConfig;
  framing: FramingConfig;
}

const LUMBER_COLOR = '#C8A96E';
const LUMBER_ROUGHNESS = 0.85;
const THICKNESS = 1.5 / 12; // 1.5" actual for all 2x lumber

function rafterDepth(size: '2x4' | '2x6' | '2x8'): number {
  switch (size) {
    case '2x4': return 3.5 / 12;
    case '2x6': return 5.5 / 12;
    case '2x8': return 7.25 / 12;
  }
}

/** A single rafter beam: a box positioned at its midpoint and rotated to follow the slope.
 *  Offset perpendicular to the slope so the top face sits flush under the roof panel. */
function Rafter({ x, y, z, slopeLen, depth, rotZ }: {
  x: number; y: number; z: number;
  slopeLen: number; depth: number; rotZ: number;
}) {
  // Shift center perpendicular to slope so top face sits just under the roof panel
  const GAP = 0.02; // small clearance to avoid z-fighting with roof surface
  const offset = depth / 2 + GAP;
  const ox = x + Math.sin(rotZ) * offset;
  const oy = y - Math.cos(rotZ) * offset;
  return (
    <mesh position={[ox, oy, z]} rotation={[0, 0, rotZ]}>
      <boxGeometry args={[slopeLen, depth, THICKNESS]} />
      <meshStandardMaterial color={LUMBER_COLOR} roughness={LUMBER_ROUGHNESS} />
    </mesh>
  );
}

export function RafterFramingModel({ widthFt, lengthFt, wallHeight, roof, framing }: RafterFramingModelProps) {
  const spacingFt = framing.rafterSpacing / 12;
  const depth = rafterDepth(framing.rafterSize);
  const PLATE_OFFSET = 0.15; // match RoofModel
  const h = wallHeight + PLATE_OFFSET;

  const rafters = useMemo(() => {
    const items: Array<{
      x: number; y: number; z: number;
      slopeLen: number; depth: number; rotZ: number;
    }> = [];

    // Generate rafter z positions along the length, inset from walls to avoid bleed-through
    const WALL_INSET = 0.3; // match wall thickness
    const zStart = WALL_INSET;
    const zEnd = lengthFt - WALL_INSET;
    const zPositions: number[] = [];
    for (let z = zStart; z <= zEnd; z += spacingFt) {
      zPositions.push(Math.min(z, zEnd));
      if (z >= zEnd) break;
    }
    if (zPositions[zPositions.length - 1] < zEnd - 0.01) {
      zPositions.push(zEnd);
    }

    switch (roof.style) {
      case 'gable': {
        const halfW = widthFt / 2;
        const rise = (halfW * roof.pitch) / 12;
        const slopeLen = Math.sqrt(halfW * halfW + rise * rise);
        const angle = Math.atan2(rise, halfW);

        for (const z of zPositions) {
          // Left rafter: eave at x=0 up to ridge at x=halfW
          items.push({
            x: halfW / 2, y: h + rise / 2, z,
            slopeLen, depth, rotZ: angle,
          });
          // Right rafter: eave at x=widthFt down to ridge at x=halfW
          items.push({
            x: widthFt - halfW / 2, y: h + rise / 2, z,
            slopeLen, depth, rotZ: -angle,
          });
        }
        break;
      }

      case 'lean-to': {
        const rise = (widthFt * roof.pitch) / 12;
        const slopeLen = Math.sqrt(widthFt * widthFt + rise * rise);
        const angle = Math.atan2(rise, widthFt);

        for (const z of zPositions) {
          items.push({
            x: widthFt / 2, y: h + rise / 2, z,
            slopeLen, depth, rotZ: angle,
          });
        }
        break;
      }

      case 'gambrel': {
        const { lowerRad, upperRad } = gambrelAngles(roof.pitch);
        const qw = widthFt / 4;
        const halfW = widthFt / 2;
        const lowerRise = qw * Math.tan(lowerRad);
        const upperRise = qw * Math.tan(upperRad);
        const midH = h + lowerRise;

        const lowerLen = Math.sqrt(qw * qw + lowerRise * lowerRise);
        const upperLen = Math.sqrt(qw * qw + upperRise * upperRise);

        for (const z of zPositions) {
          // Left lower
          items.push({
            x: qw / 2, y: h + lowerRise / 2, z,
            slopeLen: lowerLen, depth, rotZ: lowerRad,
          });
          // Left upper
          items.push({
            x: qw + qw / 2, y: midH + upperRise / 2, z,
            slopeLen: upperLen, depth, rotZ: upperRad,
          });
          // Right lower
          items.push({
            x: widthFt - qw / 2, y: h + lowerRise / 2, z,
            slopeLen: lowerLen, depth, rotZ: -lowerRad,
          });
          // Right upper
          items.push({
            x: halfW + qw / 2, y: midH + upperRise / 2, z,
            slopeLen: upperLen, depth, rotZ: -upperRad,
          });
        }
        break;
      }

      case 'hip': {
        const halfW = widthFt / 2;
        const rise = (halfW * roof.pitch) / 12;
        const peak = h + rise;
        const slopeLen = Math.sqrt(halfW * halfW + rise * rise);
        const angle = Math.atan2(rise, halfW);
        const ridgeFrontZ = halfW;
        const ridgeBackZ = halfW + Math.max(0, lengthFt - widthFt);

        for (const z of zPositions) {
          // In the hip region, rafters shorten as they approach the ends
          if (z < ridgeFrontZ) {
            // Front hip region: rafters get shorter toward z=0
            const frac = z / ridgeFrontZ;
            const ridgeX = halfW;
            const ridgeY = peak;
            // Rafter meets the hip line, not the full ridge
            const hipY = h + rise * frac;
            const localRise = hipY - h;
            const localLen = Math.sqrt(halfW * halfW + localRise * localRise);
            const localAngle = Math.atan2(localRise, halfW);
            items.push({
              x: halfW / 2, y: h + localRise / 2, z,
              slopeLen: localLen, depth, rotZ: localAngle,
            });
            items.push({
              x: widthFt - halfW / 2, y: h + localRise / 2, z,
              slopeLen: localLen, depth, rotZ: -localAngle,
            });
          } else if (z > ridgeBackZ) {
            // Back hip region
            const frac = (lengthFt - z) / (lengthFt - ridgeBackZ);
            const localRise = rise * frac;
            const localLen = Math.sqrt(halfW * halfW + localRise * localRise);
            const localAngle = Math.atan2(localRise, halfW);
            items.push({
              x: halfW / 2, y: h + localRise / 2, z,
              slopeLen: localLen, depth, rotZ: localAngle,
            });
            items.push({
              x: widthFt - halfW / 2, y: h + localRise / 2, z,
              slopeLen: localLen, depth, rotZ: -localAngle,
            });
          } else {
            // Full-height rafters in the ridge region
            items.push({
              x: halfW / 2, y: h + rise / 2, z,
              slopeLen, depth, rotZ: angle,
            });
            items.push({
              x: widthFt - halfW / 2, y: h + rise / 2, z,
              slopeLen, depth, rotZ: -angle,
            });
          }
        }
        break;
      }
    }

    return items;
  }, [widthFt, lengthFt, wallHeight, roof, framing, spacingFt, depth, h]);

  // Ridge board dimensions (offset down by same GAP to stay under roof surface)
  const RIDGE_GAP = 0.02;
  const WALL_INSET = 0.3;
  const ridge = useMemo(() => {
    const ridgeDepth = depth; // same depth as rafters
    const ridgeLen = lengthFt - 2 * WALL_INSET; // inset from walls
    switch (roof.style) {
      case 'gable': {
        const halfW = widthFt / 2;
        const rise = (halfW * roof.pitch) / 12;
        const peak = h + rise;
        return { x: halfW, y: peak - ridgeDepth - RIDGE_GAP, z: lengthFt / 2, len: ridgeLen, depth: ridgeDepth };
      }
      case 'lean-to':
        // No ridge board for lean-to (it's a ledger board against the high wall)
        return null;
      case 'gambrel': {
        const { lowerRad, upperRad } = gambrelAngles(roof.pitch);
        const qw = widthFt / 4;
        const halfW = widthFt / 2;
        const lowerRise = qw * Math.tan(lowerRad);
        const upperRise = qw * Math.tan(upperRad);
        const peak = h + lowerRise + upperRise;
        return { x: halfW, y: peak - ridgeDepth - RIDGE_GAP, z: lengthFt / 2, len: ridgeLen, depth: ridgeDepth };
      }
      case 'hip': {
        const halfW = widthFt / 2;
        const rise = (halfW * roof.pitch) / 12;
        const peak = h + rise;
        const ridgeLen = Math.max(0, lengthFt - widthFt);
        const ridgeFrontZ = halfW;
        return {
          x: halfW, y: peak - ridgeDepth - RIDGE_GAP,
          z: ridgeFrontZ + ridgeLen / 2, len: ridgeLen, depth: ridgeDepth,
        };
      }
    }
  }, [widthFt, lengthFt, roof, h, depth]);

  return (
    <group>
      {/* Rafters */}
      {rafters.map((r, i) => (
        <Rafter key={i} {...r} />
      ))}

      {/* Ridge board */}
      {ridge && ridge.len > 0 && (
        <mesh position={[ridge.x, ridge.y, ridge.z]}>
          <boxGeometry args={[THICKNESS, ridge.depth, ridge.len]} />
          <meshStandardMaterial color={LUMBER_COLOR} roughness={LUMBER_ROUGHNESS} />
        </mesh>
      )}
    </group>
  );
}
