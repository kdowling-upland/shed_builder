import { useShedStore } from '../../store/useShedStore.ts';
import { ROOF_STYLE_LABELS } from '../../constants/roofStyles.ts';
import { DIMENSION_LIMITS } from '../../constants/defaults.ts';
import type { RoofStyle } from '../../types/shed.ts';
import { PanelSection } from './PanelSection.tsx';
import { SelectInput } from './SelectInput.tsx';
import { NumberInput } from './NumberInput.tsx';

export function RoofPanel() {
  const roof = useShedStore((s) => s.design.roof);
  const setRoof = useShedStore((s) => s.setRoof);

  const roofOptions = Object.entries(ROOF_STYLE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <PanelSection title="Roof">
      <SelectInput
        label="Style"
        value={roof.style}
        onChange={(v) => setRoof({ style: v as RoofStyle })}
        options={roofOptions}
      />
      <NumberInput
        label="Pitch"
        value={roof.pitch}
        onChange={(v) => setRoof({ pitch: v })}
        min={DIMENSION_LIMITS.pitch.min}
        max={DIMENSION_LIMITS.pitch.max}
        unit="/12"
      />
      <NumberInput
        label="Overhang"
        value={roof.overhang}
        onChange={(v) => setRoof({ overhang: v })}
        min={DIMENSION_LIMITS.overhang.min}
        max={DIMENSION_LIMITS.overhang.max}
        unit="in"
      />
      <div className="text-[11px] text-gray-500 pt-1 font-medium tabular-nums">
        {roof.pitch}/12 pitch = {Math.round(Math.atan(roof.pitch / 12) * (180 / Math.PI))}°
      </div>
    </PanelSection>
  );
}
