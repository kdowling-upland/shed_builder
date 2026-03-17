import { useShedStore } from '../../store/useShedStore.ts';
import type { FoundationType, SidingMaterial } from '../../types/shed.ts';
import { PanelSection } from './PanelSection.tsx';
import { SelectInput } from './SelectInput.tsx';

const foundationOptions: { value: string; label: string }[] = [
  { value: 'skids', label: 'Timber Skids' },
  { value: 'concrete-blocks', label: 'Concrete Blocks' },
  { value: 'gravel-pad', label: 'Gravel Pad' },
  { value: 'concrete-slab', label: 'Concrete Slab' },
];

const sidingOptions: { value: string; label: string }[] = [
  { value: 't1-11', label: 'T1-11 Plywood' },
  { value: 'lp-smartside', label: 'LP SmartSide' },
  { value: 'vinyl', label: 'Vinyl' },
  { value: 'cedar', label: 'Cedar' },
  { value: 'board-and-batten', label: 'Board & Batten' },
];

export function MaterialsPanel() {
  const foundation = useShedStore((s) => s.design.foundation);
  const setFoundation = useShedStore((s) => s.setFoundation);
  const siding = useShedStore((s) => s.design.siding);
  const setSiding = useShedStore((s) => s.setSiding);

  return (
    <PanelSection title="Materials">
      <SelectInput
        label="Foundation"
        value={foundation}
        onChange={(v) => setFoundation(v as FoundationType)}
        options={foundationOptions}
      />
      <SelectInput
        label="Siding"
        value={siding}
        onChange={(v) => setSiding(v as SidingMaterial)}
        options={sidingOptions}
      />
    </PanelSection>
  );
}
