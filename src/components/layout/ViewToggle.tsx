import { useUIStore, type ViewMode } from '../../store/useUIStore.ts';

const views: { mode: ViewMode; label: string; icon: string }[] = [
  { mode: '3d', label: '3D Preview', icon: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z' },
  { mode: '2d', label: '2D Editor', icon: 'M3 3h18v18H3V3z' },
];

export function ViewToggle() {
  const viewMode = useUIStore((s) => s.viewMode);
  const setViewMode = useUIStore((s) => s.setViewMode);

  return (
    <div className="flex bg-surface-input rounded-lg p-1 gap-0.5 border border-border-subtle">
      {views.map(({ mode, label, icon }) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            viewMode === mode
              ? 'bg-amber-warm/15 text-amber-warm'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={icon}/>
          </svg>
          {label}
        </button>
      ))}
    </div>
  );
}
