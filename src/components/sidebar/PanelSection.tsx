import { type ReactNode, useState } from 'react';

interface PanelSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function PanelSection({ title, children, defaultOpen = true }: PanelSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border-subtle">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 flex items-center gap-2 text-[11px] font-bold text-text-primary bg-surface-header hover:bg-surface-elevated transition-colors"
      >
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          fill="none"
          className={`text-text-secondary transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
        >
          <path d="M2 1l4 3-4 3z" fill="currentColor"/>
        </svg>
        {title}
      </button>
      {open && (
        <div className="px-4 py-3 space-y-1.5 bg-surface-panel">
          {children}
        </div>
      )}
    </div>
  );
}
