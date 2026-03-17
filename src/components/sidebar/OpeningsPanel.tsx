import { useShedStore } from '../../store/useShedStore.ts';
import { useUIStore } from '../../store/useUIStore.ts';
import type { OpeningType, WallId } from '../../types/shed.ts';
import { OPENING_DEFAULTS } from '../../constants/defaults.ts';
import { PanelSection } from './PanelSection.tsx';
import { NumberInput } from './NumberInput.tsx';
import { SelectInput } from './SelectInput.tsx';

const typeOptions: { value: string; label: string }[] = [
  { value: 'single-door', label: 'Door' },
  { value: 'double-door', label: 'Double Door' },
  { value: 'window', label: 'Window' },
  { value: 'loft-door', label: 'Loft Door' },
];

const wallOptions: { value: string; label: string }[] = [
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

const typeLabels: Record<string, string> = {
  'single-door': 'Door',
  'double-door': 'Dbl Door',
  'window': 'Window',
  'loft-door': 'Loft Door',
};

export function OpeningsPanel() {
  const openings = useShedStore((s) => s.design.openings);
  const addOpening = useShedStore((s) => s.addOpening);
  const updateOpening = useShedStore((s) => s.updateOpening);
  const removeOpening = useShedStore((s) => s.removeOpening);
  const selectedId = useUIStore((s) => s.selectedOpeningId);
  const setSelectedId = useUIStore((s) => s.setSelectedOpeningId);

  const handleAdd = (type: OpeningType) => {
    const defaults = OPENING_DEFAULTS[type];
    const id = `${type}-${Date.now()}`;
    addOpening({
      id,
      type,
      width: defaults.width,
      height: defaults.height,
      wall: 'front',
      position: 24,
    });
    setSelectedId(id);
  };

  return (
    <PanelSection title="Doors & Windows">
      <div className="flex gap-1.5 flex-wrap">
        {typeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleAdd(opt.value as OpeningType)}
            className="px-2.5 py-1.5 text-xs bg-surface-elevated text-gray-300 rounded-md hover:bg-amber-warm/10 hover:text-amber-warm border border-border-subtle transition-colors font-medium"
          >
            + {opt.label}
          </button>
        ))}
      </div>

      {openings.length === 0 && (
        <p className="text-xs text-gray-600 italic">No openings added yet.</p>
      )}

      {openings.length > 0 && (
        <div className="-mx-5 border-t border-border-subtle/30">
          {openings.map((opening) => {
            const isSelected = selectedId === opening.id;
            const wallLabel = wallOptions.find((w) => w.value === opening.wall)?.label ?? opening.wall;

            return (
              <div key={opening.id} className="border-b border-border-subtle/20">
                {/* Compact summary row — always visible */}
                <button
                  onClick={() => setSelectedId(isSelected ? null : opening.id)}
                  className={`w-full flex items-center gap-2 pl-7 pr-5 py-2 text-left transition-colors ${
                    isSelected
                      ? 'bg-amber-warm/[0.06] text-gray-100'
                      : 'text-gray-400 hover:bg-white/[0.03] hover:text-gray-300'
                  }`}
                >
                  <svg width="6" height="6" viewBox="0 0 6 6" className={`shrink-0 transition-transform duration-150 ${isSelected ? 'rotate-90' : ''}`}>
                    <path d="M1.5 0.5L4.5 3L1.5 5.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"
                      className={isSelected ? 'text-amber-warm/70' : 'text-gray-600'} />
                  </svg>
                  <span className={`text-[11px] font-bold uppercase tracking-wider shrink-0 ${
                    isSelected ? 'text-amber-warm/90' : ''
                  }`}>
                    {typeLabels[opening.type] ?? opening.type}
                  </span>
                  <span className="text-[11px] text-gray-500 tabular-nums truncate">
                    {wallLabel} · {opening.width}×{opening.height}″
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOpening(opening.id);
                      if (isSelected) setSelectedId(null);
                    }}
                    className="ml-auto text-[11px] text-red-400/40 hover:text-red-400 transition-colors font-medium shrink-0"
                  >
                    ×
                  </button>
                </button>

                {/* Expanded detail panel — only for selected */}
                {isSelected && (
                  <div className="pl-10 pr-5 pb-3 pt-0.5 space-y-3 bg-white/[0.015]">
                    <SelectInput
                      label="Wall"
                      value={opening.wall}
                      onChange={(v) => updateOpening(opening.id, { wall: v as WallId })}
                      options={wallOptions}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <NumberInput
                        label="W"
                        value={opening.width}
                        onChange={(v) => updateOpening(opening.id, { width: v })}
                        min={12}
                        max={120}
                        unit="in"
                      />
                      <NumberInput
                        label="H"
                        value={opening.height}
                        onChange={(v) => updateOpening(opening.id, { height: v })}
                        min={12}
                        max={96}
                        unit="in"
                      />
                    </div>
                    <NumberInput
                      label="Position"
                      value={opening.position}
                      onChange={(v) => updateOpening(opening.id, { position: v })}
                      min={0}
                      unit="in"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PanelSection>
  );
}
