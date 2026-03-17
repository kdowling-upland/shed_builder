import type { ShedDesign } from '../../types/shed.ts';
import type { BuildStep } from '../../types/buildPlan.ts';
import { gambrelAngles } from '../geometry/utils.ts';

export function generateInstructions(design: ShedDesign): BuildStep[] {
  const steps: BuildStep[] = [];
  let step = 1;

  // 1. Foundation
  const foundationLabels: Record<string, string> = {
    'skids': 'treated timber skids',
    'concrete-blocks': 'concrete deck blocks',
    'gravel-pad': 'compacted gravel pad',
    'concrete-slab': 'concrete slab',
  };

  steps.push({
    stepNumber: step++,
    title: 'Prepare the Site',
    description: `Clear and level a ${design.width + 2}'x${design.length + 2}' area. Remove grass, roots, and debris. Ensure the ground slopes slightly away from the planned shed location for drainage.`,
    materials: [],
  });

  steps.push({
    stepNumber: step++,
    title: 'Build the Foundation',
    description: `Install ${foundationLabels[design.foundation]}. ${getFoundationInstructions(design)}`,
    materials: ['Foundation materials'],
  });

  // 2. Floor frame
  steps.push({
    stepNumber: step++,
    title: 'Frame the Floor',
    description: `Build the floor frame using ${design.framing.joistSize} joists at ${design.framing.joistSpacing}" on center. Start by setting the two rim joists ${design.length}' long, then install band joists at each end. Fill in floor joists spanning the ${design.width}' width. Ensure the frame is square by measuring diagonals.`,
    materials: ['Rim joists', 'Band joists', 'Floor joists', 'Joist hangers'],
  });

  steps.push({
    stepNumber: step++,
    title: 'Install Subfloor',
    description: `Lay 3/4" plywood sheets over the floor frame. Stagger joints and leave 1/8" gaps between sheets for expansion. Fasten with 3" screws every 6" along edges and 12" in the field.`,
    materials: ['3/4" Plywood', '3" screws'],
  });

  // 3. Walls
  steps.push({
    stepNumber: step++,
    title: 'Frame the Walls',
    description: `Build all four wall frames on the subfloor using ${design.framing.studSize} studs at ${design.framing.studSpacing}" on center. Include single bottom plate and double top plate. Frame 3-stud corners. ${design.openings.length > 0 ? `Frame openings with king studs, trimmers, and headers for ${design.openings.length} opening(s).` : ''}`,
    materials: ['Studs', 'Plates', 'Headers', 'King studs', 'Trimmers'],
  });

  steps.push({
    stepNumber: step++,
    title: 'Raise and Brace Walls',
    description: `Raise the back wall first and brace temporarily. Raise side walls and nail to back wall corners. Raise front wall last. Check plumb and level, then nail all corners and top plates together. Overlap top plates at corners for strength.`,
    materials: ['16d framing nails', 'Temporary braces'],
  });

  // Gable end framing step (for gable and gambrel roofs)
  if (design.roof.style === 'gable' || design.roof.style === 'gambrel') {
    steps.push({
      stepNumber: step++,
      title: 'Frame the Gable Ends',
      description: `Build triangular stud walls above the double top plate on the two ${design.width}' walls (front and back). Install vertical gable studs at ${design.framing.studSpacing}" on center, cut to increasing heights to match the ${design.roof.pitch}/12 roof pitch. Angle-cut the top of each stud to sit flush against the underside of the rafters. These studs provide nailing surface for the gable siding and close off the roof peak.`,
      materials: ['Gable studs', '16d framing nails'],
    });
  }

  // 4. Roof
  steps.push({
    stepNumber: step++,
    title: 'Install Roof Framing',
    description: getRoofFramingInstructions(design),
    materials: ['Rafters', 'Ridge board', 'Hurricane ties'],
  });

  steps.push({
    stepNumber: step++,
    title: 'Sheath the Roof',
    description: `Install 7/16" OSB sheathing starting from the bottom edge. Stagger joints and leave 1/8" gaps. Fasten with 8d nails every 6" on edges and 12" in the field. Ensure sheathing is flush with rafter tails at eaves.`,
    materials: ['OSB sheathing', '8d nails'],
  });

  steps.push({
    stepNumber: step++,
    title: 'Install Roofing',
    description: `Install drip edge along eaves first, then underlayment starting from the bottom. Overlap courses by 2". Install drip edge over underlayment on rakes. Snap chalk lines and install shingles starting from the bottom, with proper offset pattern and 5" exposure.`,
    materials: ['Drip edge', 'Underlayment', 'Shingles', 'Roofing nails'],
  });

  // 5. Siding
  steps.push({
    stepNumber: step++,
    title: 'Install Siding',
    description: `Install ${design.siding.replace(/-/g, ' ')} siding on all four walls. Start from the bottom and work up. Leave 1/2" gap at the bottom for air circulation. Cut openings for doors and windows. Caulk all joints and seams.`,
    materials: ['Siding', '8d nails', 'Caulk'],
  });

  // 6. Openings
  if (design.openings.length > 0) {
    steps.push({
      stepNumber: step++,
      title: 'Install Doors and Windows',
      description: `Install pre-hung doors and windows into framed openings. Shim for plumb and level. Secure with screws through jamb into framing. Install drip caps above openings. Apply exterior trim and caulk all edges.`,
      materials: ['Doors', 'Windows', 'Shims', 'Trim', 'Caulk'],
    });
  }

  // 7. Finishing
  steps.push({
    stepNumber: step++,
    title: 'Finishing Touches',
    description: `Install any remaining trim, fascia boards, and soffit. Paint or stain siding and trim. Install door hardware (handles, locks). Add weatherstripping to doors. Consider adding a ramp for easy access.`,
    materials: ['Trim', 'Paint/Stain', 'Hardware', 'Weatherstripping'],
  });

  return steps;
}

function getFoundationInstructions(design: ShedDesign): string {
  switch (design.foundation) {
    case 'skids':
      return `Lay treated 4x4 timbers parallel to the ${design.length}' dimension, spaced evenly across the ${design.width}' width. Level each skid using gravel or shims. Ensure all skids are level with each other.`;
    case 'concrete-blocks':
      return `Place concrete deck blocks at each corner and every 4' along the perimeter. Add interior blocks on a 4'x4' grid. Level each block using sand or gravel. All blocks must be level with each other within 1/4".`;
    case 'gravel-pad':
      return `Excavate 4" deep over the ${design.width + 2}'x${design.length + 2}' area. Install landscape fabric, then fill with crushed gravel. Compact with a plate compactor and verify level.`;
    case 'concrete-slab':
      return `Build forms for a ${design.width}'x${design.length}' slab, 4" thick. Install vapor barrier and wire mesh. Pour concrete, screed level, and finish with a broom texture. Install anchor bolts before concrete sets. Allow 3-7 days to cure.`;
  }
}

function getRoofFramingInstructions(design: ShedDesign): string {
  const pitch = design.roof.pitch;
  const overhang = design.roof.overhang;
  const plumbDeg = parseFloat((Math.atan2(pitch, 12) * (180 / Math.PI)).toFixed(1));
  const seatDeg = parseFloat((90 - plumbDeg).toFixed(1));

  const birdsMouthNote = `Cut the bird's mouth where each rafter sits on the wall plate: make a ${seatDeg}° seat cut (horizontal) and a plumb notch, cutting no deeper than 2/3 the rafter width.`;
  const tailNote = overhang > 0
    ? ` Make a ${plumbDeg}° plumb cut at the tail end for the ${overhang}" overhang.`
    : '';

  switch (design.roof.style) {
    case 'gable':
      return `Install the ridge board at the peak, supported by temporary posts. Cut common rafters with a ${pitch}/12 pitch — set your miter saw to ${plumbDeg}° from square for the plumb (ridge) cut at the top. ${birdsMouthNote}${tailNote} Install rafters at ${design.framing.rafterSpacing}" on center, working from one end to the other. Attach with hurricane ties at the wall plate.${overhang > 0 ? ` Install outrigger blocks (lookouts) from the first interior rafter past each gable wall to support the ${overhang}" rake overhang. Space lookouts every 24" along the rake and nail through the gable-end rafter into each block.` : ''} See the cut list for exact angles.`;
    case 'lean-to':
      return `The front wall is higher than the back wall by ${((design.width * pitch) / 12).toFixed(1)}'. Cut each rafter with a ${plumbDeg}° plumb cut at the high end. ${birdsMouthNote}${tailNote} Install rafters from the high wall to the low wall at ${design.framing.rafterSpacing}" on center with ${overhang}" overhang. Attach with hurricane ties.`;
    case 'gambrel': {
      const { lowerRad, upperRad } = gambrelAngles(pitch);
      const lowerDeg = parseFloat((lowerRad * 180 / Math.PI).toFixed(1));
      const upperDeg = parseFloat((upperRad * 180 / Math.PI).toFixed(1));
      const lowerPlumbDeg = parseFloat((90 - lowerDeg).toFixed(1));
      const upperPlumbDeg = parseFloat((90 - upperDeg).toFixed(1));
      return `Install the ridge board at the peak. For the lower rafters (${lowerDeg.toFixed(0)}° slope): cut a ${lowerPlumbDeg}° plumb cut at the top and a ${lowerDeg}° bird's mouth at the wall plate, no deeper than 2/3 rafter width.${overhang > 0 ? ` Make a ${lowerPlumbDeg}° tail cut for the ${overhang}" overhang.` : ''} For the upper rafters (${upperDeg.toFixed(0)}° slope): cut a ${upperPlumbDeg}° plumb cut at the ridge end and a ${upperDeg}° seat cut at the gambrel break. Connect upper and lower rafters with gusset plates at the break point. Install gambrel trusses at ${design.framing.rafterSpacing}" on center. Attach with hurricane ties.`;
    }
    case 'hip': {
      const effectivePitch = pitch / Math.SQRT2;
      const hipPlumbDeg = parseFloat((Math.atan2(effectivePitch, 12) * (180 / Math.PI)).toFixed(1));
      return `Install the ridge board (shorter than building length by ${design.width}'). Cut common rafters with a ${plumbDeg}° plumb cut at the ridge and a bird's mouth at the plate (${seatDeg}° seat cut, 2/3 depth).${tailNote} Install common rafters on the long sides at ${design.framing.rafterSpacing}" on center. For the 4 hip rafters, make compound cuts: ${hipPlumbDeg}° plumb with a 45° cheek angle at both ends. Cut jack rafters with the same plumb and bird's mouth as commons, plus a 45° cheek cut where they meet the hip rafter. Fill in jack rafters on the hip sections at ${design.framing.rafterSpacing}" on center. Attach all rafters with hurricane ties.`;
    }
  }
}
