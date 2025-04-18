// Base interface for all items
interface Item {
  shortName: string;
  id: number | null;
  displayName: string;
  iconUrl: string;
}

export interface ExplosiveItem extends Item {
  isBaseResource?: boolean;
  craftingCost?: Record<string, number>;
  craftingIncrement?: number;
  selectable?: boolean;
}

export interface RaidableItem extends Item {
  damageValues: Record<string, number>;
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
