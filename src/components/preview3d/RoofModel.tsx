import { useMemo } from 'react';
import * as THREE from 'three';
import type { RoofConfig } from '../../types/shed.ts';
import { getShingleTexture } from '../../engine/geometry/textures.ts';
import { gambrelAngles } from '../../engine/geometry/utils.ts';

interface RoofModelProps {
  widthFt: number;
  lengthFt: number;
  wallHeight: number;
  roof: RoofConfig;
}

type V3 = [number, number, number];

function makeQuad(a: V3, b: V3, c: V3, d: V3): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const vertices = new Float32Array([...a, ...b, ...c, ...a, ...c, ...d]);
  geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  // UVs: a=bottom-left, b=top-left, c=top-right, d=bottom-right
  const uvs = new Float32Array([
    0, 0,  1, 0,  1, 1,
    0, 0,  1, 1,  0, 1,
  ]);
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

function makeTri(a: V3, b: V3, c: V3): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const vertices = new Float32Array([...a, ...b, ...c]);
  geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  const uvs = new Float32Array([
    0, 0,  1, 0,  0.5, 1,
  ]);
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Given an eave point on the wall and a ridge point, extend the eave outward
 * along the slope by `overhang` feet. This moves the eave point away from the
 * ridge, following the roof plane direction.
 */
function extendEave(eave: V3, ridge: V3, overhang: number): V3 {
  // Direction from ridge down to eave (full 3D so hip-roof eaves
  // extend outward in Z as well as X/Y)
  const dx = eave[0] - ridge[0];
  const dy = eave[1] - ridge[1];
  const dz = eave[2] - ridge[2];
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (len === 0) return eave;
  return [
    eave[0] + (dx / len) * overhang,
    eave[1] + (dy / len) * overhang,
    eave[2] + (dz / len) * overhang,
  ];
}

function mergeGeos(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (geos.length === 1) return geos[0];
  let totalVerts = 0;
  for (const g of geos) totalVerts += g.getAttribute('position').count;
  const positions = new Float32Array(totalVerts * 3);
  const uvs = new Float32Array(totalVerts * 2);
  let posOffset = 0;
  let uvOffset = 0;
  for (const g of geos) {
    const pos = g.getAttribute('position');
    for (let i = 0; i < pos.count * 3; i++) {
      positions[posOffset++] = (pos.array as Float32Array)[i];
    }
    const uv = g.getAttribute('uv');
    if (uv) {
      for (let i = 0; i < uv.count * 2; i++) {
        uvs[uvOffset++] = (uv.array as Float32Array)[i];
      }
    } else {
      uvOffset += pos.count * 2;
    }
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  merged.computeVertexNormals();
  return merged;
}

export function RoofModel({ widthFt, lengthFt, wallHeight, roof }: RoofModelProps) {
  const oh = roof.overhang / 12;

  const geometry = useMemo(() => {
    const geos: THREE.BufferGeometry[] = [];
    // Lift the roof slightly above the wall top plates so walls don't poke through
    const PLATE_OFFSET = 0.15;
    const h = wallHeight + PLATE_OFFSET;
    // Front/back rake overhang (z direction)
    const zF = -oh;
    const zB = lengthFt + oh;

    switch (roof.style) {
      case 'gable': {
        const halfW = widthFt / 2;
        const rise = (halfW * roof.pitch) / 12;
        const peak = h + rise;

        // Ridge points
        const ridgeF: V3 = [halfW, peak, zF];
        const ridgeB: V3 = [halfW, peak, zB];

        // Wall-top eave points (before overhang extension)
        const eaveFL: V3 = [0, h, zF];
        const eaveBL: V3 = [0, h, zB];
        const eaveFR: V3 = [widthFt, h, zF];
        const eaveBR: V3 = [widthFt, h, zB];

        // Extend eaves outward along slope
        const oeFL = extendEave(eaveFL, ridgeF, oh);
        const oeBL = extendEave(eaveBL, ridgeB, oh);
        const oeFR = extendEave(eaveFR, ridgeF, oh);
        const oeBR = extendEave(eaveBR, ridgeB, oh);

        // Left slope
        geos.push(makeQuad(oeFL, ridgeF, ridgeB, oeBL));
        // Right slope
        geos.push(makeQuad(oeFR, ridgeF, ridgeB, oeBR));
        break;
      }

      case 'lean-to': {
        const rise = (widthFt * roof.pitch) / 12;
        const highH = h + rise;

        // High side (right) = ridge, low side (left) = eave
        const highF: V3 = [widthFt, highH, zF];
        const highB: V3 = [widthFt, highH, zB];
        const lowF: V3 = [0, h, zF];
        const lowB: V3 = [0, h, zB];

        // Extend eaves: low side extends outward/down, high side extends outward/up
        const oLowF = extendEave(lowF, highF, oh);
        const oLowB = extendEave(lowB, highB, oh);
        const oHighF = extendEave(highF, lowF, oh);
        const oHighB = extendEave(highB, lowB, oh);

        geos.push(makeQuad(oLowF, oHighF, oHighB, oLowB));
        break;
      }

      case 'gambrel': {
        const { lowerRad, upperRad } = gambrelAngles(roof.pitch);
        const qw = widthFt / 4;
        const halfW = widthFt / 2;
        const lowerRise = qw * Math.tan(lowerRad);
        const upperRise = qw * Math.tan(upperRad);
        const midH = h + lowerRise;
        const peak = midH + upperRise;

        // Key points at front and back z
        // Left side: eave(0,h) → break(qw, midH) → peak(halfW, peak)
        // Right side: eave(W,h) → break(W-qw, midH) → peak(halfW, peak)

        const peakF: V3 = [halfW, peak, zF];
        const peakB: V3 = [halfW, peak, zB];

        const lBreakF: V3 = [qw, midH, zF];
        const lBreakB: V3 = [qw, midH, zB];
        const rBreakF: V3 = [widthFt - qw, midH, zF];
        const rBreakB: V3 = [widthFt - qw, midH, zB];

        const lEaveF: V3 = [0, h, zF];
        const lEaveB: V3 = [0, h, zB];
        const rEaveF: V3 = [widthFt, h, zF];
        const rEaveB: V3 = [widthFt, h, zB];

        // Extend lower eaves outward along their slope
        const olEaveF = extendEave(lEaveF, lBreakF, oh);
        const olEaveB = extendEave(lEaveB, lBreakB, oh);
        const orEaveF = extendEave(rEaveF, rBreakF, oh);
        const orEaveB = extendEave(rEaveB, rBreakB, oh);

        // Left lower slope
        geos.push(makeQuad(olEaveF, lBreakF, lBreakB, olEaveB));
        // Left upper slope
        geos.push(makeQuad(lBreakF, peakF, peakB, lBreakB));
        // Right lower slope
        geos.push(makeQuad(orEaveF, rBreakF, rBreakB, orEaveB));
        // Right upper slope
        geos.push(makeQuad(rBreakF, peakF, peakB, rBreakB));
        break;
      }

      case 'hip': {
        const halfW = widthFt / 2;
        const rise = (halfW * roof.pitch) / 12;
        const peak = h + rise;
        const ridgeLen = Math.max(0, lengthFt - widthFt);
        const ridgeFrontZ = halfW;
        const ridgeBackZ = halfW + ridgeLen;

        const ridgeF: V3 = [halfW, peak, ridgeFrontZ];
        const ridgeB: V3 = [halfW, peak, ridgeBackZ];

        // Wall-top corner eave points
        const eFL: V3 = [0, h, 0];
        const eFR: V3 = [widthFt, h, 0];
        const eBL: V3 = [0, h, lengthFt];
        const eBR: V3 = [widthFt, h, lengthFt];

        // Extend eaves outward along slope for the long sides
        const oFL = extendEave(eFL, ridgeF, oh);
        const oFR = extendEave(eFR, ridgeF, oh);
        const oBL = extendEave(eBL, ridgeB, oh);
        const oBR = extendEave(eBR, ridgeB, oh);

        // Left slope (trapezoid)
        geos.push(makeQuad(oFL, ridgeF, ridgeB, oBL));
        // Right slope (trapezoid)
        geos.push(makeQuad(oFR, ridgeF, ridgeB, oBR));
        // Front hip triangle
        geos.push(makeTri(oFL, oFR, ridgeF));
        // Back hip triangle
        geos.push(makeTri(oBL, oBR, ridgeB));
        break;
      }
    }

    return mergeGeos(geos);
  }, [widthFt, lengthFt, wallHeight, roof, oh]);

  const shingleTex = useMemo(() => getShingleTexture(), []);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial map={shingleTex} roughness={0.95} side={THREE.DoubleSide} />
    </mesh>
  );
}
