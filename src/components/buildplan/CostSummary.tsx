import type { MaterialItem, MaterialCategory } from '../../types/materials.ts';
import { formatCurrency } from '../../utils/formatting.ts';

interface CostSummaryProps {
  materials: MaterialItem[];
  totalCost: number;
}

const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  foundation: 'Foundation',
  floor: 'Floor',
  walls: 'Wall Framing',
  roof: 'Roof',
  siding: 'Siding',
  openings: 'Doors & Windows',
  fasteners: 'Fasteners & Hardware',
};

export function CostSummary({ materials, totalCost }: CostSummaryProps) {
  const categoryCosts: Record<string, number> = {};
  for (const item of materials) {
    categoryCosts[item.category] = (categoryCosts[item.category] ?? 0) + item.totalPrice;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-white">Cost Summary</h3>
      <div className="space-y-2">
        {Object.entries(categoryCosts).map(([cat, cost]) => (
          <div key={cat} className="flex justify-between text-sm">
            <span className="text-gray-300">{CATEGORY_LABELS[cat as MaterialCategory] ?? cat}</span>
            <span className="text-gray-100">{formatCurrency(cost)}</span>
          </div>
        ))}
        <div className="border-t border-gray-600 pt-2 mt-3 flex justify-between font-semibold">
          <span className="text-white">Total Estimated Cost</span>
          <span className="text-green-400 text-lg">{formatCurrency(totalCost)}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        * Prices are approximate US averages and may vary by region and market conditions.
      </p>
    </div>
  );
}
