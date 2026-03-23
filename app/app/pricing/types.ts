export interface CatalogMaterial {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  color: string | null;
  unit: string;
  costPerUnit: number;
  stock: number;
}

export interface OverheadCostItem {
  id: string;
  name: string;
  amount: number;
}

export interface WorkspaceOverheadResult {
  costs: OverheadCostItem[];
  total: number;
}
