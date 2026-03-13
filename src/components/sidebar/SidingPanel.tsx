import { useShedStore } from '../../store/useShedStore.ts';
import type { SidingMaterial } from '../../types/shed.ts';
import { PanelSection } from './PanelSection.tsx';
import { SelectInput } from './SelectInput.tsx';

const options: { value: string; label: string }[] = [
  { value: 't1-11', label: 'T1-11 Plywood' },
  { value: 'lp-smartside', label: 'LP SmartSide' },
  { value: 'vinyl', label: 'Vinyl' },
  { value: 'cedar', label: 'Cedar' },
  { value: 'board-and-batten', label: 'Board & Batten' },
];

export function SidingPanel() {
  const siding = useShedStore((s) => s.design.siding);
  const setSiding = useShedStore((s) => s.setSiding);

  return (
    <PanelSection title="Siding">
      <SelectInput
        label="Material"
        value={siding}
        onChange={(v) => setSiding(v as SidingMaterial)}
        options={options}
      />
    </PanelSection>
  );
}
