import { useShedStore } from '../../store/useShedStore.ts';
import type { FoundationType } from '../../types/shed.ts';
import { PanelSection } from './PanelSection.tsx';
import { SelectInput } from './SelectInput.tsx';

const options: { value: string; label: string }[] = [
  { value: 'skids', label: 'Timber Skids' },
  { value: 'concrete-blocks', label: 'Concrete Blocks' },
  { value: 'gravel-pad', label: 'Gravel Pad' },
  { value: 'concrete-slab', label: 'Concrete Slab' },
];

export function FoundationPanel() {
  const foundation = useShedStore((s) => s.design.foundation);
  const setFoundation = useShedStore((s) => s.setFoundation);

  return (
    <PanelSection title="Foundation">
      <SelectInput
        label="Type"
        value={foundation}
        onChange={(v) => setFoundation(v as FoundationType)}
        options={options}
      />
    </PanelSection>
  );
}
