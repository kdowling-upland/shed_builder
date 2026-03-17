import type { ShedDesign } from '../../types/shed.ts';
import type { BuildPlan } from '../../types/buildPlan.ts';
import type { CutItem } from '../calculator/cutlist.ts';
import { formatInches } from '../calculator/cutlist.ts';
import { formatCurrency } from '../../utils/formatting.ts';
import type { MaterialCategory } from '../../types/materials.ts';

const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  foundation: 'Foundation',
  floor: 'Floor Framing',
  walls: 'Wall Framing',
  roof: 'Roofing',
  siding: 'Siding',
  openings: 'Doors & Windows',
  fasteners: 'Fasteners & Hardware',
};

const PHASE_LABELS: Record<string, string> = {
  foundation: 'Foundation',
  floor: 'Floor',
  walls: 'Walls',
  roof: 'Roof',
  trim: 'Trim',
};

export function generateMarkdown(
  design: ShedDesign,
  buildPlan: BuildPlan,
  cutList: CutItem[],
): string {
  const lines: string[] = [];

  // ── Title ──
  lines.push(`# ${design.name} — Build Plan`);
  lines.push('');

  // ── Specifications ──
  lines.push('## Specifications');
  lines.push('');
  lines.push(`| Spec | Value |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Footprint | ${design.width}' x ${design.length}' (${design.width * design.length} sq ft) |`);
  lines.push(`| Wall Height | ${design.wallHeight}' |`);
  lines.push(`| Roof | ${design.roof.style.charAt(0).toUpperCase() + design.roof.style.slice(1)} — ${design.roof.pitch}/12 pitch |`);
  lines.push(`| Overhang | ${design.roof.overhang}" |`);
  lines.push(`| Foundation | ${design.foundation.replace(/-/g, ' ')} |`);
  lines.push(`| Siding | ${design.siding.replace(/-/g, ' ')} |`);
  lines.push(`| Stud Framing | ${design.framing.studSize} @ ${design.framing.studSpacing}" O.C. |`);
  lines.push(`| Joist Framing | ${design.framing.joistSize} @ ${design.framing.joistSpacing}" O.C. |`);
  lines.push(`| Rafter Framing | ${design.framing.rafterSize} @ ${design.framing.rafterSpacing}" O.C. |`);
  lines.push('');

  // ── Cost Summary ──
  lines.push('## Estimated Cost');
  lines.push('');
  lines.push(`**Total: ${formatCurrency(buildPlan.totalCost)}**`);
  lines.push('');

  const categoryCosts: Record<string, number> = {};
  for (const item of buildPlan.materials) {
    categoryCosts[item.category] = (categoryCosts[item.category] ?? 0) + item.totalPrice;
  }

  lines.push('| Category | Cost |');
  lines.push('| --- | ---: |');
  for (const [cat, cost] of Object.entries(categoryCosts)) {
    lines.push(`| ${CATEGORY_LABELS[cat as MaterialCategory] ?? cat} | ${formatCurrency(cost)} |`);
  }
  lines.push('');
  lines.push('> *Prices are approximate US averages. Actual costs vary by region and market conditions.*');
  lines.push('');

  // ── Shopping List ──
  lines.push('## Shopping List');
  lines.push('');

  const grouped = new Map<string, typeof buildPlan.materials>();
  for (const item of buildPlan.materials) {
    const list = grouped.get(item.category) ?? [];
    list.push(item);
    grouped.set(item.category, list);
  }

  const categoryOrder: string[] = ['foundation', 'floor', 'walls', 'roof', 'siding', 'openings', 'fasteners'];

  for (const cat of categoryOrder) {
    const items = grouped.get(cat);
    if (!items?.length) continue;

    lines.push(`### ${CATEGORY_LABELS[cat as MaterialCategory] ?? cat}`);
    lines.push('');
    lines.push('| Item | Qty | Unit | Unit Price | Total |');
    lines.push('| --- | :---: | :---: | ---: | ---: |');
    for (const item of items) {
      const desc = item.description ? ` — ${item.description}` : '';
      lines.push(`| ${item.name}${desc} | ${item.quantity} | ${item.unit} | ${formatCurrency(item.unitPrice)} | ${formatCurrency(item.totalPrice)} |`);
    }
    lines.push('');
  }

  // ── Cut List ──
  lines.push('## Cut List');
  lines.push('');
  lines.push('Every piece of lumber you need to cut, organized by construction phase.');
  lines.push('');

  const phaseOrder = ['foundation', 'floor', 'walls', 'roof', 'trim'];
  const cutsByPhase = new Map<string, CutItem[]>();
  for (const cut of cutList) {
    const list = cutsByPhase.get(cut.phase) ?? [];
    list.push(cut);
    cutsByPhase.set(cut.phase, list);
  }

  let cutNumber = 1;

  for (const phase of phaseOrder) {
    const phaseCuts = cutsByPhase.get(phase);
    if (!phaseCuts?.length) continue;

    lines.push(`### ${PHASE_LABELS[phase] ?? phase}`);
    lines.push('');
    lines.push('| # | Lumber | Stock | Cut To | Qty | Purpose |');
    lines.push('| :---: | --- | :---: | :---: | :---: | --- |');
    for (const cut of phaseCuts) {
      lines.push(`| ${cutNumber} | ${cut.lumberSize} | ${cut.stockLength}' | ${formatInches(cut.cutLengthInches)} | x${cut.qty} | ${cut.label} |`);
      cutNumber++;
    }
    lines.push('');
  }

  // ── Construction Steps ──
  lines.push('## Step-by-Step Instructions');
  lines.push('');

  for (const step of buildPlan.steps) {
    lines.push(`### Step ${step.stepNumber}: ${step.title}`);
    lines.push('');
    lines.push(step.description);
    if (step.materials.length > 0) {
      lines.push('');
      lines.push(`*Materials: ${step.materials.join(', ')}*`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
