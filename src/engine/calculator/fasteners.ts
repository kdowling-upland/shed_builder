import type { ShedDesign } from '../../types/shed.ts';
import type { MaterialItem } from '../../types/materials.ts';
import { usePriceStore } from '../../store/usePriceStore.ts';

export function calculateFasteners(design: ShedDesign): MaterialItem[] {
  const { width, length, wallHeight, framing } = design;
  const items: MaterialItem[] = [];

  // Floor joist hangers
  const joistCount = Math.ceil((length * 12) / framing.joistSpacing) - 1;
  items.push({
    name: 'Joist Hanger',
    description: `For ${joistCount} floor joists`,
    quantity: joistCount,
    unit: 'piece',
    unitPrice: usePriceStore.getState().fasteners.joistHanger,
    totalPrice: joistCount * usePriceStore.getState().fasteners.joistHanger,
    category: 'fasteners',
  });

  // Hurricane ties for rafters
  const spacingFt = framing.rafterSpacing / 12;
  const rafterCount = (Math.ceil(length / spacingFt) + 1) * 2;
  items.push({
    name: 'Hurricane Tie',
    description: `For ${rafterCount} rafters`,
    quantity: rafterCount,
    unit: 'piece',
    unitPrice: usePriceStore.getState().fasteners.hurricaneTie,
    totalPrice: rafterCount * usePriceStore.getState().fasteners.hurricaneTie,
    category: 'fasteners',
  });

  // 16d framing nails (estimate: ~20 per stud, ~10 per plate foot)
  const perimeterFt = 2 * (width + length);
  const studCount = Math.ceil((perimeterFt * 12) / framing.studSpacing) + 4;
  const framingNails = studCount * 20 + perimeterFt * 10 * 3; // 3 plates
  const nailBoxes16d = Math.ceil(framingNails / 200); // ~200 nails per lb, sold by lb
  items.push({
    name: '16d Framing Nails (1 lb)',
    description: `~${framingNails} nails for framing`,
    quantity: nailBoxes16d,
    unit: 'lb',
    unitPrice: usePriceStore.getState().fasteners.nails16d * 200,
    totalPrice: nailBoxes16d * usePriceStore.getState().fasteners.nails16d * 200,
    category: 'fasteners',
  });

  // 8d nails for sheathing/siding
  const wallArea = perimeterFt * wallHeight;
  const sheathingNails = Math.ceil(wallArea * 2); // ~2 nails per sq ft
  const nailBoxes8d = Math.ceil(sheathingNails / 300);
  items.push({
    name: '8d Nails (1 lb)',
    description: `~${sheathingNails} nails for sheathing/siding`,
    quantity: nailBoxes8d,
    unit: 'lb',
    unitPrice: usePriceStore.getState().fasteners.nails8d * 300,
    totalPrice: nailBoxes8d * usePriceStore.getState().fasteners.nails8d * 300,
    category: 'fasteners',
  });

  // Screws for subfloor
  const floorArea = width * length;
  const floorScrews = Math.ceil(floorArea * 1.5);
  const screwBoxes = Math.ceil(floorScrews / 100);
  items.push({
    name: '3" Deck Screws (100ct)',
    description: `~${floorScrews} screws for subfloor`,
    quantity: screwBoxes,
    unit: 'box',
    unitPrice: usePriceStore.getState().fasteners.screws3inch * 100,
    totalPrice: screwBoxes * usePriceStore.getState().fasteners.screws3inch * 100,
    category: 'fasteners',
  });

  // Anchor bolts for foundation attachment
  items.push({
    name: 'Anchor Bolt',
    description: 'Foundation anchors',
    quantity: Math.ceil(perimeterFt / 4),
    unit: 'piece',
    unitPrice: usePriceStore.getState().fasteners.anchorBolt,
    totalPrice: Math.ceil(perimeterFt / 4) * usePriceStore.getState().fasteners.anchorBolt,
    category: 'fasteners',
  });

  return items;
}
