import { useMemo } from 'react';
import * as THREE from 'three';
import type { Opening, WallId, RoofConfig, SidingMaterial } from '../../types/shed.ts';
import {
  createFlatWallShape,
  createGableWallShape,
  createGambrelWallShape,
  createLeanToFBWallShape,
} from '../../engine/geometry/wallGeometry.ts';
import { getSidingTexture } from '../../engine/geometry/textures.ts';

interface WallModelProps {
  wall: WallId;
  widthFt: number;
  lengthFt: number;
  heightFt: number;
  openings: Opening[];
  roof: RoofConfig;
  siding: SidingMaterial;
}

const WALL_THICKNESS = 0.3;

const SIDING_ROUGHNESS: Record<SidingMaterial, number> = {
  't1-11': 0.85,
  'lp-smartside': 0.6,
  'vinyl': 0.3,
  'cedar': 0.9,
  'board-and-batten': 0.8,
};

/** Edge/depth color per siding — should approximate the dominant siding colour
 *  so the panel thickness at corners doesn't look like exposed framing. */
const SIDING_EDGE_COLOR: Record<SidingMaterial, string> = {
  't1-11': '#B89858',        // slightly darker than the T1-11 base tan
  'lp-smartside': '#B0A480', // muted beige matching lap siding
  'vinyl': '#D8D5CC',        // off-white to match vinyl
  'cedar': '#8A4A28',        // dark reddish-brown matching cedar
  'board-and-batten': '#7A6348', // brown matching board-and-batten
};

export function WallModel({ wall, widthFt, lengthFt, heightFt, openings, roof, siding }: WallModelProps) {
  const wallOpenings = openings.filter((o) => o.wall === wall);

  const geometry = useMemo(() => {
    const isFrontBack = wall === 'front' || wall === 'back';
    // Side walls are narrowed to fit between the front/back walls so that the
    // front/back panels run the full building width and the corners look flush.
    const sideLength = lengthFt - 2 * WALL_THICKNESS;
    let shape: THREE.Shape;

    if (isFrontBack) {
      switch (roof.style) {
        case 'gable': {
          const rise = ((widthFt / 2) * roof.pitch) / 12;
          shape = createGableWallShape(widthFt, heightFt, rise, wallOpenings);
          break;
        }
        case 'gambrel': {
          shape = createGambrelWallShape(widthFt, heightFt, wallOpenings, roof.pitch);
          break;
        }
        case 'lean-to': {
          const rise = (widthFt * roof.pitch) / 12;
          // Back wall is rotated π so we swap the heights to keep the slope consistent
          if (wall === 'back') {
            shape = createLeanToFBWallShape(widthFt, heightFt + rise, heightFt, wallOpenings);
          } else {
            shape = createLeanToFBWallShape(widthFt, heightFt, heightFt + rise, wallOpenings);
          }
          break;
        }
        case 'hip':
        default: {
          shape = createFlatWallShape(widthFt, heightFt, wallOpenings);
          break;
        }
      }
    } else {
      // Side walls (left / right) — narrowed to fit between front/back panels
      if (roof.style === 'lean-to') {
        if (wall === 'left') {
          shape = createFlatWallShape(sideLength, heightFt, wallOpenings);
        } else {
          const rise = (widthFt * roof.pitch) / 12;
          shape = createFlatWallShape(sideLength, heightFt + rise, wallOpenings);
        }
      } else {
        shape = createFlatWallShape(sideLength, heightFt, wallOpenings);
      }
    }

    return new THREE.ExtrudeGeometry(shape, {
      depth: WALL_THICKNESS,
      bevelEnabled: false,
    });
  }, [wall, widthFt, lengthFt, heightFt, wallOpenings, roof]);

  // Front/back walls span full width; side walls are inset by WALL_THICKNESS
  const T = WALL_THICKNESS;
  const position = useMemo((): [number, number, number] => {
    switch (wall) {
      case 'front': return [0, 0, 0];
      case 'back': return [widthFt, 0, lengthFt];
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

  const roughness = SIDING_ROUGHNESS[siding];
  const texture = useMemo(() => getSidingTexture(siding), [siding]);
  const isSide = wall === 'left' || wall === 'right';

  // ExtrudeGeometry material groups: 0 = front face, 1 = back face, 2 = side (edge) faces
  // Use a plain color on the edge faces so the siding texture doesn't show as horizontal lines
  // Side walls get polygon offset so front/back panels win at the corner overlap zone
  const materials = useMemo(() => {
    const sidingMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness,
      side: THREE.DoubleSide,
      polygonOffset: isSide,
      polygonOffsetFactor: isSide ? 1 : 0,
      polygonOffsetUnits: isSide ? 1 : 0,
    });
    const edgeMat = new THREE.MeshStandardMaterial({
      color: SIDING_EDGE_COLOR[siding],
      roughness: 0.9,
      side: THREE.DoubleSide,
      polygonOffset: isSide,
      polygonOffsetFactor: isSide ? 1 : 0,
      polygonOffsetUnits: isSide ? 1 : 0,
    });
    return [sidingMat, edgeMat, edgeMat];
  }, [texture, roughness, isSide, siding]);

  return (
    <mesh geometry={geometry} position={position} rotation={rotation} material={materials} />
  );
}
