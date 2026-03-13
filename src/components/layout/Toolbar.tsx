import { ViewToggle } from './ViewToggle.tsx';
import { useUndoRedo } from '../../hooks/useUndoRedo.ts';
import { useLocalStorage } from '../../hooks/useLocalStorage.ts';
import { useShedStore } from '../../store/useShedStore.ts';
import { useUIStore } from '../../store/useUIStore.ts';
import { calculateBuildPlan } from '../../engine/calculator/index.ts';
import { generateCutList } from '../../engine/calculator/cutlist.ts';
import { generatePDF } from '../../engine/pdf/pdfGenerator.ts';
import { useState, useCallback } from 'react';

export function Toolbar() {
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const { designNames, saveDesign, loadDesign, deleteDesign } = useLocalStorage();
  const design = useShedStore((s) => s.design);
  const loadDesignToStore = useShedStore((s) => s.loadDesign);
  const setName = useShedStore((s) => s.setName);
  const canvasRef = useUIStore((s) => s.canvasRef);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSave = () => {
    saveDesign(design);
    setShowSaveLoad(false);
  };

  const handleLoad = (name: string) => {
    const loaded = loadDesign(name);
    if (loaded) {
      loadDesignToStore(loaded);
      setShowSaveLoad(false);
    }
  };

  const handleExportPDF = useCallback(async () => {
    setExporting(true);
    try {
      await new Promise((r) => setTimeout(r, 50));

      let canvasImage: string | null = null;
      if (canvasRef) {
        canvasImage = canvasRef.toDataURL('image/png');
      }

      const buildPlan = calculateBuildPlan(design);
      const cutList = generateCutList(design);
      const doc = generatePDF(design, buildPlan, cutList, canvasImage);
      const safeName = design.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      doc.save(`${safeName}_Build_Plan.pdf`);
    } finally {
      setExporting(false);
    }
  }, [design, canvasRef]);

  return (
    <header className="bg-surface-panel border-b border-border-subtle px-5 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-amber-warm/15 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-amber-warm">
              <path d="M2 14V6l6-4 6 4v8H2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M6 14v-4h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 6l6-4 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-base font-display text-amber-warm tracking-wide">Shed Builder</h1>
        </div>
        <div className="w-px h-5 bg-border-subtle" />
        <input
          type="text"
          value={design.name}
          onChange={(e) => setName(e.target.value)}
          className="bg-surface-input text-gray-200 px-3 py-1.5 rounded-md border border-border-subtle text-sm w-40 font-body focus:border-amber-warm/50 focus:outline-none transition-colors placeholder:text-gray-600"
        />
      </div>

      <ViewToggle />

      <div className="flex items-center gap-2">
        <div className="flex items-center bg-surface-input rounded-md border border-border-subtle">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-r border-border-subtle"
            title="Undo"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6"/><path d="M3 13a9 9 0 0 1 15.36-6.36L21 9"/>
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Redo"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6"/><path d="M21 13a9 9 0 0 0-15.36-6.36L3 9"/>
            </svg>
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSaveLoad(!showSaveLoad)}
            className="px-3.5 py-1.5 text-sm text-gray-300 rounded-md hover:text-gray-100 hover:bg-surface-elevated border border-border-subtle transition-colors font-medium"
          >
            Save / Load
          </button>
          {showSaveLoad && (
            <div className="absolute right-0 top-full mt-2 bg-surface-elevated border border-border-medium rounded-lg shadow-2xl shadow-black/50 p-4 w-64 z-50">
              <button
                onClick={handleSave}
                className="w-full mb-3 px-3 py-2 bg-amber-warm/90 text-gray-950 rounded-md hover:bg-amber-glow text-sm font-semibold transition-colors"
              >
                Save &ldquo;{design.name}&rdquo;
              </button>
              {designNames.length > 0 && (
                <>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-semibold">Saved Designs</div>
                  {designNames.map((name) => (
                    <div key={name} className="flex items-center justify-between py-1.5 border-b border-border-subtle last:border-0">
                      <button
                        onClick={() => handleLoad(name)}
                        className="text-sm text-gray-300 hover:text-amber-warm truncate flex-1 text-left transition-colors"
                      >
                        {name}
                      </button>
                      <button
                        onClick={() => deleteDesign(name)}
                        className="text-xs text-red-400/60 hover:text-red-400 ml-2 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </>
              )}
              {designNames.length === 0 && (
                <p className="text-xs text-gray-600">No saved designs</p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="px-4 py-1.5 text-sm bg-amber-warm text-gray-950 rounded-md hover:bg-amber-glow font-semibold disabled:opacity-60 flex items-center gap-2 transition-colors"
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
    </header>
  );
}
