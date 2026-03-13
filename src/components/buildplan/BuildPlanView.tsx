import { useMemo, useCallback, useState } from 'react';
import { useShedStore } from '../../store/useShedStore.ts';
import { useUIStore } from '../../store/useUIStore.ts';
import { calculateBuildPlan } from '../../engine/calculator/index.ts';
import { generateCutList } from '../../engine/calculator/cutlist.ts';
import { generatePDF } from '../../engine/pdf/pdfGenerator.ts';
import { CostSummary } from './CostSummary.tsx';
import { MaterialsList } from './MaterialsList.tsx';
import { InstructionSteps } from './InstructionSteps.tsx';
import { CutListView } from './CutListView.tsx';

export function BuildPlanView() {
  const design = useShedStore((s) => s.design);
  const canvasRef = useUIStore((s) => s.canvasRef);
  const [exporting, setExporting] = useState(false);

  const buildPlan = useMemo(() => calculateBuildPlan(design), [design]);
  const cutList = useMemo(() => generateCutList(design), [design]);

  const handleExportPDF = useCallback(async () => {
    setExporting(true);
    try {
      // Small delay to let the UI show the spinner
      await new Promise((r) => setTimeout(r, 50));

      let canvasImage: string | null = null;
      if (canvasRef) {
        canvasImage = canvasRef.toDataURL('image/png');
      }

      const doc = generatePDF(design, buildPlan, cutList, canvasImage);
      const safeName = design.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      doc.save(`${safeName}_Build_Plan.pdf`);
    } finally {
      setExporting(false);
    }
  }, [design, buildPlan, cutList, canvasRef]);

  return (
    <div className="h-full overflow-y-auto bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{design.name} — Build Plan</h2>
            <p className="text-gray-400 text-sm mt-1">
              {design.width}' x {design.length}' x {design.wallHeight}' wall height
              &mdash; {design.roof.style} roof @ {design.roof.pitch}/12
              &mdash; {design.foundation.replace(/-/g, ' ')} foundation
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm"
            >
              Print
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-sm disabled:opacity-60 flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </>
              ) : (
                'Export PDF'
              )}
            </button>
          </div>
        </div>

        <CostSummary materials={buildPlan.materials} totalCost={buildPlan.totalCost} />
        <MaterialsList materials={buildPlan.materials} />
        <CutListView cutList={cutList} />
        <InstructionSteps steps={buildPlan.steps} />
      </div>
    </div>
  );
}
