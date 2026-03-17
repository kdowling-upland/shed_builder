import { useEffect, useRef } from 'react';
import { usePriceStore } from '../../store/usePriceStore.ts';
import { useUIStore } from '../../store/useUIStore.ts';

interface PriceRowProps {
  label: string;
  value: number;
  unit: string;
  onChange: (v: number) => void;
}

function PriceRow({ label, value, unit, onChange }: PriceRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-[11px] text-text-secondary truncate">{label}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-text-muted text-[10px]">$</span>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!Number.isNaN(v) && v >= 0) onChange(v);
          }}
          step="0.25"
          min="0"
          className="w-20 bg-surface-input text-text-primary px-2 py-0.5 rounded-sm border border-border-subtle text-[11px] text-right font-body tabular-nums focus:border-accent focus:outline-none transition-colors"
        />
        <span className="text-[10px] text-text-muted w-16 truncate">{unit}</span>
      </div>
    </div>
  );
}

interface CategoryProps {
  title: string;
  children: React.ReactNode;
}

function Category({ title, children }: CategoryProps) {
  return (
    <div>
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1.5 mt-0.5">{title}</h4>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

const LUMBER_LABELS: Record<string, string> = {
  '2x4x8': '2x4 x 8\'', '2x4x10': '2x4 x 10\'', '2x4x12': '2x4 x 12\'', '2x4x16': '2x4 x 16\'',
  '2x6x8': '2x6 x 8\'', '2x6x10': '2x6 x 10\'', '2x6x12': '2x6 x 12\'', '2x6x16': '2x6 x 16\'',
  '2x8x8': '2x8 x 8\'', '2x8x10': '2x8 x 10\'', '2x8x12': '2x8 x 12\'', '2x8x16': '2x8 x 16\'',
  '2x10x8': '2x10 x 8\'', '2x10x10': '2x10 x 10\'', '2x10x12': '2x10 x 12\'', '2x10x16': '2x10 x 16\'',
  '2x12x8': '2x12 x 8\'', '2x12x12': '2x12 x 12\'', '2x12x16': '2x12 x 16\'',
};

const SHEATHING_LABELS: Record<string, string> = {
  'osb-7/16': '7/16" OSB', 'osb-23/32': '23/32" OSB',
  'plywood-1/2': '1/2" Plywood', 'plywood-3/4': '3/4" Plywood',
};

const SIDING_LABELS: Record<string, string> = {
  't1-11': 'T1-11 Plywood', 'lp-smartside': 'LP SmartSide',
  'vinyl': 'Vinyl', 'cedar': 'Cedar', 'board-and-batten': 'Board & Batten',
};

const ROOFING_LABELS: Record<string, string> = {
  shingles: 'Shingles (bundle)', underlayment: 'Underlayment (roll)', dripEdge: 'Drip Edge (10ft)',
};

const FOUNDATION_LABELS: Record<string, string> = {
  concreteBlock: 'Concrete Block', skid4x4x8: '4x4x8 Treated Timber',
  gravelPerCubicYard: 'Gravel (cu yd)', concretePerCubicYard: 'Concrete (cu yd)',
};

const FASTENER_LABELS: Record<string, string> = {
  nails16d: '16d Nail (each)', nails8d: '8d Nail (each)', screws3inch: '3" Screw (each)',
  joistHanger: 'Joist Hanger', hurricaneTie: 'Hurricane Tie',
  ridgeConnector: 'Ridge Connector', anchorBolt: 'Anchor Bolt',
};

const OPENING_LABELS: Record<string, string> = {
  'single-door': 'Single Door', 'double-door': 'Double Door',
  'window': 'Window', 'loft-door': 'Loft Door',
};

export function PricingModal() {
  const open = useUIStore((s) => s.pricingModalOpen);
  const close = () => useUIStore.getState().setPricingModalOpen(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const lumber = usePriceStore((s) => s.lumber);
  const sheathing = usePriceStore((s) => s.sheathing);
  const siding = usePriceStore((s) => s.siding);
  const roofing = usePriceStore((s) => s.roofing);
  const foundation = usePriceStore((s) => s.foundation);
  const fasteners = usePriceStore((s) => s.fasteners);
  const openings = usePriceStore((s) => s.openings);

  const setLumber = usePriceStore((s) => s.setLumberPrice);
  const setSheathing = usePriceStore((s) => s.setSheathingPrice);
  const setSiding = usePriceStore((s) => s.setSidingPrice);
  const setRoofing = usePriceStore((s) => s.setRoofingPrice);
  const setFoundation = usePriceStore((s) => s.setFoundationPrice);
  const setFastener = usePriceStore((s) => s.setFastenerPrice);
  const setOpening = usePriceStore((s) => s.setOpeningPrice);
  const resetAll = usePriceStore((s) => s.resetAllPrices);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) close(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-surface-panel border border-border-medium rounded-sm shadow-2xl shadow-black/60 w-[600px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle shrink-0 bg-surface-header">
          <div>
            <h2 className="text-sm font-bold text-text-primary">Material Pricing</h2>
            <p className="text-[10px] text-text-muted mt-0.5">Adjust prices to match your local market</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetAll}
              className="text-[10px] text-text-muted hover:text-text-secondary uppercase tracking-wider font-semibold transition-colors"
            >
              Reset Defaults
            </button>
            <button
              onClick={close}
              className="w-6 h-6 flex items-center justify-center rounded-sm text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-4 py-3 space-y-4 flex-1">
          <Category title="Lumber">
            {Object.entries(lumber).map(([key, price]) => (
              <PriceRow key={key} label={LUMBER_LABELS[key] ?? key} value={price} unit="/piece" onChange={(v) => setLumber(key, v)} />
            ))}
          </Category>

          <Category title="Sheathing">
            {Object.entries(sheathing).map(([key, price]) => (
              <PriceRow key={key} label={SHEATHING_LABELS[key] ?? key} value={price} unit="/sheet (4x8)" onChange={(v) => setSheathing(key, v)} />
            ))}
          </Category>

          <Category title="Siding">
            {Object.entries(siding).map(([key, info]) => (
              <PriceRow key={key} label={SIDING_LABELS[key] ?? key} value={info.price} unit={`/${info.unit}`} onChange={(v) => setSiding(key, v)} />
            ))}
          </Category>

          <Category title="Roofing">
            {Object.entries(roofing).map(([key, price]) => (
              <PriceRow key={key} label={ROOFING_LABELS[key] ?? key} value={price} unit="/each" onChange={(v) => setRoofing(key, v)} />
            ))}
          </Category>

          <Category title="Foundation">
            {Object.entries(foundation).map(([key, price]) => (
              <PriceRow key={key} label={FOUNDATION_LABELS[key] ?? key} value={price} unit="/each" onChange={(v) => setFoundation(key, v)} />
            ))}
          </Category>

          <Category title="Fasteners & Hardware">
            {Object.entries(fasteners).map(([key, price]) => (
              <PriceRow key={key} label={FASTENER_LABELS[key] ?? key} value={price} unit="/each" onChange={(v) => setFastener(key, v)} />
            ))}
          </Category>

          <Category title="Doors & Windows">
            {Object.entries(openings).map(([key, price]) => (
              <PriceRow key={key} label={OPENING_LABELS[key] ?? key} value={price} unit="/unit" onChange={(v) => setOpening(key, v)} />
            ))}
          </Category>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-border-subtle shrink-0 flex justify-end">
          <button
            onClick={close}
            className="px-4 py-1.5 bg-accent text-white rounded-sm hover:bg-accent-hover text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
