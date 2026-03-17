import { useShedStore } from '../../store/useShedStore.ts';
import type { FramingConfig } from '../../types/shed.ts';
import { PanelSection } from './PanelSection.tsx';

const spacingOptions = [
  { value: '16', label: '16"' },
  { value: '24', label: '24"' },
];

interface FramingRowProps {
  label: string;
  size: string;
  onSizeChange: (v: string) => void;
  sizeOptions: { value: string; label: string }[];
  spacing: number;
  onSpacingChange: (v: number) => void;
}

function FramingRow({ label, size, onSizeChange, sizeOptions, spacing, onSpacingChange }: FramingRowProps) {
  return (
    <div className="property-row">
      <span className="text-[11px] text-text-secondary font-medium">{label}</span>
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <select
          value={size}
          onChange={(e) => onSizeChange(e.target.value)}
          className="flex-1 bg-surface-input text-text-primary px-2 py-1 rounded-sm border border-border-subtle text-[11px] font-body focus:border-accent focus:outline-none transition-colors"
        >
          {sizeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="text-[10px] text-text-muted">@</span>
        <select
          value={String(spacing)}
          onChange={(e) => onSpacingChange(Number(e.target.value))}
          className="bg-surface-input text-text-primary px-2 py-1 rounded-sm border border-border-subtle text-[11px] font-body focus:border-accent focus:outline-none transition-colors"
        >
          {spacingOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label} O.C.</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function FramingPanel() {
  const framing = useShedStore((s) => s.design.framing);
  const setFraming = useShedStore((s) => s.setFraming);

  return (
    <PanelSection title="Framing" defaultOpen={false}>
      <FramingRow
        label="Studs"
        size={framing.studSize}
        onSizeChange={(v) => setFraming({ studSize: v as FramingConfig['studSize'] })}
        sizeOptions={[
          { value: '2x4', label: '2x4' },
          { value: '2x6', label: '2x6' },
        ]}
        spacing={framing.studSpacing}
        onSpacingChange={(v) => setFraming({ studSpacing: v as 16 | 24 })}
      />
      <FramingRow
        label="Joists"
        size={framing.joistSize}
        onSizeChange={(v) => setFraming({ joistSize: v as FramingConfig['joistSize'] })}
        sizeOptions={[
          { value: '2x6', label: '2x6' },
          { value: '2x8', label: '2x8' },
          { value: '2x10', label: '2x10' },
        ]}
        spacing={framing.joistSpacing}
        onSpacingChange={(v) => setFraming({ joistSpacing: v as 16 | 24 })}
      />
      <FramingRow
        label="Rafters"
        size={framing.rafterSize}
        onSizeChange={(v) => setFraming({ rafterSize: v as FramingConfig['rafterSize'] })}
        sizeOptions={[
          { value: '2x4', label: '2x4' },
          { value: '2x6', label: '2x6' },
          { value: '2x8', label: '2x8' },
        ]}
        spacing={framing.rafterSpacing}
        onSpacingChange={(v) => setFraming({ rafterSpacing: v as 16 | 24 })}
      />
    </PanelSection>
  );
}
