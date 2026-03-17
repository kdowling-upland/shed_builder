import type { ShedDesign, WallId } from '../../types/shed.ts';
import type { MaterialItem } from '../../types/materials.ts';
import { usePriceStore } from '../../store/usePriceStore.ts';

function standardLength(ft: number): number {
  const std = [8, 10, 12, 16];
  return std.find((l) => l >= ft) ?? 16;
}

function lumberPrice(size: string, lengthFt: number): number {
  const stdLen = standardLength(lengthFt);
  return usePriceStore.getState().lumber[`${size}x${stdLen}`] ?? 10;
}

function wallLength(design: ShedDesign, wall: WallId): number {
  return wall === 'front' || wall === 'back' ? design.width : design.length;
}

export function calculateFraming(design: ShedDesign): MaterialItem[] {
  const { width, length, wallHeight, framing, openings } = design;
  const items: MaterialItem[] = [];
  const studSize = framing.studSize;

  // Stud height: wall height in feet -> stud length
  const studLengthFt = wallHeight;
  const studStdLen = standardLength(studLengthFt);
  const studPrice = lumberPrice(studSize, studLengthFt);

  // Calculate studs for each wall
  const walls: WallId[] = ['front', 'back', 'left', 'right'];
  let totalStuds = 0;
  let totalKingStuds = 0;
  let totalTrimmers = 0;
  let totalHeaders = 0;
  let headerLength = 0;

  for (const wall of walls) {
    const wallLen = wallLength(design, wall);
    const wallLenInches = wallLen * 12;
    const spacingInches = framing.studSpacing;

    // Regular studs: wall length / spacing + 1 for start
    let wallStuds = Math.ceil(wallLenInches / spacingInches) + 1;

    // Corner posts: 3-stud corners at each end
    wallStuds += 4; // 2 extra per corner (3-stud corner = regular + 2 extra)

    // Openings on this wall
    const wallOpenings = openings.filter((o) => o.wall === wall);
    for (const opening of wallOpenings) {
      // Remove studs that fall within opening
      const studsRemoved = Math.floor(opening.width / spacingInches);
      wallStuds -= studsRemoved;

      // Add king studs (full height, one each side)
      totalKingStuds += 2;

      // Add trimmer studs (from sill to header, one each side)
      totalTrimmers += 2;

      // Header: double 2x lumber spanning opening
      totalHeaders += 2; // double header
      headerLength += opening.width / 12; // feet per header piece
    }

    totalStuds += wallStuds;
  }

  // Wall studs
  items.push({
    name: `${studSize}x${studStdLen} Wall Stud`,
    description: `Wall studs at ${framing.studSpacing}" O.C. (all 4 walls)`,
    quantity: totalStuds,
    unit: 'piece',
    unitPrice: studPrice,
    totalPrice: totalStuds * studPrice,
    category: 'walls',
  });

  // King studs and trimmers
  if (totalKingStuds > 0) {
    items.push({
      name: `${studSize}x${studStdLen} King Stud`,
      description: 'Full-height studs flanking openings',
      quantity: totalKingStuds,
      unit: 'piece',
      unitPrice: studPrice,
      totalPrice: totalKingStuds * studPrice,
      category: 'walls',
    });
    items.push({
      name: `${studSize}x${studStdLen} Trimmer Stud`,
      description: 'Jack studs supporting headers',
      quantity: totalTrimmers,
      unit: 'piece',
      unitPrice: studPrice,
      totalPrice: totalTrimmers * studPrice,
      category: 'walls',
    });
  }

  // Headers (use 2x8 or 2x10 depending on span)
  if (totalHeaders > 0) {
    const headerSize = '2x8';
    const avgHeaderLen = headerLength / (totalHeaders / 2);
    const headerStdLen = standardLength(Math.ceil(avgHeaderLen));
    const hdrPrice = lumberPrice(headerSize, avgHeaderLen);
    items.push({
      name: `${headerSize}x${headerStdLen} Header`,
      description: `Double headers over ${totalHeaders / 2} opening(s)`,
      quantity: totalHeaders,
      unit: 'piece',
      unitPrice: hdrPrice,
      totalPrice: totalHeaders * hdrPrice,
      category: 'walls',
    });
  }

  // Top plates (double) and bottom plate (single) for each wall
  // Group plates by stock length so short walls use appropriately sized lumber
  const totalPlateLength = 2 * (width + length); // perimeter
  const platePiecesPerRun = (wallLen: number) => Math.ceil(wallLen / 16); // 16ft max lumber

  // Collect plate groups keyed by stock length
  const plateGroups: Record<number, { bottom: number; top: number }> = {};
  for (const wall of walls) {
    const wLen = wallLength(design, wall);
    const stdLen = standardLength(wLen);
    if (!plateGroups[stdLen]) plateGroups[stdLen] = { bottom: 0, top: 0 };
    const pieces = platePiecesPerRun(wLen);
    plateGroups[stdLen].bottom += pieces;
    plateGroups[stdLen].top += pieces * 2;
  }

  for (const [stdLenStr, counts] of Object.entries(plateGroups)) {
    const stdLen = Number(stdLenStr);
    const price = lumberPrice(studSize, stdLen);
    items.push({
      name: `${studSize}x${stdLen} Bottom Plate`,
      description: `Single bottom plate, ${Math.round(totalPlateLength)}' perimeter`,
      quantity: counts.bottom,
      unit: 'piece',
      unitPrice: price,
      totalPrice: counts.bottom * price,
      category: 'walls',
    });
    items.push({
      name: `${studSize}x${stdLen} Top Plate`,
      description: `Double top plate, ${Math.round(totalPlateLength)}' perimeter`,
      quantity: counts.top,
      unit: 'piece',
      unitPrice: price,
      totalPrice: counts.top * price,
      category: 'walls',
    });
  }

  // Gable end framing (triangular stud wall above top plate on front/back walls)
  if (design.roof.style === 'gable' || design.roof.style === 'gambrel') {
    const gableWidthInches = width * 12;
    const spacing = framing.studSpacing;
    let gableStudCount = 0;
    const minHeight = 6; // inches — minimum useful gable stud

    for (let x = spacing; x < gableWidthInches; x += spacing) {
      const dist = Math.min(x, gableWidthInches - x);
      let height: number;
      if (design.roof.style === 'gable') {
        height = dist * (design.roof.pitch / 12);
      } else {
        // Gambrel: approximate linear rise to peak
        const halfSpan = gableWidthInches / 2;
        const rise = halfSpan * (design.roof.pitch / 12) * 1.5; // gambrel rises ~1.5× gable
        height = (dist / halfSpan) * rise;
      }
      if (height >= minHeight) gableStudCount++;
    }
    gableStudCount *= 2; // front and back gable ends

    if (gableStudCount > 0) {
      const gableStudPrice = lumberPrice(studSize, studLengthFt);
      items.push({
        name: `${studSize}x${studStdLen} Gable Stud`,
        description: `Gable end framing at ${spacing}" O.C. (2 gable ends), cut to pitch`,
        quantity: gableStudCount,
        unit: 'piece',
        unitPrice: gableStudPrice,
        totalPrice: gableStudCount * gableStudPrice,
        category: 'walls',
      });
    }
  }

  return items;
}
