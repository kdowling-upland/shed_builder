import { DimensionsPanel } from './DimensionsPanel.tsx';
import { RoofPanel } from './RoofPanel.tsx';
import { MaterialsPanel } from './MaterialsPanel.tsx';
import { FramingPanel } from './FramingPanel.tsx';
import { OpeningsPanel } from './OpeningsPanel.tsx';

export function Sidebar() {
  return (
    <div className="flex flex-col">
      <div className="px-3 py-1.5 bg-surface-header border-b border-border-subtle">
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Inspector</span>
      </div>
      <DimensionsPanel />
      <RoofPanel />
      <MaterialsPanel />
      <OpeningsPanel />
      <FramingPanel />
    </div>
  );
}
