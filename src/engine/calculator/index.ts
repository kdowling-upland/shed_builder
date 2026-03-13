import type { ShedDesign } from '../../types/shed.ts';
import type { BuildPlan } from '../../types/buildPlan.ts';
import { calculateFoundation } from './foundation.ts';
import { calculateFloor } from './floor.ts';
import { calculateFraming } from './framing.ts';
import { calculateRoof } from './roof.ts';
import { calculateSiding } from './siding.ts';
import { calculateOpenings } from './openings.ts';
import { calculateFasteners } from './fasteners.ts';
import { generateInstructions } from './instructions.ts';

export function calculateBuildPlan(design: ShedDesign): BuildPlan {
  const materials = [
    ...calculateFoundation(design),
    ...calculateFloor(design),
    ...calculateFraming(design),
    ...calculateRoof(design),
    ...calculateSiding(design),
    ...calculateOpenings(design),
    ...calculateFasteners(design),
  ];

  const totalCost = materials.reduce((sum, m) => sum + m.totalPrice, 0);
  const steps = generateInstructions(design);

  return { materials, totalCost, steps };
}
