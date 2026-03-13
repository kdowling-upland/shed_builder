import type { ShedDesign, WallId } from '../../types/shed.ts';
import type { MaterialItem } from '../../types/materials.ts';
import { usePriceStore } from '../../store/usePriceStore.ts';
import { gambrelAngles } from '../geometry/utils.ts';

function wallArea(design: ShedDesign, wall: WallId): number {
  const isFrontBack = wall === 'front' || wall === 'back';
  const wallLen = isFrontBack ? design.width : design.length;
  let area = wallLen * design.wallHeight; // rectangular portion

  if (isFrontBack) {
    switch (design.roof.style) {
      case 'gable': {
        // Triangle: base = width, height = rise
        const rise = (design.width / 2) * (design.roof.pitch / 12);
        area += (design.width * rise) / 2;
        break;
      }
      case 'gambrel': {
        // Two trapezoidal sections on each side form the gambrel gable
        const { lowerRad, upperRad } = gambrelAngles(design.roof.pitch);
        const qw = design.width / 4;
        const lowerRise = qw * Math.tan(lowerRad);
        const upperRise = qw * Math.tan(upperRad);
        // Lower triangles (2): each is a triangle base=qw, height=lowerRise
        area += 2 * (qw * lowerRise) / 2;
        // Upper triangles (2): each is a triangle base=qw, height=upperRise
        area += 2 * (qw * upperRise) / 2;
        break;
      }
      case 'lean-to': {
        // Trapezoid: rectangle + triangle on top
        const rise = (design.width * design.roof.pitch) / 12;
        area += (design.width * rise) / 2;
        break;
      }
      case 'hip':
        // No extra gable area for hip roofs
        break;
    }
  } else if (design.roof.style === 'lean-to' && wall === 'right') {
    // Right side wall is taller for lean-to
    const rise = (design.width * design.roof.pitch) / 12;
    area = design.length * (design.wallHeight + rise);
  }

  // Subtract openings
  const wallOpenings = design.openings.filter((o) => o.wall === wall);
  for (const opening of wallOpenings) {
    area -= (opening.width * opening.height) / 144;
  }

  return Math.max(0, area);
}

export function calculateSiding(design: ShedDesign): MaterialItem[] {
  const walls: WallId[] = ['front', 'back', 'left', 'right'];
  const totalArea = walls.reduce((sum, w) => sum + wallArea(design, w), 0);
  const areaWithWaste = totalArea * 1.1;

  const sidingInfo = usePriceStore.getState().siding[design.siding];
  const quantity = Math.ceil(areaWithWaste / sidingInfo.coverage);

  return [
    {
      name: `${design.siding.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Siding`,
      description: `${Math.round(totalArea)} sq ft wall area + 10% waste`,
      quantity,
      unit: sidingInfo.unit,
      unitPrice: sidingInfo.price,
      totalPrice: quantity * sidingInfo.price,
      category: 'siding',
    },
  ];
}
