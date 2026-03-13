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
        <p className="text-xs text-gray-600">No openings added yet.</p>
      )}

      <div className="space-y-3">
        {openings.map((opening) => (
          <div
            key={opening.id}
            className={`p-3 rounded-lg border transition-colors cursor-pointer ${
              selectedId === opening.id
                ? 'border-amber-warm/30 bg-amber-warm/[0.04]'
                : 'border-border-subtle bg-surface-input/50 hover:border-border-medium'
            }`}
            onClick={() => setSelectedId(opening.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-gray-200 uppercase tracking-wider">
                {opening.type.replace(/-/g, ' ')}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeOpening(opening.id);
                  if (selectedId === opening.id) setSelectedId(null);
                }}
                className="text-[11px] text-red-400/50 hover:text-red-400 transition-colors font-medium"
              >
                Remove
              </button>
            </div>
            <div className="space-y-3">
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
          </div>
        ))}
      </div>
    </PanelSection>
  );
}
