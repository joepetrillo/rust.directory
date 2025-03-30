export interface ResourceItem {
  shortName: string;
  id: number;
  displayName: string;
  iconUrl: string;
  isBaseResource: boolean;
  craftingCost?: Record<string, number>;
}

export interface BoomItem {
  shortName: string;
  id: number;
  displayName: string;
  iconUrl: string;
  craftingCost: Record<string, number>;
  isBaseResource?: boolean;
}

export interface RaidData {
  resources: ResourceItem[];
  boom: BoomItem[];
}

export type BoomQuantities = Record<string, number>;
export type ResourcesRequired = Record<string, number>;
