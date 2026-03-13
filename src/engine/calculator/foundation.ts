import type { ShedDesign } from '../../types/shed.ts';
import type { MaterialItem } from '../../types/materials.ts';
import { usePriceStore } from '../../store/usePriceStore.ts';

export function calculateFoundation(design: ShedDesign): MaterialItem[] {
  const { width, length, foundation } = design;
  const items: MaterialItem[] = [];
  const FOUNDATION_PRICES = usePriceStore.getState().foundation;

  switch (foundation) {
    case 'skids': {
      // One skid every 4 feet of width, minimum 2
      const skidCount = Math.max(2, Math.ceil(width / 4) + 1);
      // Skid length = shed length, use 4x4 treated timbers
      const skidLengthFt = length;
      // Need 4x6 treated timbers cut to length; use 8ft pieces
      const piecesPerSkid = Math.ceil(skidLengthFt / 8);
      const totalPieces = skidCount * piecesPerSkid;
      items.push({
        name: '4x4x8 Treated Timber',
        description: `${skidCount} skids, ${piecesPerSkid} pieces each`,
        quantity: totalPieces,
        unit: 'piece',
        unitPrice: FOUNDATION_PRICES.skid4x4x8,
        totalPrice: totalPieces * FOUNDATION_PRICES.skid4x4x8,
        category: 'foundation',
      });
      break;
    }
    case 'concrete-blocks': {
      // Blocks at corners + every 4 feet along perimeter + interior supports
      const perimeterBlocks =
        2 * (Math.ceil(length / 4) + 1) + 2 * (Math.ceil(width / 4) + 1) - 4;
      // Interior support blocks every 4ft x 4ft grid
      const interiorRows = Math.max(0, Math.ceil(width / 4) - 1);
      const interiorCols = Math.max(0, Math.ceil(length / 4) - 1);
      const interiorBlocks = interiorRows * interiorCols;
      const totalBlocks = perimeterBlocks + interiorBlocks;
      items.push({
        name: 'Concrete Deck Block',
        description: `Perimeter: ${perimeterBlocks}, Interior: ${interiorBlocks}`,
        quantity: totalBlocks,
        unit: 'block',
        unitPrice: FOUNDATION_PRICES.concreteBlock,
        totalPrice: totalBlocks * FOUNDATION_PRICES.concreteBlock,
        category: 'foundation',
      });
      break;
    }
    case 'gravel-pad': {
      // 4" deep gravel pad, 1ft wider than shed on each side
      const padWidth = width + 2;
      const padLength = length + 2;
      const depthFt = 4 / 12;
      const cubicFt = padWidth * padLength * depthFt;
      const cubicYards = Math.ceil(cubicFt / 27);
      items.push({
        name: 'Crushed Gravel',
        description: `${padWidth}'x${padLength}' pad, 4" deep`,
        quantity: cubicYards,
        unit: 'cubic yard',
        unitPrice: FOUNDATION_PRICES.gravelPerCubicYard,
        totalPrice: cubicYards * FOUNDATION_PRICES.gravelPerCubicYard,
        category: 'foundation',
      });
      break;
    }
    case 'concrete-slab': {
      // 4" thick slab
      const depthFt = 4 / 12;
      const cubicFt = width * length * depthFt;
      const cubicYards = Math.ceil((cubicFt / 27) * 10) / 10;
      items.push({
        name: 'Ready-Mix Concrete',
        description: `${width}'x${length}' slab, 4" thick`,
        quantity: Math.ceil(cubicYards),
        unit: 'cubic yard',
        unitPrice: FOUNDATION_PRICES.concretePerCubicYard,
        totalPrice: Math.ceil(cubicYards) * FOUNDATION_PRICES.concretePerCubicYard,
        category: 'foundation',
      });
      break;
    }
  }

  return items;
}
