import type { MaterialItem } from './materials.ts';

export interface BuildStep {
  stepNumber: number;
  title: string;
  description: string;
  materials: string[];
}

export interface BuildPlan {
  materials: MaterialItem[];
  totalCost: number;
  steps: BuildStep[];
}
