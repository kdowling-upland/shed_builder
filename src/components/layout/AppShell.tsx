import type { ReactNode } from 'react';
import { Toolbar } from './Toolbar.tsx';

interface AppShellProps {
  sidebar: ReactNode;
  main: ReactNode;
}

export function AppShell({ sidebar, main }: AppShellProps) {
  return (
    <div className="h-screen flex flex-col bg-surface-dark text-gray-100 font-body">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-88 bg-surface-dark border-r border-border-subtle overflow-y-auto flex-shrink-0">
          {sidebar}
        </aside>
        <main className="flex-1 overflow-hidden">
          {main}
        </main>
      </div>
    </div>
  );
}
