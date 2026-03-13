import { create } from 'zustand';

export type ViewMode = '2d' | '3d';

interface UIState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedOpeningId: string | null;
  setSelectedOpeningId: (id: string | null) => void;
  show3DFraming: boolean;
  toggleFraming: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  pricingModalOpen: boolean;
  setPricingModalOpen: (open: boolean) => void;
  canvasRef: HTMLCanvasElement | null;
  setCanvasRef: (canvas: HTMLCanvasElement | null) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  viewMode: '3d',
  setViewMode: (mode) => set({ viewMode: mode }),
  selectedOpeningId: null,
  setSelectedOpeningId: (id) => set({ selectedOpeningId: id }),
  show3DFraming: false,
  toggleFraming: () => set((s) => ({ show3DFraming: !s.show3DFraming })),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  pricingModalOpen: false,
  setPricingModalOpen: (open) => set({ pricingModalOpen: open }),
  canvasRef: null,
  setCanvasRef: (canvas) => set({ canvasRef: canvas }),
}));
