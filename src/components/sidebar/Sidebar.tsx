import { DimensionsPanel } from './DimensionsPanel.tsx';
import { RoofPanel } from './RoofPanel.tsx';
import { MaterialsPanel } from './MaterialsPanel.tsx';
import { FramingPanel } from './FramingPanel.tsx';
import { OpeningsPanel } from './OpeningsPanel.tsx';

export function Sidebar() {
  return (
    <div className="flex flex-col gap-2.5 py-2.5 px-2.5">
      <DimensionsPanel />
      <RoofPanel />
      <MaterialsPanel />
      <OpeningsPanel />
      <FramingPanel />
    </div>
  );
}
