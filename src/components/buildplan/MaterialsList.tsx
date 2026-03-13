import type { MaterialItem, MaterialCategory } from '../../types/materials.ts';
import { formatCurrency } from '../../utils/formatting.ts';

interface MaterialsListProps {
  materials: MaterialItem[];
}

const CATEGORY_ORDER: MaterialCategory[] = [
  'foundation', 'floor', 'walls', 'roof', 'siding', 'openings', 'fasteners',
];

const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  foundation: 'Foundation',
  floor: 'Floor',
  walls: 'Wall Framing',
  roof: 'Roof',
  siding: 'Siding',
  openings: 'Doors & Windows',
  fasteners: 'Fasteners & Hardware',
};

export function MaterialsList({ materials }: MaterialsListProps) {
  const grouped = new Map<MaterialCategory, MaterialItem[]>();
  for (const item of materials) {
    const list = grouped.get(item.category) ?? [];
    list.push(item);
    grouped.set(item.category, list);
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-white">Materials List</h3>
      {CATEGORY_ORDER.map((cat) => {
        const items = grouped.get(cat);
        if (!items?.length) return null;
        return (
          <div key={cat} className="mb-6">
            <h4 className="text-sm font-semibold text-blue-400 mb-2 uppercase tracking-wide">
              {CATEGORY_LABELS[cat]}
            </h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left py-1 pr-4">Item</th>
                  <th className="text-right py-1 px-2">Qty</th>
                  <th className="text-right py-1 px-2">Unit</th>
                  <th className="text-right py-1 px-2">Unit Price</th>
                  <th className="text-right py-1 pl-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-700/50">
                    <td className="py-1.5 pr-4">
                      <div className="text-gray-200">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </td>
                    <td className="text-right py-1.5 px-2 text-gray-200">{item.quantity}</td>
                    <td className="text-right py-1.5 px-2 text-gray-400">{item.unit}</td>
                    <td className="text-right py-1.5 px-2 text-gray-300">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right py-1.5 pl-2 text-gray-100 font-medium">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
