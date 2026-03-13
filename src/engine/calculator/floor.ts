import type { ShedDesign } from '../../types/shed.ts';
import type { MaterialItem } from '../../types/materials.ts';
import { usePriceStore } from '../../store/usePriceStore.ts';

function lumberKey(size: string, lengthFt: number): string {
  // Round up to nearest standard length: 8, 10, 12, 16
  const std = [8, 10, 12, 16];
  const stdLen = std.find((l) => l >= lengthFt) ?? 16;
  return `${size}x${stdLen}`;
}

function lumberPrice(size: string, lengthFt: number): number {
  const key = lumberKey(size, lengthFt);
  return usePriceStore.getState().lumber[key] ?? 10;
}

function lumberName(size: string, lengthFt: number): string {
  const std = [8, 10, 12, 16];
  const stdLen = std.find((l) => l >= lengthFt) ?? 16;
  return `${size}x${stdLen}`;
}

export function calculateFloor(design: ShedDesign): MaterialItem[] {
  const { width, length, framing } = design;
  const items: MaterialItem[] = [];

  // Rim joists (2 pieces, running the length)
  const rimPrice = lumberPrice(framing.joistSize, length);
  const rimName = lumberName(framing.joistSize, length);
  items.push({
    name: `${rimName} Rim Joist`,
    description: 'Rim joists along length',
    quantity: 2,
    unit: 'piece',
    unitPrice: rimPrice,
    totalPrice: 2 * rimPrice,
    category: 'floor',
  });

  // Band joists (2 pieces, running the width - fit between rims)
  const bandPrice = lumberPrice(framing.joistSize, width);
  const bandName = lumberName(framing.joistSize, width);
  items.push({
    name: `${bandName} Band Joist`,
    description: 'Band joists along width (end caps)',
    quantity: 2,
    unit: 'piece',
    unitPrice: bandPrice,
    totalPrice: 2 * bandPrice,
    category: 'floor',
  });

  // Floor joists spanning the width
  const joistSpacingFt = framing.joistSpacing / 12;
  const joistCount = Math.ceil(length / joistSpacingFt) - 1; // minus the 2 band joists
  const joistPrice = lumberPrice(framing.joistSize, width);
  const joistName = lumberName(framing.joistSize, width);
  items.push({
    name: `${joistName} Floor Joist`,
    description: `${framing.joistSpacing}" O.C. spanning ${width}'`,
    quantity: joistCount,
    unit: 'piece',
    unitPrice: joistPrice,
    totalPrice: joistCount * joistPrice,
    category: 'floor',
  });

  // Subfloor sheathing (3/4" plywood or 23/32 OSB, 4x8 sheets)
  const floorArea = width * length;
  const sheetArea = 32; // 4x8 = 32 sq ft
  const sheetsNeeded = Math.ceil((floorArea / sheetArea) * 1.1); // 10% waste
  const sheetPrice = usePriceStore.getState().sheathing['plywood-3/4'];
  items.push({
    name: '3/4" Plywood Subfloor',
    description: `4x8 sheets, ${width}'x${length}' floor + 10% waste`,
    quantity: sheetsNeeded,
    unit: 'sheet',
    unitPrice: sheetPrice,
    totalPrice: sheetsNeeded * sheetPrice,
    category: 'floor',
  });

  return items;
}
