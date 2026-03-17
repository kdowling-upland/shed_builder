import type { ShedDesign, WallId } from '../../types/shed.ts';
import { gambrelAngles } from '../geometry/utils.ts';

export interface AngleCut {
  /** Type of angle cut */
  type: 'plumb' | 'seat' | 'tail' | 'compound';
  /** Angle in degrees from horizontal (or from the plumb line for seat cuts) */
  angleDeg: number;
  /** Human-readable description */
  description: string;
}

export interface CutItem {
  /** What category this cut belongs to */
  phase: 'foundation' | 'floor' | 'walls' | 'roof' | 'trim';
  /** Lumber dimension, e.g. "2x8" */
  lumberSize: string;
  /** Standard board length to purchase, e.g. 12 */
  stockLength: number;
  /** Actual cut length in inches */
  cutLengthInches: number;
  /** How many of this identical cut */
  qty: number;
  /** Human-readable purpose */
  label: string;
  /** Angle cuts required (rafters, hip rafters, etc.) */
  angleCuts?: AngleCut[];
}

function standardLength(ft: number): number {
  const std = [8, 10, 12, 16];
  return std.find((l) => l >= ft) ?? 16;
}

/**
 * Push cut entries for a continuous member that may need splicing from
 * multiple boards when the total length exceeds standard stock sizes.
 */
function pushContinuousMember(
  cuts: CutItem[],
  phase: CutItem['phase'],
  lumberSize: string,
  totalLengthInches: number,
  label: string,
  qty: number = 1,
) {
  const totalFeet = totalLengthInches / 12;
  if (totalFeet <= 16) {
    cuts.push({
      phase,
      lumberSize,
      stockLength: standardLength(Math.ceil(totalFeet)),
      cutLengthInches: totalLengthInches,
      qty,
      label: `${label} – ${formatInches(totalLengthInches)}`,
    });
    return;
  }
  // Needs splicing: split into 16' sections + remainder
  const fullCount = Math.floor(totalFeet / 16);
  const remainderInches = totalLengthInches - fullCount * 16 * 12;
  const totalPieces = fullCount + (remainderInches > 6 ? 1 : 0);

  cuts.push({
    phase,
    lumberSize,
    stockLength: 16,
    cutLengthInches: 16 * 12,
    qty: fullCount * qty,
    label: `${label} – 16' 0" (join ${totalPieces} pcs for ${formatInches(totalLengthInches)} total)`,
  });
  if (remainderInches > 6) {
    cuts.push({
      phase,
      lumberSize,
      stockLength: standardLength(Math.ceil(remainderInches / 12)),
      cutLengthInches: remainderInches,
      qty,
      label: `${label} – ${formatInches(remainderInches)} (remainder piece)`,
    });
  }
}

function formatInches(inches: number): string {
  const ft = Math.floor(inches / 12);
  const rem = Math.round((inches % 12) * 16) / 16; // round to 1/16
  const whole = Math.floor(rem);
  const frac = rem - whole;
  let fracStr = '';
  if (Math.abs(frac - 0.0625) < 0.01) fracStr = '1/16';
  else if (Math.abs(frac - 0.125) < 0.01) fracStr = '1/8';
  else if (Math.abs(frac - 0.1875) < 0.01) fracStr = '3/16';
  else if (Math.abs(frac - 0.25) < 0.01) fracStr = '1/4';
  else if (Math.abs(frac - 0.3125) < 0.01) fracStr = '5/16';
  else if (Math.abs(frac - 0.375) < 0.01) fracStr = '3/8';
  else if (Math.abs(frac - 0.4375) < 0.01) fracStr = '7/16';
  else if (Math.abs(frac - 0.5) < 0.01) fracStr = '1/2';
  else if (Math.abs(frac - 0.5625) < 0.01) fracStr = '9/16';
  else if (Math.abs(frac - 0.625) < 0.01) fracStr = '5/8';
  else if (Math.abs(frac - 0.6875) < 0.01) fracStr = '11/16';
  else if (Math.abs(frac - 0.75) < 0.01) fracStr = '3/4';
  else if (Math.abs(frac - 0.8125) < 0.01) fracStr = '13/16';
  else if (Math.abs(frac - 0.875) < 0.01) fracStr = '7/8';
  else if (Math.abs(frac - 0.9375) < 0.01) fracStr = '15/16';

  if (ft === 0 && whole === 0 && fracStr) return `${fracStr}"`;
  if (ft === 0 && fracStr) return `${whole}-${fracStr}"`;
  if (ft === 0) return `${whole}"`;
  if (whole === 0 && !fracStr) return `${ft}' 0"`;
  if (fracStr) return `${ft}' ${whole}-${fracStr}"`;
  return `${ft}' ${whole}"`;
}

export { formatInches };

/** Compute standard rafter angle cuts for a given pitch (rise per 12 run) */
function rafterAngleCuts(pitch: number, overhangInches: number): AngleCut[] {
  // Pitch angle from horizontal: e.g. 6/12 → arctan(0.5) ≈ 26.6°
  // This is the miter saw setting for the plumb cut (measured from square/perpendicular)
  const plumbDeg = parseFloat((Math.atan2(pitch, 12) * (180 / Math.PI)).toFixed(1));
  const seatDeg = parseFloat((90 - plumbDeg).toFixed(1));
  const cuts: AngleCut[] = [
    {
      type: 'plumb',
      angleDeg: plumbDeg,
      description: `Plumb cut (ridge end): set miter saw to ${plumbDeg}° from square (${pitch}/12 pitch)`,
    },
    {
      type: 'seat',
      angleDeg: seatDeg,
      description: `Bird's mouth: ${seatDeg}° seat cut with plumb notch, depth = 2/3 rafter width`,
    },
  ];
  if (overhangInches > 0) {
    cuts.push({
      type: 'tail',
      angleDeg: plumbDeg,
      description: `Tail cut: plumb cut at ${plumbDeg}° at the overhang end (${overhangInches}" past wall)`,
    });
  }
  return cuts;
}

/** Compute hip/valley rafter angle cuts (compound angles) */
function hipRafterAngleCuts(pitch: number): AngleCut[] {
  // Hip rafters run at 45° in plan, so the effective pitch is pitch / √2
  const effectivePitch = pitch / Math.SQRT2;
  const plumbDeg = parseFloat((Math.atan2(effectivePitch, 12) * (180 / Math.PI)).toFixed(1));
  const cheekAngle = 45;
  return [
    {
      type: 'compound',
      angleDeg: plumbDeg,
      description: `Compound plumb cut: ${plumbDeg}° from square with ${cheekAngle}° cheek angle (single-cut or double-cheek)`,
    },
    {
      type: 'seat',
      angleDeg: parseFloat((90 - plumbDeg).toFixed(1)),
      description: `Bird's mouth: compound seat cut, depth = 2/3 rafter width, with 45° cheek`,
    },
  ];
}

/** Compute jack rafter angle cuts (same pitch as common, plus cheek cut) */
function jackRafterAngleCuts(pitch: number, overhangInches: number): AngleCut[] {
  const baseCuts = rafterAngleCuts(pitch, overhangInches);
  baseCuts.push({
    type: 'compound',
    angleDeg: 45,
    description: 'Cheek cut at top: 45° single-cheek cut where jack meets hip rafter',
  });
  return baseCuts;
}

function wallLength(design: ShedDesign, wall: WallId): number {
  return (wall === 'front' || wall === 'back' ? design.width : design.length);
}

export function generateCutList(design: ShedDesign): CutItem[] {
  const cuts: CutItem[] = [];
  const { width, length, wallHeight, framing, roof, openings } = design;

  // ── FOUNDATION ──
  if (design.foundation === 'skids') {
    const skidCount = Math.max(2, Math.ceil(width / 4) + 1);
    pushContinuousMember(cuts, 'foundation', '4x4 Treated', length * 12, 'Foundation skid', skidCount);
  }

  // ── FLOOR ──
  // Rim joists (along length)
  pushContinuousMember(cuts, 'floor', framing.joistSize, length * 12, 'Rim joist', 2);

  // Band joists (along width, fit between rims)
  // Actual dimension of a 2x is 1.5", so band = width*12 - 2*(1.5) = width*12 - 3
  const bandLenInches = width * 12 - 3;
  pushContinuousMember(cuts, 'floor', framing.joistSize, bandLenInches, 'Band joist (end cap)', 2);

  // Floor joists (span the width, fit between rims)
  const floorJoistLen = width * 12 - 3; // between rims
  const joistCount = Math.ceil((length * 12) / framing.joistSpacing) - 1;
  cuts.push({
    phase: 'floor',
    lumberSize: framing.joistSize,
    stockLength: standardLength(width),
    cutLengthInches: floorJoistLen,
    qty: joistCount,
    label: `Floor joist – ${formatInches(floorJoistLen)} @ ${framing.joistSpacing}" O.C.`,
  });

  // ── WALLS ──
  // Standard stud height: wall height in feet * 12, minus 3 plates * 1.5" = 4.5"
  const studHeightInches = wallHeight * 12 - 4.5; // bottom plate + double top plate
  const studStockLen = standardLength(Math.ceil(studHeightInches / 12));

  const walls: WallId[] = ['front', 'back', 'left', 'right'];

  // Bottom plates & top plates for each wall
  for (const wall of walls) {
    const wLen = wallLength(design, wall);
    const plateLenInches = wLen * 12;

    pushContinuousMember(cuts, 'walls', framing.studSize, plateLenInches, `Bottom plate – ${wall} wall`, 1);
    pushContinuousMember(cuts, 'walls', framing.studSize, plateLenInches, `Top plate (double) – ${wall} wall`, 2);
  }

  // Studs per wall
  for (const wall of walls) {
    const wLen = wallLength(design, wall);
    const wLenInches = wLen * 12;

    // Regular studs (spacing + 1 start + 4 extra for 3-stud corners)
    let studs = Math.ceil(wLenInches / framing.studSpacing) + 1 + 4;

    // Opening framing
    const wallOpenings = openings.filter((o) => o.wall === wall);
    for (const op of wallOpenings) {
      // Remove studs within opening
      const removed = Math.floor(op.width / framing.studSpacing);
      studs -= removed;

      // King studs (full height)
      cuts.push({
        phase: 'walls',
        lumberSize: framing.studSize,
        stockLength: studStockLen,
        cutLengthInches: studHeightInches,
        qty: 2,
        label: `King stud – ${op.type.replace(/-/g, ' ')} on ${wall} wall`,
      });

      // Trimmer studs (from floor to bottom of header)
      const headerHeight = op.type === 'window'
        ? 36 + op.height // sill height + window height
        : op.height;
      const trimmerLen = headerHeight - 1.5; // minus bottom plate
      cuts.push({
        phase: 'walls',
        lumberSize: framing.studSize,
        stockLength: studStockLen,
        cutLengthInches: trimmerLen,
        qty: 2,
        label: `Trimmer stud – ${op.type.replace(/-/g, ' ')} on ${wall} – ${formatInches(trimmerLen)}`,
      });

      // Header (double, span = opening width + 3" for bearing on trimmers)
      const headerLen = op.width + 3;
      cuts.push({
        phase: 'walls',
        lumberSize: '2x8',
        stockLength: standardLength(Math.ceil(headerLen / 12)),
        cutLengthInches: headerLen,
        qty: 2,
        label: `Header – ${op.type.replace(/-/g, ' ')} on ${wall} – ${formatInches(headerLen)}`,
      });

      // Window sill (for windows only)
      if (op.type === 'window') {
        cuts.push({
          phase: 'walls',
          lumberSize: framing.studSize,
          stockLength: studStockLen,
          cutLengthInches: op.width,
          qty: 1,
          label: `Sill plate – window on ${wall} – ${formatInches(op.width)}`,
        });
        // Cripple studs below sill
        const crippleCount = Math.max(1, Math.floor(op.width / framing.studSpacing));
        const crippleLen = 36 - 1.5; // sill height minus bottom plate
        cuts.push({
          phase: 'walls',
          lumberSize: framing.studSize,
          stockLength: studStockLen,
          cutLengthInches: crippleLen,
          qty: crippleCount,
          label: `Cripple stud (below sill) – window on ${wall} – ${formatInches(crippleLen)}`,
        });
      }

      // Cripple studs above header
      // headerHeight is from floor to top of rough opening (= top of trimmer + bottom plate)
      // The double 2x8 header (7.25" deep) sits above the trimmer, so add its depth
      const headerDepth = 7.25; // 2x8 on edge
      const headerTopInches = headerHeight + headerDepth - 1.5; // from top of bottom plate
      const crippleAboveLen = studHeightInches - headerTopInches;
      if (crippleAboveLen > 3) {
        const crippleAboveCount = Math.max(1, Math.floor(op.width / framing.studSpacing));
        cuts.push({
          phase: 'walls',
          lumberSize: framing.studSize,
          stockLength: studStockLen,
          cutLengthInches: crippleAboveLen,
          qty: crippleAboveCount,
          label: `Cripple stud (above header) – ${op.type.replace(/-/g, ' ')} on ${wall} – ${formatInches(crippleAboveLen)}`,
        });
      }
    }

    cuts.push({
      phase: 'walls',
      lumberSize: framing.studSize,
      stockLength: studStockLen,
      cutLengthInches: studHeightInches,
      qty: studs,
      label: `Stud – ${wall} wall – ${formatInches(studHeightInches)} @ ${framing.studSpacing}" O.C.`,
    });
  }

  // ── ROOF ──
  const rafterSize = framing.rafterSize;

  switch (roof.style) {
    case 'gable': {
      const halfSpan = width / 2;
      // Include overhang in horizontal run before computing slope length
      const totalRunInches = halfSpan * 12 + roof.overhang;
      const slopeFactor = Math.sqrt(1 + (roof.pitch / 12) ** 2);
      const rafterRunInches = totalRunInches * slopeFactor;
      const raftersPerSide = Math.ceil((length * 12) / framing.rafterSpacing) + 1;

      cuts.push({
        phase: 'roof',
        lumberSize: rafterSize,
        stockLength: standardLength(Math.ceil(rafterRunInches / 12)),
        cutLengthInches: rafterRunInches,
        qty: raftersPerSide * 2,
        label: `Common rafter – ${formatInches(rafterRunInches)} (${roof.pitch}/12 pitch, ${roof.overhang}" overhang)`,
        angleCuts: rafterAngleCuts(roof.pitch, roof.overhang),
      });

      // Ridge board
      pushContinuousMember(cuts, 'roof', '2x8', length * 12, 'Ridge board');
      break;
    }

    case 'lean-to': {
      // Include overhang in horizontal run before computing slope length
      const totalRunInches = width * 12 + roof.overhang * 2;
      const slopeFactor = Math.sqrt(1 + (roof.pitch / 12) ** 2);
      const rafterRunInches = totalRunInches * slopeFactor;
      const rafterCount = Math.ceil((length * 12) / framing.rafterSpacing) + 1;

      cuts.push({
        phase: 'roof',
        lumberSize: rafterSize,
        stockLength: standardLength(Math.ceil(rafterRunInches / 12)),
        cutLengthInches: rafterRunInches,
        qty: rafterCount,
        label: `Rafter – ${formatInches(rafterRunInches)} (${roof.pitch}/12 lean-to)`,
        angleCuts: rafterAngleCuts(roof.pitch, roof.overhang),
      });

      // Ledger board on high side
      pushContinuousMember(cuts, 'roof', '2x6', length * 12, 'Ledger board (high side)');
      break;
    }

    case 'gambrel': {
      const { lowerRad, upperRad } = gambrelAngles(roof.pitch);
      const qw = width / 4;
      // Include overhang in lower rafter horizontal run
      const lowerRunInches = (qw * 12 + roof.overhang) / Math.cos(lowerRad);
      const upperRunInches = (qw * 12) / Math.cos(upperRad);
      const raftersPerSide = Math.ceil((length * 12) / framing.rafterSpacing) + 1;

      const lowerDeg = parseFloat((lowerRad * 180 / Math.PI).toFixed(1));
      const upperDeg = parseFloat((upperRad * 180 / Math.PI).toFixed(1));
      const lowerPlumbDeg = parseFloat((90 - lowerDeg).toFixed(1));
      const upperPlumbDeg = parseFloat((90 - upperDeg).toFixed(1));

      // Lower gambrel slope
      cuts.push({
        phase: 'roof',
        lumberSize: rafterSize,
        stockLength: standardLength(Math.ceil(lowerRunInches / 12)),
        cutLengthInches: lowerRunInches,
        qty: raftersPerSide * 2,
        label: `Lower gambrel rafter – ${formatInches(lowerRunInches)} (${lowerDeg.toFixed(0)}° slope)`,
        angleCuts: [
          { type: 'plumb', angleDeg: lowerPlumbDeg, description: `Plumb cut at top: ${lowerPlumbDeg}° from square (meets upper rafter at gambrel break)` },
          { type: 'seat', angleDeg: lowerDeg, description: `Bird's mouth: ${lowerDeg}° seat cut at wall plate, depth = 2/3 rafter width` },
          ...(roof.overhang > 0 ? [{ type: 'tail' as const, angleDeg: lowerPlumbDeg, description: `Tail cut: ${lowerPlumbDeg}° plumb cut at overhang end (${roof.overhang}" past wall)` }] : []),
        ],
      });

      // Upper gambrel slope
      cuts.push({
        phase: 'roof',
        lumberSize: rafterSize,
        stockLength: standardLength(Math.ceil(upperRunInches / 12)),
        cutLengthInches: upperRunInches,
        qty: raftersPerSide * 2,
        label: `Upper gambrel rafter – ${formatInches(upperRunInches)} (${upperDeg.toFixed(0)}° slope)`,
        angleCuts: [
          { type: 'plumb', angleDeg: upperPlumbDeg, description: `Plumb cut at ridge: ${upperPlumbDeg}° from square` },
          { type: 'seat', angleDeg: upperDeg, description: `Seat cut at gambrel break: ${upperDeg}° where upper meets lower rafter, secured with gusset plate` },
        ],
      });

      pushContinuousMember(cuts, 'roof', '2x8', length * 12, 'Ridge board');
      break;
    }

    case 'hip': {
      const halfSpan = width / 2;
      // Include overhang in horizontal run before computing slope length
      const totalRunInches = halfSpan * 12 + roof.overhang;
      const slopeFactor = Math.sqrt(1 + (roof.pitch / 12) ** 2);
      const commonRunInches = totalRunInches * slopeFactor;
      const ridgeLen = Math.max(0, length - width);
      const commonPerSide = Math.ceil((ridgeLen * 12) / framing.rafterSpacing) + 1;

      cuts.push({
        phase: 'roof',
        lumberSize: rafterSize,
        stockLength: standardLength(Math.ceil(commonRunInches / 12)),
        cutLengthInches: commonRunInches,
        qty: commonPerSide * 2,
        label: `Common rafter – ${formatInches(commonRunInches)} (${roof.pitch}/12)`,
        angleCuts: rafterAngleCuts(roof.pitch, roof.overhang),
      });

      // Hip rafters (run at 45° in plan, so longer)
      // Overhang extends the horizontal run; hip runs at 45° in plan
      const hipRunHoriz = totalRunInches * Math.SQRT2;
      const hipRiseInches = totalRunInches * roof.pitch / 12;
      const hipRunInches = Math.sqrt(hipRunHoriz ** 2 + hipRiseInches ** 2);
      cuts.push({
        phase: 'roof',
        lumberSize: rafterSize,
        stockLength: standardLength(Math.ceil(hipRunInches / 12)),
        cutLengthInches: hipRunInches,
        qty: 4,
        label: `Hip rafter – ${formatInches(hipRunInches)}`,
        angleCuts: hipRafterAngleCuts(roof.pitch),
      });

      // Jack rafters (progressively shorter)
      const jackCount = Math.ceil((halfSpan * 12) / framing.rafterSpacing);
      const jackAngleCuts = jackRafterAngleCuts(roof.pitch, roof.overhang);
      for (let i = 1; i <= jackCount; i++) {
        const fraction = i / (jackCount + 1);
        const jackRun = commonRunInches * (1 - fraction);
        if (jackRun > 12) {
          cuts.push({
            phase: 'roof',
            lumberSize: rafterSize,
            stockLength: standardLength(Math.ceil(jackRun / 12)),
            cutLengthInches: Math.round(jackRun),
            qty: 4, // 2 per hip end, mirrored
            label: `Jack rafter #${i} – ${formatInches(Math.round(jackRun))}`,
            angleCuts: jackAngleCuts,
          });
        }
      }

      if (ridgeLen > 0) {
        pushContinuousMember(cuts, 'roof', '2x8', ridgeLen * 12, 'Ridge board');
      }
      break;
    }
  }

  // Gable end studs (triangular framing above top plate)
  if (roof.style === 'gable' || roof.style === 'gambrel') {
    const gableWidthInches = width * 12;
    const spacing = framing.studSpacing;
    for (let x = spacing; x < gableWidthInches; x += spacing) {
      const dist = Math.min(x, gableWidthInches - x);
      let studHeight: number;
      if (roof.style === 'gable') {
        studHeight = dist * (roof.pitch / 12);
      } else {
        const halfSpan = gableWidthInches / 2;
        const rise = halfSpan * (roof.pitch / 12) * 1.5;
        studHeight = (dist / halfSpan) * rise;
      }
      if (studHeight >= 6) {
        cuts.push({
          phase: 'walls',
          lumberSize: framing.studSize,
          stockLength: standardLength(Math.ceil(studHeight / 12)),
          cutLengthInches: Math.round(studHeight * 16) / 16, // round to 1/16
          qty: 2, // one per gable end
          label: `Gable stud at ${formatInches(x)} from edge – ${formatInches(studHeight)}, top cut at ${roof.pitch}/12 pitch`,
        });
      }
    }
  }

  // Outriggers / lookouts (support rake overhang on gable ends)
  if ((roof.style === 'gable' || roof.style === 'gambrel') && roof.overhang > 0) {
    const outriggerLenInches = roof.overhang + 16; // overhang + bearing
    const rafterLen = roof.style === 'gable'
      ? (width / 2 * 12 + roof.overhang) * Math.sqrt(1 + (roof.pitch / 12) ** 2)
      : width / 2 * 12; // approximate for gambrel
    const outriggersPerRake = Math.ceil(rafterLen / 24);
    const totalOutriggers = outriggersPerRake * 4;
    cuts.push({
      phase: 'roof',
      lumberSize: framing.rafterSize,
      stockLength: standardLength(Math.ceil(outriggerLenInches / 12)),
      cutLengthInches: outriggerLenInches,
      qty: totalOutriggers,
      label: `Outrigger/lookout – ${formatInches(outriggerLenInches)} (supports rake overhang)`,
    });
  }

  // Fascia boards
  pushContinuousMember(cuts, 'trim', '1x6', length * 12, 'Fascia board (eave)', 2);

  if (roof.style === 'gable' || roof.style === 'gambrel') {
    const halfSpan = width / 2;
    let rise: number;
    if (roof.style === 'gable') {
      rise = (halfSpan * roof.pitch) / 12;
    } else {
      const { lowerRad, upperRad } = gambrelAngles(roof.pitch);
      const qw = width / 4;
      rise = qw * Math.tan(lowerRad) + qw * Math.tan(upperRad);
    }
    // Rake board follows the rafter slope; include overhang in horizontal run
    const totalRakeRunInches = halfSpan * 12 + roof.overhang;
    const rakeLen = roof.style === 'gable'
      ? totalRakeRunInches * Math.sqrt(1 + (roof.pitch / 12) ** 2)
      : Math.sqrt((halfSpan * 12 + roof.overhang) ** 2 + (rise * 12) ** 2); // gambrel: approximate
    cuts.push({
      phase: 'trim',
      lumberSize: '1x6',
      stockLength: standardLength(Math.ceil(rakeLen / 12)),
      cutLengthInches: Math.round(rakeLen),
      qty: 4, // 2 per gable end
      label: `Rake/barge board – ${formatInches(Math.round(rakeLen))}`,
    });
  }

  return cuts;
}
