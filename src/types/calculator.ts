// Base interface for all items
export interface BaseItem {
  shortName: string;
  id: number;
  displayName: string;
  iconUrl: string;
  isBaseResource: boolean;
  craftingIncrement?: number;
}

export interface ResourceItem extends BaseItem {
  craftingCost?: Record<string, number>;
}

export interface BoomItem extends BaseItem {
  craftingCost: Record<string, number>;
}

export interface RaidData {
  resources: ResourceItem[];
  boom: BoomItem[];
}

export type BoomQuantities = Record<string, number>;
export type ResourcesRequired = Record<string, number>;

export interface ItemBreakdown {
  totalBaseCosts: ResourcesRequired;
  craftingTree: CraftingNode[];
}

export interface CraftingNode {
  resourceName: string;
  amount: number;
  children: CraftingNode[];
}

export type BreakdownMap = Record<string, ItemBreakdown>;
