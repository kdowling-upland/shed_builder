import { create } from 'zustand';
import { temporal } from 'zundo';
import type { ShedDesign, Opening, RoofConfig, FramingConfig, FoundationType, SidingMaterial, WallId } from '../types/shed.ts';
import { DEFAULT_SHED, DIMENSION_LIMITS } from '../constants/defaults.ts';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface ShedState {
  design: ShedDesign;
  setDimension: (key: 'width' | 'length' | 'wallHeight', value: number) => void;
  setRoof: (roof: Partial<RoofConfig>) => void;
  setFoundation: (foundation: FoundationType) => void;
  setFraming: (framing: Partial<FramingConfig>) => void;
  setSiding: (siding: SidingMaterial) => void;
  setName: (name: string) => void;
  addOpening: (opening: Opening) => void;
  updateOpening: (id: string, updates: Partial<Opening>) => void;
  removeOpening: (id: string) => void;
  moveOpening: (id: string, wall: WallId, position: number) => void;
  loadDesign: (design: ShedDesign) => void;
  resetDesign: () => void;
}

export const useShedStore = create<ShedState>()(
  temporal(
    (set) => ({
      design: DEFAULT_SHED,

      setDimension: (key, value) =>
        set((state) => {
          const limits = DIMENSION_LIMITS[key];
          return { design: { ...state.design, [key]: clamp(value, limits.min, limits.max) } };
        }),

      setRoof: (roof) =>
        set((state) => {
          const clamped = { ...roof };
          if (clamped.pitch !== undefined) clamped.pitch = clamp(clamped.pitch, DIMENSION_LIMITS.pitch.min, DIMENSION_LIMITS.pitch.max);
          if (clamped.overhang !== undefined) clamped.overhang = clamp(clamped.overhang, DIMENSION_LIMITS.overhang.min, DIMENSION_LIMITS.overhang.max);
          return { design: { ...state.design, roof: { ...state.design.roof, ...clamped } } };
        }),

      setFoundation: (foundation) =>
        set((state) => ({
          design: { ...state.design, foundation },
        })),

      setFraming: (framing) =>
        set((state) => ({
          design: { ...state.design, framing: { ...state.design.framing, ...framing } },
        })),

      setSiding: (siding) =>
        set((state) => ({
          design: { ...state.design, siding },
        })),

      setName: (name) =>
        set((state) => ({
          design: { ...state.design, name },
        })),

      addOpening: (opening) =>
        set((state) => ({
          design: { ...state.design, openings: [...state.design.openings, opening] },
        })),

      updateOpening: (id, updates) =>
        set((state) => ({
          design: {
            ...state.design,
            openings: state.design.openings.map((o) =>
              o.id === id ? { ...o, ...updates } : o
            ),
          },
        })),

      removeOpening: (id) =>
        set((state) => ({
          design: {
            ...state.design,
            openings: state.design.openings.filter((o) => o.id !== id),
          },
        })),

      moveOpening: (id, wall, position) =>
        set((state) => ({
          design: {
            ...state.design,
            openings: state.design.openings.map((o) =>
              o.id === id ? { ...o, wall, position } : o
            ),
          },
        })),

      loadDesign: (design) => set({ design }),

      resetDesign: () => set({ design: DEFAULT_SHED }),
    }),
    { limit: 50 }
  )
);
