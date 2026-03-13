import {} from 'react';
import * as THREE from 'three';
import type { Opening, WallId } from '../../types/shed.ts';

interface OpeningModelProps {
  opening: Opening;
  shedWidth: number;
  shedLength: number;
  wallHeight: number;
}

// Must match WALL_THICKNESS in WallModel.tsx — front/back walls are inset by this amount
const WALL_THICKNESS = 0.3;
const TRIM_WIDTH = 0.25; // 3 inches
const TRIM_DEPTH = 0.06; // sits slightly proud of wall
const DOOR_DEPTH = 0.12; // ~1.5 inches thick

function getWallPosition(
  wall: WallId,
  shedWidth: number,
  shedLength: number,
  positionInches: number,
  widthInches: number,
  heightInches: number,
  type: string,
): { position: [number, number, number]; rotation: [number, number, number] } {
  const positionFt = positionInches / 12;
  const widthFt = widthInches / 12;
  const heightFt = heightInches / 12;
  const yOffset = type === 'window' ? 3 : 0;
  const centerX = positionFt + widthFt / 2;
  const centerY = yOffset + heightFt / 2;

  switch (wall) {
    case 'front':
      return { position: [centerX, centerY, -0.01], rotation: [0, 0, 0] };
    case 'back':
      return { position: [shedWidth - centerX, centerY, shedLength + 0.01], rotation: [0, Math.PI, 0] };
    case 'left':
      return { position: [-0.01, centerY, shedLength - WALL_THICKNESS - centerX], rotation: [0, Math.PI / 2, 0] };
    case 'right':
      return { position: [shedWidth + 0.01, centerY, WALL_THICKNESS + centerX], rotation: [0, -Math.PI / 2, 0] };
  }
}

/** Trim frame around an opening. Doors skip the bottom trim piece. */
function TrimFrame({ w, h, isDoor = false }: { w: number; h: number; isDoor?: boolean }) {
  const trimColor = '#E8DCC8';
  const d = TRIM_DEPTH;
  const t = TRIM_WIDTH;

  return (
    <group>
      {/* Top */}
      <mesh position={[0, h / 2 + t / 2, -d / 2]}>
        <boxGeometry args={[w + t * 2, t, d]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} />
      </mesh>
      {/* Bottom — only for windows */}
      {!isDoor && (
        <mesh position={[0, -h / 2 - t / 2, -d / 2]}>
          <boxGeometry args={[w + t * 2, t, d]} />
          <meshStandardMaterial color={trimColor} roughness={0.5} />
        </mesh>
      )}
      {/* Left */}
      <mesh position={[-w / 2 - t / 2, 0, -d / 2]}>
        <boxGeometry args={[t, h + (isDoor ? 0 : t * 2), d]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} />
      </mesh>
      {/* Right */}
      <mesh position={[w / 2 + t / 2, 0, -d / 2]}>
        <boxGeometry args={[t, h + (isDoor ? 0 : t * 2), d]} />
        <meshStandardMaterial color={trimColor} roughness={0.5} />
      </mesh>
    </group>
  );
}

/** Single door panel with cross-brace shed door detail.
 *  mirror flips hinges/handle so a pair can face inward for double doors. */
function DoorPanel({ w, h, mirror = false }: { w: number; h: number; mirror?: boolean }) {
  const hingeX = mirror ? w / 2 - 0.15 : -w / 2 + 0.15;
  const handleX = mirror ? -w / 2 + 0.25 : w / 2 - 0.25;
  const plankCount = Math.max(2, Math.round(w / 0.5));
  const plankW = w / plankCount;

  return (
    <group>
      {/* Door slab */}
      <mesh position={[0, 0, -DOOR_DEPTH / 2]}>
        <boxGeometry args={[w, h, DOOR_DEPTH]} />
        <meshStandardMaterial color="#8B6914" roughness={0.8} />
      </mesh>
      {/* Vertical plank grooves */}
      {Array.from({ length: plankCount - 1 }, (_, i) => {
        const px = -w / 2 + plankW * (i + 1);
        return (
          <mesh key={`groove${i}`} position={[px, 0, -(DOOR_DEPTH + 0.002)]}>
            <boxGeometry args={[0.025, h - 0.1, 0.01]} />
            <meshStandardMaterial color="#5A4008" roughness={0.9} />
          </mesh>
        );
      })}
      {/* Horizontal cross rails — top, middle, bottom */}
      {[-h / 2 + 0.25, 0, h / 2 - 0.25].map((ry, i) => (
        <mesh key={`rail${i}`} position={[0, ry, -(DOOR_DEPTH + 0.01)]}>
          <boxGeometry args={[w - 0.08, 0.3, 0.04]} />
          <meshStandardMaterial color="#7A5A10" roughness={0.75} />
        </mesh>
      ))}
      {/* Diagonal brace */}
      <mesh
        position={[0, 0, -(DOOR_DEPTH + 0.02)]}
        rotation={[0, 0, Math.atan2(h - 0.5, w - 0.08)]}
      >
        <boxGeometry args={[Math.sqrt((w - 0.08) ** 2 + (h - 0.5) ** 2), 0.25, 0.04]} />
        <meshStandardMaterial color="#7A5A10" roughness={0.75} />
      </mesh>
      {/* Hinges */}
      {[-h / 3, h / 3].map((hy, i) => (
        <mesh key={`hinge${i}`} position={[hingeX, hy, -(DOOR_DEPTH + 0.035)]}>
          <boxGeometry args={[0.25, 0.08, 0.02]} />
          <meshStandardMaterial color="#222" roughness={0.4} metalness={0.8} />
        </mesh>
      ))}
      {/* Door handle */}
      <mesh position={[handleX, 0, -(DOOR_DEPTH + 0.05)]}>
        <cylinderGeometry args={[0.04, 0.04, 0.12, 12]} />
        <meshStandardMaterial color="#333" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
}

/** Double door — two mirrored panels, handles toward center */
function DoubleDoorPanel({ w, h }: { w: number; h: number }) {
  const halfW = w / 2 - 0.02; // small gap between panels
  return (
    <group>
      <group position={[-w / 4, 0, 0]}>
        <DoorPanel w={halfW} h={h} />
      </group>
      <group position={[w / 4, 0, 0]}>
        <DoorPanel w={halfW} h={h} mirror />
      </group>
    </group>
  );
}

/** Window with glass panes and mullions */
function WindowPanel({ w, h }: { w: number; h: number }) {
  const mullionT = 0.06; // mullion thickness
  const frameT = 0.08; // outer frame thickness
  const cols = w > 2.5 ? 2 : 1;
  const rows = h > 2.5 ? 2 : 1;
  const innerW = w - frameT * 2;
  const innerH = h - frameT * 2;
  const paneW = (innerW - mullionT * (cols - 1)) / cols;
  const paneH = (innerH - mullionT * (rows - 1)) / rows;

  return (
    <group>
      {/* Sill (slightly wider, thicker at bottom) */}
      <mesh position={[0, -h / 2 - 0.04, -0.06]}>
        <boxGeometry args={[w + 0.15, 0.08, 0.15]} />
        <meshStandardMaterial color="#E8DCC8" roughness={0.5} />
      </mesh>
      {/* Outer frame (box with hole — approximated with 4 boards) */}
      {/* Top */}
      <mesh position={[0, h / 2 - frameT / 2, -0.04]}>
        <boxGeometry args={[w, frameT, 0.08]} />
        <meshStandardMaterial color="#DDD8CC" roughness={0.5} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -h / 2 + frameT / 2, -0.04]}>
        <boxGeometry args={[w, frameT, 0.08]} />
        <meshStandardMaterial color="#DDD8CC" roughness={0.5} />
      </mesh>
      {/* Left */}
      <mesh position={[-w / 2 + frameT / 2, 0, -0.04]}>
        <boxGeometry args={[frameT, h - frameT * 2, 0.08]} />
        <meshStandardMaterial color="#DDD8CC" roughness={0.5} />
      </mesh>
      {/* Right */}
      <mesh position={[w / 2 - frameT / 2, 0, -0.04]}>
        <boxGeometry args={[frameT, h - frameT * 2, 0.08]} />
        <meshStandardMaterial color="#DDD8CC" roughness={0.5} />
      </mesh>
      {/* Mullions */}
      {cols > 1 &&
        Array.from({ length: cols - 1 }, (_, i) => {
          const mx = -innerW / 2 + paneW * (i + 1) + mullionT * i;
          return (
            <mesh key={`mv${i}`} position={[mx, 0, -0.06]}>
              <boxGeometry args={[mullionT, innerH, 0.04]} />
              <meshStandardMaterial color="#DDD8CC" roughness={0.5} />
            </mesh>
          );
        })}
      {rows > 1 &&
        Array.from({ length: rows - 1 }, (_, i) => {
          const my = -innerH / 2 + paneH * (i + 1) + mullionT * i;
          return (
            <mesh key={`mh${i}`} position={[0, my, -0.06]}>
              <boxGeometry args={[innerW, mullionT, 0.04]} />
              <meshStandardMaterial color="#DDD8CC" roughness={0.5} />
            </mesh>
          );
        })}
      {/* Glass panes */}
      {Array.from({ length: cols * rows }, (_, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const px = -innerW / 2 + paneW / 2 + col * (paneW + mullionT);
        const py = -innerH / 2 + paneH / 2 + row * (paneH + mullionT);
        return (
          <mesh key={`glass${idx}`} position={[px, py, -0.03]}>
            <planeGeometry args={[paneW - 0.02, paneH - 0.02]} />
            <meshStandardMaterial
              color="#87CEEB"
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
              roughness={0.1}
              metalness={0.1}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** Loft door — simple plank door with cross brace */
function LoftDoorPanel({ w, h }: { w: number; h: number }) {
  return (
    <group>
      {/* Door slab */}
      <mesh position={[0, 0, -DOOR_DEPTH / 2]}>
        <boxGeometry args={[w, h, DOOR_DEPTH]} />
        <meshStandardMaterial color="#7A5C38" roughness={0.85} />
      </mesh>
      {/* Vertical plank lines */}
      {Array.from({ length: Math.floor(w / 0.5) }, (_, i) => {
        const px = -w / 2 + 0.5 * (i + 1);
        if (px >= w / 2) return null;
        return (
          <mesh key={i} position={[px, 0, -(DOOR_DEPTH + 0.005)]}>
            <boxGeometry args={[0.02, h - 0.1, 0.01]} />
            <meshStandardMaterial color="#5A3E20" roughness={0.9} />
          </mesh>
        );
      })}
      {/* Z-brace */}
      <mesh position={[0, 0, -(DOOR_DEPTH + 0.02)]} rotation={[0, 0, Math.atan2(h, w)]}>
        <boxGeometry args={[Math.sqrt(w * w + h * h) * 0.7, 0.15, 0.04]} />
        <meshStandardMaterial color="#5A3E20" roughness={0.85} />
      </mesh>
    </group>
  );
}

export function OpeningModel({ opening, shedWidth, shedLength, wallHeight }: OpeningModelProps) {
  const widthFt = opening.width / 12;
  const heightFt = opening.height / 12;

  const { position, rotation } = getWallPosition(
    opening.wall,
    shedWidth,
    shedLength,
    opening.position,
    opening.width,
    opening.height,
    opening.type,
  );

  void wallHeight;

  return (
    <group position={position} rotation={rotation}>
      <TrimFrame w={widthFt} h={heightFt} isDoor={opening.type !== 'window'} />
      {opening.type === 'single-door' && <DoorPanel w={widthFt} h={heightFt} />}
      {opening.type === 'double-door' && <DoubleDoorPanel w={widthFt} h={heightFt} />}
      {opening.type === 'window' && <WindowPanel w={widthFt} h={heightFt} />}
      {opening.type === 'loft-door' && <LoftDoorPanel w={widthFt} h={heightFt} />}
    </group>
  );
}
