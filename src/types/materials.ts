export interface MaterialItem {
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category: MaterialCategory;
}

export type MaterialCategory =
  | 'foundation'
  | 'floor'
  | 'walls'
  | 'roof'
  | 'siding'
  | 'openings'
  | 'fasteners'
  | 'trim';
