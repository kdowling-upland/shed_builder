import { AppShell } from './components/layout/AppShell.tsx';
import { Sidebar } from './components/sidebar/Sidebar.tsx';
import { PricingModal } from './components/sidebar/PricingModal.tsx';
import { SceneContainer } from './components/preview3d/SceneContainer.tsx';
import { EditorCanvas } from './components/editor2d/EditorCanvas.tsx';
import { useUIStore } from './store/useUIStore.ts';

function MainView() {
  const viewMode = useUIStore((s) => s.viewMode);

  return (
    <>
      {/* Keep the 3D canvas always mounted (hidden) so we can capture it for PDF export */}
      <div className="w-full h-full" style={{ display: viewMode === '3d' ? 'block' : 'none' }}>
        <SceneContainer />
      </div>
      {viewMode === '2d' && <EditorCanvas />}
    </>
  );
}

export default function App() {
  return (
    <>
      <AppShell
        sidebar={<Sidebar />}
        main={<MainView />}
      />
      <PricingModal />
    </>
  );
}
