import { useShedStore } from '../../store/useShedStore.ts';
import { DIMENSION_LIMITS } from '../../constants/defaults.ts';
import { PanelSection } from './PanelSection.tsx';
import { NumberInput } from './NumberInput.tsx';

export function DimensionsPanel() {
  const design = useShedStore((s) => s.design);
  const setDimension = useShedStore((s) => s.setDimension);

  return (
    <PanelSection title="Dimensions">
      <NumberInput
        label="Width"
        value={design.width}
        onChange={(v) => setDimension('width', v)}
        min={DIMENSION_LIMITS.width.min}
        max={DIMENSION_LIMITS.width.max}
        unit="ft"
      />
      <NumberInput
        label="Length"
        value={design.length}
        onChange={(v) => setDimension('length', v)}
        min={DIMENSION_LIMITS.length.min}
        max={DIMENSION_LIMITS.length.max}
        unit="ft"
      />
      <NumberInput
        label="Wall Height"
        value={design.wallHeight}
        onChange={(v) => setDimension('wallHeight', v)}
        min={DIMENSION_LIMITS.wallHeight.min}
        max={DIMENSION_LIMITS.wallHeight.max}
        unit="ft"
      />
      <div className="text-[10px] text-text-muted tabular-nums pt-1 mt-0.5 border-t border-border-subtle/50 flex items-center gap-3">
        <span className="w-[80px] shrink-0">Area</span>
        <span className="text-text-secondary">{design.width} x {design.length} = {design.width * design.length} sq ft</span>
      </div>
    </PanelSection>
  );
}
