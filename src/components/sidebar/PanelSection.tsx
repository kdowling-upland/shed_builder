import { type ReactNode, useState } from 'react';

interface PanelSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function PanelSection({ title, children, defaultOpen = true }: PanelSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-surface-panel rounded-sm border-t border-border-subtle/40">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-amber-warm/80 hover:text-amber-warm hover:bg-white/[0.03] transition-colors"
      >
        {title}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`text-gray-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 space-y-3.5">
          {children}
        </div>
      )}
    </div>
  );
}
