import * as THREE from 'three';
import type { SidingMaterial } from '../../types/shed.ts';

const S = 1024; // canvas resolution — needs to be high enough for thin groove lines to survive GPU filtering

function createCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

function addGrain(ctx: CanvasRenderingContext2D, intensity: number = 15) {
  const imageData = ctx.getImageData(0, 0, S, S);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * ExtrudeGeometry UVs are in feet. repeat controls how many texture tiles
 * per UV unit (1 foot). So repeat=0.25 means 1 tile spans 4 feet.
 */
function toTexture(canvas: HTMLCanvasElement, tileSizeFt: number): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  const r = 1 / tileSizeFt; // repeat per foot
  tex.repeat.set(r, r);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16; // sharper at oblique viewing angles
  return tex;
}

// ── T1-11 Plywood: vertical grooves every ~8" on 4x8 sheets ──
function createT111Texture(): THREE.CanvasTexture {
  const { canvas, ctx } = createCanvas();
  ctx.fillStyle = '#C9A96E';
  ctx.fillRect(0, 0, S, S);

  // Wood grain
  for (let y = 0; y < S; y += 2 + Math.random() * 3) {
    ctx.strokeStyle = '#B0883F';
    ctx.globalAlpha = 0.3 + Math.random() * 0.2;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < S; x += 8) {
      ctx.lineTo(x, y + (Math.random() - 0.5) * 2);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Vertical grooves — 8 grooves across 4ft (every 6")
  // Start at 0 so the groove at the tile seam is present on both edges
  const grooveSpacing = S / 8;
  for (let i = 0; i < 8; i++) {
    const x = i * grooveSpacing;
    // Dark groove
    ctx.fillStyle = '#7A5C28';
    ctx.fillRect(x - 4, 0, 8, S);
    if (i === 0) ctx.fillRect(S - 4, 0, 4, S); // wrap left edge groove to right edge
    // Highlight edge
    ctx.fillStyle = '#D4B878';
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x + 4, 0, 4, S);
    ctx.globalAlpha = 1;
  }

  addGrain(ctx, 12);
  return toTexture(canvas, 4); // 1 tile = 4 feet (one sheet width)
}

// ── LP SmartSide: horizontal lap siding ──
function createSmartSideTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createCanvas();
  ctx.fillStyle = '#C4B898';
  ctx.fillRect(0, 0, S, S);

  // Lap courses — about 7" exposure, ~7 per 4ft tile
  const lapH = S / 7;
  for (let y = lapH; y < S; y += lapH) {
    // Deep shadow under the lap
    ctx.fillStyle = '#8A7A5A';
    ctx.fillRect(0, y - 3, S, 5);
    // Bright highlight above
    ctx.fillStyle = '#D8CCA8';
    ctx.fillRect(0, y + 2, S, 2);
  }

  // Subtle grain within each course
  ctx.strokeStyle = '#B0A480';
  ctx.lineWidth = 0.5;
  for (let y = 0; y < S; y += 4) {
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(S, y + (Math.random() - 0.5) * 1);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  addGrain(ctx, 8);
  return toTexture(canvas, 4);
}

// ── Vinyl: clean horizontal clapboard ──
function createVinylTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createCanvas();
  ctx.fillStyle = '#EBE8E0';
  ctx.fillRect(0, 0, S, S);

  // Clapboard courses
  const lapH = S / 8;
  for (let y = lapH; y < S; y += lapH) {
    ctx.fillStyle = '#C8C4BA';
    ctx.fillRect(0, y - 2, S, 4);
    ctx.fillStyle = '#F5F2EC';
    ctx.fillRect(0, y + 2, S, 2);
  }

  addGrain(ctx, 5);
  return toTexture(canvas, 4);
}

// ── Cedar: rich wood grain with knots ──
function createCedarTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createCanvas();
  ctx.fillStyle = '#A85C30';
  ctx.fillRect(0, 0, S, S);

  // Strong grain lines
  for (let y = 0; y < S; y += 2 + Math.random() * 2) {
    ctx.strokeStyle = Math.random() > 0.5 ? '#7A3818' : '#C06A38';
    ctx.globalAlpha = 0.35 + Math.random() * 0.25;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < S; x += 6) {
      ctx.lineTo(x, y + (Math.random() - 0.5) * 4);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Knots
  for (let i = 0; i < 4; i++) {
    const kx = 40 + Math.random() * (S - 80);
    const ky = 40 + Math.random() * (S - 80);
    const kr = 8 + Math.random() * 12;
    const grad = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr);
    grad.addColorStop(0, '#4A1E08');
    grad.addColorStop(0.5, '#6A3018');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(kx, ky, kr, kr * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Board gaps (vertical every ~6")
  const boardW = S / 8;
  for (let i = 0; i < 8; i++) {
    const x = i * boardW;
    ctx.fillStyle = '#5A2810';
    ctx.fillRect(x - 2, 0, 6, S);
    if (i === 0) ctx.fillRect(S - 2, 0, 2, S); // wrap to right edge
  }

  addGrain(ctx, 14);
  return toTexture(canvas, 4);
}

// ── Board and Batten ──
function createBoardBattenTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createCanvas();
  ctx.fillStyle = '#8B7355';
  ctx.fillRect(0, 0, S, S);

  // Wood grain (horizontal)
  for (let y = 0; y < S; y += 2 + Math.random() * 3) {
    ctx.strokeStyle = '#6A5538';
    ctx.globalAlpha = 0.2 + Math.random() * 0.15;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(S, y + (Math.random() - 0.5) * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Wide boards with dark gaps — boards are ~10" wide, 5 per 4ft tile
  const boardW = S / 5;
  for (let i = 0; i < 5; i++) {
    const x = i * boardW;
    // Dark gap
    ctx.fillStyle = '#3A2818';
    ctx.fillRect(x - 6, 0, 12, S);
    if (i === 0) ctx.fillRect(S - 6, 0, 6, S); // wrap to right edge
  }

  // Batten strips over each gap
  for (let i = 0; i < 5; i++) {
    const x = i * boardW;
    ctx.fillStyle = '#A08E72';
    ctx.fillRect(x - 16, 0, 32, S);
    if (i === 0) ctx.fillRect(S - 16, 0, 16, S); // wrap to right edge
    // Edges of batten
    ctx.fillStyle = '#6A5A42';
    ctx.fillRect(x - 16, 0, 3, S);
    ctx.fillRect(x + 13, 0, 3, S);
    if (i === 0) ctx.fillRect(S - 16, 0, 3, S); // wrap edge to right
  }

  addGrain(ctx, 12);
  return toTexture(canvas, 4);
}

// ── Roof shingles ──
function createShingleTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createCanvas();
  ctx.fillStyle = '#4A3F36';
  ctx.fillRect(0, 0, S, S);

  const shingleH = S / 12; // ~12 courses per tile
  const shingleW = S / 8;  // ~8 shingles across

  for (let row = 0; row < S / shingleH + 1; row++) {
    const y = row * shingleH;
    const offsetX = (row % 2) * (shingleW / 2);

    for (let col = -1; col < S / shingleW + 2; col++) {
      const x = col * shingleW + offsetX;
      // Color variation per shingle
      const shade = 65 + Math.floor(Math.random() * 30);
      ctx.fillStyle = `rgb(${shade}, ${shade - 10}, ${shade - 18})`;
      ctx.fillRect(x + 1, y + 1, shingleW - 2, shingleH - 2);

      // Bottom edge shadow (the visible exposure line)
      ctx.fillStyle = '#1E1A16';
      ctx.fillRect(x, y + shingleH - 3, shingleW, 3);

      // Right edge
      ctx.fillStyle = '#2E2822';
      ctx.fillRect(x + shingleW - 2, y, 2, shingleH);
    }
  }

  addGrain(ctx, 10);
  return toTexture(canvas, 3); // 1 tile = 3 feet
}

// ── Floor plywood ──
function createFloorTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createCanvas();
  ctx.fillStyle = '#8B7355';
  ctx.fillRect(0, 0, S, S);

  for (let y = 0; y < S; y += 2 + Math.random() * 2) {
    ctx.strokeStyle = '#7A6245';
    ctx.globalAlpha = 0.25 + Math.random() * 0.2;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < S; x += 10) {
      ctx.lineTo(x, y + (Math.random() - 0.5) * 3);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Sheet edge
  ctx.strokeStyle = '#5A4530';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, S - 4, S - 4);

  addGrain(ctx, 10);
  return toTexture(canvas, 4); // 1 tile = 4 feet (one sheet)
}

// ── Texture cache ──
const cache = new Map<string, THREE.CanvasTexture>();

function cached(key: string, factory: () => THREE.CanvasTexture): THREE.CanvasTexture {
  if (!cache.has(key)) {
    cache.set(key, factory());
  }
  return cache.get(key)!;
}

export function getSidingTexture(siding: SidingMaterial): THREE.CanvasTexture {
  switch (siding) {
    case 't1-11': return cached('t1-11', createT111Texture);
    case 'lp-smartside': return cached('lp-smartside', createSmartSideTexture);
    case 'vinyl': return cached('vinyl', createVinylTexture);
    case 'cedar': return cached('cedar', createCedarTexture);
    case 'board-and-batten': return cached('board-and-batten', createBoardBattenTexture);
  }
}

export function getShingleTexture(): THREE.CanvasTexture {
  return cached('shingles', createShingleTexture);
}

export function getFloorTexture(): THREE.CanvasTexture {
  return cached('floor', createFloorTexture);
}
