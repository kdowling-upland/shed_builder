// Lumber prices per linear foot (approximate 2024 US averages)
export const LUMBER_PRICES: Record<string, number> = {
  '2x4x8': 4.50,
  '2x4x10': 5.75,
  '2x4x12': 7.00,
  '2x4x16': 9.50,
  '2x6x8': 7.00,
  '2x6x10': 8.75,
  '2x6x12': 10.50,
  '2x6x16': 14.00,
  '2x8x8': 9.00,
  '2x8x10': 11.25,
  '2x8x12': 13.50,
  '2x8x16': 18.00,
  '2x10x8': 12.00,
  '2x10x10': 15.00,
  '2x10x12': 18.00,
  '2x10x16': 24.00,
  '2x12x8': 15.00,
  '2x12x12': 22.50,
  '2x12x16': 30.00,
};

// Sheathing / panel prices per sheet (4x8)
export const SHEATHING_PRICES: Record<string, number> = {
  'osb-7/16': 14.00,
  'osb-23/32': 24.00,
  'plywood-1/2': 32.00,
  'plywood-3/4': 42.00,
};

// Siding prices per sheet or per square foot
export const SIDING_PRICES: Record<string, { price: number; unit: string; coverage: number }> = {
  't1-11': { price: 36.00, unit: 'sheet (4x8)', coverage: 32 },
  'lp-smartside': { price: 42.00, unit: 'sheet (4x8)', coverage: 32 },
  'vinyl': { price: 1.75, unit: 'sq ft', coverage: 1 },
  'cedar': { price: 4.50, unit: 'sq ft', coverage: 1 },
  'board-and-batten': { price: 3.50, unit: 'sq ft', coverage: 1 },
};

// Roofing
export const ROOFING_PRICES = {
  shingles: 32.00,         // per bundle (3 bundles = 1 square = 100 sq ft)
  underlayment: 25.00,     // per roll (covers ~400 sq ft)
  dripEdge: 8.00,          // per 10ft piece
};

// Foundation
export const FOUNDATION_PRICES = {
  concreteBlock: 2.50,     // per block (8x8x16)
  skid4x4x8: 12.00,       // per 4x4x8 treated timber
  gravelPerCubicYard: 35.00,
  concretePerCubicYard: 150.00,
};

// Fasteners & hardware
export const FASTENER_PRICES = {
  nails16d: 0.08,          // per nail
  nails8d: 0.05,
  screws3inch: 0.12,
  joistHanger: 1.50,
  hurricaneTie: 1.25,
  ridgeConnector: 3.50,
  anchorBolt: 2.00,
};

// Opening prices (pre-hung doors, windows)
export const OPENING_PRICES: Record<string, number> = {
  'single-door': 180.00,
  'double-door': 350.00,
  'window': 120.00,
  'loft-door': 95.00,
};
