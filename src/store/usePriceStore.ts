import { create } from 'zustand';
import {
  LUMBER_PRICES as DEFAULT_LUMBER,
  SHEATHING_PRICES as DEFAULT_SHEATHING,
  SIDING_PRICES as DEFAULT_SIDING,
  ROOFING_PRICES as DEFAULT_ROOFING,
  FOUNDATION_PRICES as DEFAULT_FOUNDATION,
  FASTENER_PRICES as DEFAULT_FASTENER,
  OPENING_PRICES as DEFAULT_OPENING,
} from '../constants/materials.ts';

interface PriceState {
  lumber: Record<string, number>;
  sheathing: Record<string, number>;
  siding: Record<string, { price: number; unit: string; coverage: number }>;
  roofing: typeof DEFAULT_ROOFING;
  foundation: typeof DEFAULT_FOUNDATION;
  fasteners: typeof DEFAULT_FASTENER;
  openings: Record<string, number>;

  setLumberPrice: (key: string, price: number) => void;
  setSheathingPrice: (key: string, price: number) => void;
  setSidingPrice: (key: string, price: number) => void;
  setRoofingPrice: (key: string, price: number) => void;
  setFoundationPrice: (key: string, price: number) => void;
  setFastenerPrice: (key: string, price: number) => void;
  setOpeningPrice: (key: string, price: number) => void;
  resetAllPrices: () => void;
}

const initialState = () => ({
  lumber: { ...DEFAULT_LUMBER },
  sheathing: { ...DEFAULT_SHEATHING },
  siding: Object.fromEntries(
    Object.entries(DEFAULT_SIDING).map(([k, v]) => [k, { ...v }])
  ) as typeof DEFAULT_SIDING,
  roofing: { ...DEFAULT_ROOFING },
  foundation: { ...DEFAULT_FOUNDATION },
  fasteners: { ...DEFAULT_FASTENER },
  openings: { ...DEFAULT_OPENING },
});

export const usePriceStore = create<PriceState>()((set) => ({
  ...initialState(),

  setLumberPrice: (key, price) =>
    set((s) => ({ lumber: { ...s.lumber, [key]: price } })),

  setSheathingPrice: (key, price) =>
    set((s) => ({ sheathing: { ...s.sheathing, [key]: price } })),

  setSidingPrice: (key, price) =>
    set((s) => ({
      siding: {
        ...s.siding,
        [key]: { ...s.siding[key], price },
      },
    })),

  setRoofingPrice: (key, price) =>
    set((s) => ({ roofing: { ...s.roofing, [key]: price } })),

  setFoundationPrice: (key, price) =>
    set((s) => ({ foundation: { ...s.foundation, [key]: price } })),

  setFastenerPrice: (key, price) =>
    set((s) => ({ fasteners: { ...s.fasteners, [key]: price } })),

  setOpeningPrice: (key, price) =>
    set((s) => ({ openings: { ...s.openings, [key]: price } })),

  resetAllPrices: () => set(initialState()),
}));
