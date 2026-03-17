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
            className="px-2.5 py-1 text-[10px] bg-surface-input text-text-secondary rounded-sm hover:bg-accent-muted hover:text-accent border border-border-subtle transition-colors font-medium"
          >
            + {opt.label}
          </button>
        ))}
      </div>

      {openings.length === 0 && (
        <p className="text-[10px] text-text-muted italic mt-1">No openings added.</p>
      )}

      {openings.length > 0 && (
        <div className="-mx-4 mt-1 border-t border-border-subtle">
          {openings.map((opening) => {
            const isSelected = selectedId === opening.id;
            const wallLabel = wallOptions.find((w) => w.value === opening.wall)?.label ?? opening.wall;

            return (
              <div key={opening.id} className="border-b border-border-subtle/50">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(isSelected ? null : opening.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(isSelected ? null : opening.id); } }}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-accent-muted text-text-primary'
                      : 'text-text-secondary hover:bg-surface-elevated'
                  }`}
                >
                  <svg width="6" height="6" viewBox="0 0 6 6" className={`shrink-0 transition-transform duration-100 ${isSelected ? 'rotate-90' : ''}`}>
                    <path d="M1 0.5L5 3L1 5.5z" fill="currentColor"
                      className={isSelected ? 'text-accent' : 'text-text-muted'} />
                  </svg>
                  <span className={`text-[11px] font-semibold shrink-0 ${isSelected ? 'text-accent' : ''}`}>
                    {typeLabels[opening.type] ?? opening.type}
                  </span>
                  <span className="text-[10px] text-text-muted tabular-nums truncate">
                    {wallLabel} · {opening.width}x{opening.height}"
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOpening(opening.id);
                      if (isSelected) setSelectedId(null);
                    }}
                    className="ml-auto text-[11px] text-red-400/30 hover:text-red-400 transition-colors shrink-0 px-1"
                  >
                    x
                  </button>
                </div>

                {isSelected && (
                  <div className="px-4 pb-3 pt-1.5 space-y-1.5 bg-surface-panel border-t border-border-subtle/30">
                    <SelectInput
                      label="Wall"
                      value={opening.wall}
                      onChange={(v) => updateOpening(opening.id, { wall: v as WallId })}
                      options={wallOptions}
                    />
                    <NumberInput
                      label="Width"
                      value={opening.width}
                      onChange={(v) => updateOpening(opening.id, { width: v })}
                      min={12}
                      max={120}
                      unit="in"
                    />
                    <NumberInput
                      label="Height"
                      value={opening.height}
                      onChange={(v) => updateOpening(opening.id, { height: v })}
                      min={12}
                      max={96}
                      unit="in"
                    />
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
