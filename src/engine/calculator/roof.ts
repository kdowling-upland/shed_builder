import type { ShedDesign } from '../../types/shed.ts';
import type { MaterialItem } from '../../types/materials.ts';
import { usePriceStore } from '../../store/usePriceStore.ts';
import { gambrelAngles } from '../geometry/utils.ts';

function standardLength(ft: number): number {
  const std = [8, 10, 12, 16];
  return std.find((l) => l >= ft) ?? 16;
}

function lumberPrice(size: string, lengthFt: number): number {
  const stdLen = standardLength(lengthFt);
  return usePriceStore.getState().lumber[`${size}x${stdLen}`] ?? 10;
}

export function getRafterLength(span: number, pitch: number, overhangInches: number): number {
  // span is the horizontal run (half of shed width for gable)
  // Include overhang (horizontal projection) in the run before computing slope length
  const totalRun = span + overhangInches / 12;
  const slopeFactor = Math.sqrt(1 + (pitch / 12) ** 2);
  return totalRun * slopeFactor;
}

export function calculateRoof(design: ShedDesign): MaterialItem[] {
  const { width, length, roof, framing } = design;
  const items: MaterialItem[] = [];
  const rafterSize = framing.rafterSize;

  let rafterLength: number;
  let rafterCount: number;
  let ridgeBoardLength: number;
  let roofAreaSqFt: number;

  const spacingFt = framing.rafterSpacing / 12;

  switch (roof.style) {
    case 'gable': {
      const halfSpan = width / 2;
      rafterLength = getRafterLength(halfSpan, roof.pitch, roof.overhang);
      // Rafters on each side
      const raftersPerSide = Math.ceil(length / spacingFt) + 1;
      rafterCount = raftersPerSide * 2;
      ridgeBoardLength = length;
      // Roof area: two rectangles
      const slopeLength = rafterLength;
      const roofLength = length + (roof.overhang * 2) / 12;
      roofAreaSqFt = 2 * slopeLength * roofLength;
      break;
    }
    case 'lean-to': {
      rafterLength = getRafterLength(width, roof.pitch, roof.overhang);
      rafterCount = Math.ceil(length / spacingFt) + 1;
      ridgeBoardLength = 0; // no ridge board
      const roofLength = length + (roof.overhang * 2) / 12;
      roofAreaSqFt = rafterLength * roofLength;
      break;
    }
    case 'gambrel': {
      const { lowerRad, upperRad } = gambrelAngles(roof.pitch);
      const lowerRun = width / 4;
      const upperRun = width / 4;
      const lowerLength = lowerRun / Math.cos(lowerRad) + roof.overhang / 12;
      const upperLength = upperRun / Math.cos(upperRad);
      rafterLength = Math.max(lowerLength, upperLength);
      const raftersPerSide = Math.ceil(length / spacingFt) + 1;
      rafterCount = raftersPerSide * 4; // 2 segments per side x 2 sides
      ridgeBoardLength = length;
      const roofLength = length + (roof.overhang * 2) / 12;
      roofAreaSqFt = 2 * (lowerLength + upperLength) * roofLength;
      break;
    }
    case 'hip': {
      const halfSpan = width / 2;
      rafterLength = getRafterLength(halfSpan, roof.pitch, roof.overhang);
      const commonRaftersPerSide = Math.ceil((length - width) / spacingFt) + 1;
      const hipRafters = 4;
      const jackRaftersPerCorner = Math.ceil(halfSpan / spacingFt);
      rafterCount = commonRaftersPerSide * 2 + hipRafters + jackRaftersPerCorner * 4;
      ridgeBoardLength = Math.max(0, length - width);
      // Approximate hip roof area
      const slopeLength = rafterLength;
      roofAreaSqFt = 2 * slopeLength * length; // approximation
      break;
    }
    default: {
      const halfSpan = width / 2;
      rafterLength = getRafterLength(halfSpan, roof.pitch, roof.overhang);
      const raftersPerSide = Math.ceil(length / spacingFt) + 1;
      rafterCount = raftersPerSide * 2;
      ridgeBoardLength = length;
      const roofLength = length + (roof.overhang * 2) / 12;
      roofAreaSqFt = 2 * rafterLength * roofLength;
    }
  }

  // Rafters
  const rafterStdLen = standardLength(Math.ceil(rafterLength));
  const rafterPrice = lumberPrice(rafterSize, rafterLength);
  items.push({
    name: `${rafterSize}x${rafterStdLen} Rafter`,
    description: `${rafterCount} rafters at ${framing.rafterSpacing}" O.C., ${rafterLength.toFixed(1)}' each`,
    quantity: rafterCount,
    unit: 'piece',
    unitPrice: rafterPrice,
    totalPrice: rafterCount * rafterPrice,
    category: 'roof',
  });

  // Ridge board
  if (ridgeBoardLength > 0) {
    const ridgeSize = '2x8';
    const ridgeStdLen = standardLength(Math.ceil(ridgeBoardLength));
    const ridgePieces = Math.ceil(ridgeBoardLength / 16);
    const ridgePrice = lumberPrice(ridgeSize, ridgeBoardLength);
    items.push({
      name: `${ridgeSize}x${ridgeStdLen} Ridge Board`,
      description: `${ridgeBoardLength.toFixed(0)}' ridge`,
      quantity: ridgePieces,
      unit: 'piece',
      unitPrice: ridgePrice,
      totalPrice: ridgePieces * ridgePrice,
      category: 'roof',
    });
  }

  // Roof sheathing (7/16 OSB)
  const sheetsNeeded = Math.ceil((roofAreaSqFt / 32) * 1.1);
  const sheathingPrice = usePriceStore.getState().sheathing['osb-7/16'];
  items.push({
    name: '7/16" OSB Roof Sheathing',
    description: `4x8 sheets, ${Math.round(roofAreaSqFt)} sq ft roof + 10% waste`,
    quantity: sheetsNeeded,
    unit: 'sheet',
    unitPrice: sheathingPrice,
    totalPrice: sheetsNeeded * sheathingPrice,
    category: 'roof',
  });

  // Shingles (3 bundles per 100 sq ft "square")
  const squares = roofAreaSqFt / 100;
  const bundles = Math.ceil(squares * 3 * 1.1); // 10% waste
  items.push({
    name: 'Asphalt Shingles',
    description: `${bundles} bundles (${squares.toFixed(1)} squares + waste)`,
    quantity: bundles,
    unit: 'bundle',
    unitPrice: usePriceStore.getState().roofing.shingles,
    totalPrice: bundles * usePriceStore.getState().roofing.shingles,
    category: 'roof',
  });

  // Underlayment
  const underlaymentRolls = Math.ceil(roofAreaSqFt / 400);
  items.push({
    name: 'Roofing Underlayment',
    description: `${underlaymentRolls} roll(s) @ 400 sq ft each`,
    quantity: underlaymentRolls,
    unit: 'roll',
    unitPrice: usePriceStore.getState().roofing.underlayment,
    totalPrice: underlaymentRolls * usePriceStore.getState().roofing.underlayment,
    category: 'roof',
  });

  // Drip edge
  const dripEdgeFt = 2 * (length + rafterLength * 2) + (roof.overhang * 4) / 12;
  const dripEdgePieces = Math.ceil(dripEdgeFt / 10);
  items.push({
    name: 'Drip Edge (10ft)',
    description: `${Math.round(dripEdgeFt)}' of drip edge`,
    quantity: dripEdgePieces,
    unit: 'piece',
    unitPrice: usePriceStore.getState().roofing.dripEdge,
    totalPrice: dripEdgePieces * usePriceStore.getState().roofing.dripEdge,
    category: 'roof',
  });

  return items;
}
