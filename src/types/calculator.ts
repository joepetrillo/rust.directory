// Base interface for all items
export interface Item {
  shortName: string;
  id: number;
  displayName: string;
  iconUrl: string;
  isBaseResource?: boolean;
  craftingCost?: Record<string, number>;
  craftingIncrement?: number;
  selectable?: boolean;
}

export interface ItemBreakdown {
  totalBaseCosts: ResourcesRequired;
  craftingTree: CraftingNode[];
}

export interface CraftingNode {
  resourceName: string;
  amount: number;
  children: CraftingNode[];
}

export type Quantities = Record<string, number>;
export type ResourcesRequired = Record<string, number>;
export type BreakdownMap = Record<string, ItemBreakdown>;
