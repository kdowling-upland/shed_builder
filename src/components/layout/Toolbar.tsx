import { ViewToggle } from './ViewToggle.tsx';
import { useUndoRedo } from '../../hooks/useUndoRedo.ts';
import { useLocalStorage } from '../../hooks/useLocalStorage.ts';
import { useShedStore } from '../../store/useShedStore.ts';
import { useUIStore } from '../../store/useUIStore.ts';
import { calculateBuildPlan } from '../../engine/calculator/index.ts';
import { generateCutList } from '../../engine/calculator/cutlist.ts';
import { generatePDF } from '../../engine/pdf/pdfGenerator.ts';
import { generateMarkdown } from '../../engine/markdown/markdownGenerator.ts';
import { useState, useCallback, useRef, useEffect } from 'react';

export function Toolbar() {
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const { designNames, saveDesign, loadDesign, deleteDesign } = useLocalStorage();
  const design = useShedStore((s) => s.design);
  const loadDesignToStore = useShedStore((s) => s.loadDesign);
  const setName = useShedStore((s) => s.setName);
  const canvasRef = useUIStore((s) => s.canvasRef);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    if (showExportMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

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
    setShowExportMenu(false);
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

  const handleExportMarkdown = useCallback(() => {
    setShowExportMenu(false);
    const buildPlan = calculateBuildPlan(design);
    const cutList = generateCutList(design);
    const md = generateMarkdown(design, buildPlan, cutList);
    const safeName = design.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}_Build_Plan.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [design]);

  return (
    <header className="bg-surface-elevated border-b border-border-subtle px-5 py-2 flex items-center justify-between shrink-0">
      {/* Left group: logo + name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-text-secondary">
            <path d="M2 14V6l6-4 6 4v8H2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M6 14v-4h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs font-semibold text-text-primary tracking-wide">Shed Builder</span>
        </div>
        <div className="w-px h-4 bg-border-medium/40" />
        <input
          type="text"
          value={design.name}
          onChange={(e) => setName(e.target.value)}
          className="bg-surface-input text-text-primary px-2 py-0.5 rounded-sm border border-border-subtle text-xs w-36 font-body focus:border-accent focus:outline-none transition-colors"
        />
      </div>

      {/* Center: view toggle */}
      <ViewToggle />

      {/* Right group: actions */}
      <div className="flex items-center gap-2.5">
        {/* Undo / Redo */}
        <div className="flex items-center rounded-sm overflow-hidden border border-border-medium">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="px-3.5 py-2.5 bg-surface-panel text-text-secondary hover:text-text-primary hover:bg-surface-elevated disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6"/><path d="M3 13a9 9 0 0 1 15.36-6.36L21 9"/>
            </svg>
          </button>
          <div className="w-px self-stretch bg-border-medium" />
          <button
            onClick={redo}
            disabled={!canRedo}
            className="px-3.5 py-2.5 bg-surface-panel text-text-secondary hover:text-text-primary hover:bg-surface-elevated disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6"/><path d="M21 13a9 9 0 0 0-15.36-6.36L3 9"/>
            </svg>
          </button>
        </div>

        <div className="w-px h-6 bg-border-medium/40" />

        {/* Edit Prices */}
        <button
          onClick={() => useUIStore.getState().setPricingModalOpen(true)}
          className="px-4 py-2.5 text-[11px] text-text-secondary rounded-sm hover:text-text-primary bg-surface-panel hover:bg-surface-elevated border border-border-medium transition-colors font-medium flex items-center gap-1.5"
          title="Edit Material Prices"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          Prices
        </button>

        {/* Save / Load */}
        <div className="relative">
          <button
            onClick={() => setShowSaveLoad(!showSaveLoad)}
            className="px-4 py-2.5 text-[11px] text-text-secondary rounded-sm hover:text-text-primary bg-surface-panel hover:bg-surface-elevated border border-border-medium transition-colors font-medium flex items-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
            </svg>
            Save / Load
          </button>
          {showSaveLoad && (
            <div className="absolute right-0 top-full mt-2 bg-surface-elevated border border-border-medium rounded-sm shadow-xl shadow-black/50 p-3 w-56 z-50">
              <button
                onClick={handleSave}
                className="w-full mb-2.5 px-3 py-2 bg-accent text-white rounded-sm hover:bg-accent-hover text-xs font-semibold transition-colors"
              >
                Save &ldquo;{design.name}&rdquo;
              </button>
              {designNames.length > 0 && (
                <>
                  <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-semibold">Saved Designs</div>
                  {designNames.map((name) => (
                    <div key={name} className="flex items-center justify-between py-1.5 border-b border-border-subtle last:border-0">
                      <button
                        onClick={() => handleLoad(name)}
                        className="text-xs text-text-secondary hover:text-text-primary truncate flex-1 text-left transition-colors"
                      >
                        {name}
                      </button>
                      <button
                        onClick={() => deleteDesign(name)}
                        className="text-[10px] text-red-400/50 hover:text-red-400 ml-3 transition-colors"
                      >
                        Del
                      </button>
                    </div>
                  ))}
                </>
              )}
              {designNames.length === 0 && (
                <p className="text-[10px] text-text-muted">No saved designs</p>
              )}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-border-medium/40" />

        {/* Export */}
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={exporting}
            className="px-5 py-2.5 text-[11px] bg-accent text-white rounded-sm hover:bg-accent-hover font-semibold disabled:opacity-50 flex items-center gap-1.5 transition-colors border border-accent-hover/50"
          >
            {exporting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                Export
                <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor"><path d="M2 4l3 3 3-3" /></svg>
              </>
            )}
          </button>
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 bg-surface-elevated border border-border-medium rounded-sm shadow-xl shadow-black/50 py-1 w-36 z-50">
              <button
                onClick={handleExportPDF}
                className="w-full px-3.5 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-accent-muted text-left transition-colors"
              >
                PDF Document
              </button>
              <button
                onClick={handleExportMarkdown}
                className="w-full px-3.5 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-accent-muted text-left transition-colors"
              >
                Markdown
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
