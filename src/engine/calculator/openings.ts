import type { ShedDesign } from '../../types/shed.ts';
import type { MaterialItem } from '../../types/materials.ts';
import { usePriceStore } from '../../store/usePriceStore.ts';

export function calculateOpenings(design: ShedDesign): MaterialItem[] {
  const items: MaterialItem[] = [];
  const counts: Record<string, number> = {};

  for (const opening of design.openings) {
    counts[opening.type] = (counts[opening.type] ?? 0) + 1;
  }

  for (const [type, count] of Object.entries(counts)) {
    const price = usePriceStore.getState().openings[type] ?? 100;
    const label = type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    items.push({
      name: `Pre-hung ${label}`,
      description: `${count} x ${label}`,
      quantity: count,
      unit: 'unit',
      unitPrice: price,
      totalPrice: count * price,
      category: 'openings',
    });
  }

  return items;
}
