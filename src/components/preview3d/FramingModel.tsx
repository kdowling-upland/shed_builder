import { useMemo } from 'react';
import type { Opening, WallId, FramingConfig } from '../../types/shed.ts';

interface FramingModelProps {
  wall: WallId;
  widthFt: number;
  lengthFt: number;
  heightFt: number;
  openings: Opening[];
  framing: FramingConfig;
}

const WALL_THICKNESS = 0.3;
const LUMBER_COLOR = '#C8A96E';
const LUMBER_ROUGHNESS = 0.85;

/** Actual lumber dimensions in feet (nominal → actual) */
function studDepth(size: '2x4' | '2x6'): number {
  return size === '2x4' ? 3.5 / 12 : 5.5 / 12;
}

const STUD_THICKNESS = 1.5 / 12; // 1.5" actual thickness for all 2x lumber

export function FramingModel({ wall, widthFt, lengthFt, heightFt, openings, framing }: FramingModelProps) {
  const isFrontBack = wall === 'front' || wall === 'back';
  // Framing is always inset so it doesn't protrude past the perpendicular wall panels
  const wallLength = isFrontBack ? widthFt - 2 * WALL_THICKNESS : lengthFt - 2 * WALL_THICKNESS;
  const wallOpenings = openings.filter((o) => o.wall === wall);
  const spacingFt = framing.studSpacing / 12;
  const depth = studDepth(framing.studSize);
  const plateHeight = STUD_THICKNESS; // top and bottom plates are laid flat

  // Framing is inset by WALL_THICKNESS on both ends so it sits inside the panel envelope
  const T = WALL_THICKNESS;
  const position = useMemo((): [number, number, number] => {
    switch (wall) {
      case 'front': return [T, 0, 0];
      case 'back': return [widthFt - T, 0, lengthFt];
      case 'left': return [0, 0, lengthFt - T];
      case 'right': return [widthFt, 0, T];
    }
  }, [wall, widthFt, lengthFt]);

  const rotation = useMemo((): [number, number, number] => {
    switch (wall) {
      case 'front': return [0, 0, 0];
      case 'back': return [0, Math.PI, 0];
      case 'left': return [0, Math.PI / 2, 0];
      case 'right': return [0, -Math.PI / 2, 0];
    }
  }, [wall]);

  // Build stud positions, skipping where openings are
  const studs = useMemo(() => {
    const studPositions: number[] = [];
    const studHeight = heightFt - 2 * plateHeight;

    for (let x = 0; x <= wallLength; x += spacingFt) {
      // Clamp last stud to wall end
      const sx = Math.min(x, wallLength);
      studPositions.push(sx);
      if (sx === wallLength) break;
    }
    // Ensure end stud
    if (studPositions[studPositions.length - 1] < wallLength - 0.01) {
      studPositions.push(wallLength);
    }

    // Filter out studs that fall inside openings, but keep king/trimmer studs at edges
    const result: Array<{ x: number; y: number; h: number }> = [];

    for (const sx of studPositions) {
      let insideOpening = false;
      for (const op of wallOpenings) {
        const ox = op.position / 12;
        const ow = op.width / 12;
        // If stud center is inside the opening (with small margin), skip it
        if (sx > ox + STUD_THICKNESS && sx < ox + ow - STUD_THICKNESS) {
          insideOpening = true;
          break;
        }
      }
      if (!insideOpening) {
        result.push({ x: sx, y: plateHeight + studHeight / 2, h: studHeight });
      }
    }

    // Add king studs and headers/sills for each opening
    for (const op of wallOpenings) {
      const ox = op.position / 12;
      const ow = op.width / 12;

      // King studs at opening edges
      result.push({ x: ox, y: plateHeight + studHeight / 2, h: studHeight });
      result.push({ x: ox + ow, y: plateHeight + studHeight / 2, h: studHeight });
    }

    return result;
  }, [wallLength, spacingFt, heightFt, plateHeight, wallOpenings]);

  // Headers and sills for openings
  const headers = useMemo(() => {
    const items: Array<{ x: number; y: number; w: number }> = [];
    for (const op of wallOpenings) {
      const ox = op.position / 12;
      const ow = op.width / 12;
      const oh = op.height / 12;
      const oy = op.type === 'window' ? 3 : 0;

      // Header above opening
      items.push({ x: ox + ow / 2, y: oy + oh + plateHeight / 2, w: ow + STUD_THICKNESS * 2 });

      // Sill below window
      if (op.type === 'window') {
        items.push({ x: ox + ow / 2, y: oy - plateHeight / 2, w: ow + STUD_THICKNESS * 2 });
      }
    }
    return items;
  }, [wallOpenings, plateHeight]);

  // Z offset: framing sits on the inside face of the wall (behind the extrusion)
  const zOffset = WALL_THICKNESS + depth / 2;

  return (
    <group position={position} rotation={rotation}>
      {/* Bottom plate */}
      <mesh position={[wallLength / 2, plateHeight / 2, zOffset]}>
        <boxGeometry args={[wallLength, plateHeight, depth]} />
        <meshStandardMaterial color={LUMBER_COLOR} roughness={LUMBER_ROUGHNESS} />
      </mesh>

      {/* Top plate (double) */}
      <mesh position={[wallLength / 2, heightFt - plateHeight / 2, zOffset]}>
        <boxGeometry args={[wallLength, plateHeight, depth]} />
        <meshStandardMaterial color={LUMBER_COLOR} roughness={LUMBER_ROUGHNESS} />
      </mesh>
      <mesh position={[wallLength / 2, heightFt - plateHeight * 1.5, zOffset]}>
        <boxGeometry args={[wallLength, plateHeight, depth]} />
        <meshStandardMaterial color={'#BA9B60'} roughness={LUMBER_ROUGHNESS} />
      </mesh>

      {/* Studs */}
      {studs.map((stud, i) => (
        <mesh key={`stud${i}`} position={[stud.x, stud.y, zOffset]}>
          <boxGeometry args={[STUD_THICKNESS, stud.h, depth]} />
          <meshStandardMaterial color={LUMBER_COLOR} roughness={LUMBER_ROUGHNESS} />
        </mesh>
      ))}

      {/* Headers and sills */}
      {headers.map((hdr, i) => (
        <mesh key={`hdr${i}`} position={[hdr.x, hdr.y, zOffset]}>
          <boxGeometry args={[hdr.w, STUD_THICKNESS, depth]} />
          <meshStandardMaterial color={LUMBER_COLOR} roughness={LUMBER_ROUGHNESS} />
        </mesh>
      ))}
    </group>
  );
}
