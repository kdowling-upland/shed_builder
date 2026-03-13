import type { CutItem } from '../../engine/calculator/cutlist.ts';
import { formatInches } from '../../engine/calculator/cutlist.ts';

interface CutListViewProps {
  cutList: CutItem[];
}

const PHASE_LABELS: Record<string, string> = {
  foundation: 'Foundation',
  floor: 'Floor',
  walls: 'Walls',
  roof: 'Roof',
  trim: 'Trim',
};

const PHASE_ORDER = ['foundation', 'floor', 'walls', 'roof', 'trim'];

export function CutListView({ cutList }: CutListViewProps) {
  const byPhase = new Map<string, CutItem[]>();
  for (const cut of cutList) {
    const list = byPhase.get(cut.phase) ?? [];
    list.push(cut);
    byPhase.set(cut.phase, list);
  }

  let globalIndex = 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-1 text-white">Cut List</h3>
      <p className="text-xs text-gray-400 mb-4">Every piece of lumber to cut, organized by phase.</p>

      {PHASE_ORDER.map((phase) => {
        const cuts = byPhase.get(phase);
        if (!cuts?.length) return null;
        return (
          <div key={phase} className="mb-6">
            <h4 className="text-sm font-semibold text-blue-400 mb-2 uppercase tracking-wide">
              {PHASE_LABELS[phase] ?? phase}
            </h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-center py-1 w-8">#</th>
                  <th className="text-left py-1 px-2">Lumber</th>
                  <th className="text-center py-1 px-2">Stock</th>
                  <th className="text-center py-1 px-2 font-bold">Cut To</th>
                  <th className="text-center py-1 px-2">Qty</th>
                  <th className="text-left py-1 px-2">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {cuts.map((cut, i) => {
                  globalIndex++;
                  return (
                    <tr key={i} className="border-b border-gray-700/50">
                      <td className="text-center py-1.5 text-gray-500 font-mono text-xs">{globalIndex}</td>
                      <td className="py-1.5 px-2 text-gray-100 font-semibold">{cut.lumberSize}</td>
                      <td className="text-center py-1.5 px-2 text-gray-400">{cut.stockLength}'</td>
                      <td className="text-center py-1.5 px-2 text-white font-bold font-mono">
                        {formatInches(cut.cutLengthInches)}
                      </td>
                      <td className="text-center py-1.5 px-2 text-gray-200">x{cut.qty}</td>
                      <td className="py-1.5 px-2 text-gray-300 text-xs">
                        <div>{cut.label}</div>
                        {cut.angleCuts && cut.angleCuts.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {cut.angleCuts.map((ac, j) => (
                              <div key={j} className="flex items-start gap-1 text-amber-400/80">
                                <span className="shrink-0">&#x2220;</span>
                                <span>{ac.description}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
