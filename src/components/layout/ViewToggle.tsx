import { useUIStore, type ViewMode } from '../../store/useUIStore.ts';

const views: { mode: ViewMode; title: string }[] = [
  { mode: '3d', title: '3D Preview' },
  { mode: '2d', title: '2D Editor' },
];

function CubeIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-colors ${active ? 'stroke-white' : 'stroke-current'}`}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function SquareIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-colors ${active ? 'stroke-white' : 'stroke-current'}`}
    >
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  );
}

export function ViewToggle() {
  const viewMode = useUIStore((s) => s.viewMode);
  const setViewMode = useUIStore((s) => s.setViewMode);

  const activeIndex = views.findIndex((v) => v.mode === viewMode);

  return (
    <div className="relative flex items-center bg-surface-input rounded-sm border border-border-subtle p-0.5">
      {/* Sliding highlight */}
      <div
        className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-accent rounded-sm shadow-sm transition-all duration-200 ease-out"
        style={{ left: `calc(${activeIndex * 50}% + 2px)` }}
      />

      {views.map(({ mode, title }) => {
        const active = viewMode === mode;
        return (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`relative z-10 w-9 h-7 flex items-center justify-center rounded-sm transition-colors duration-200 ${
              active
                ? 'text-white'
                : 'text-text-muted hover:text-text-primary'
            }`}
            title={title}
          >
            {mode === '3d' ? <CubeIcon active={active} /> : <SquareIcon active={active} />}
          </button>
        );
      })}
    </div>
  );
}
