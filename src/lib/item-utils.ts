import raidData from "@/data/raid-data.json";
import { ExplosiveItem, RaidableItem } from "@/types/calculator";

export const { explosiveItems, raidableItems } = raidData as {
  explosiveItems: ExplosiveItem[];
  raidableItems: RaidableItem[];
};

/**
 * Get item details by short name
 */
export function getItemDetails(shortName: string) {
  return explosiveItems.find((i) => i.shortName === shortName);
}

/**
 * Get all selectable items
 */
export const selectableExplosives = explosiveItems.filter((i) => i.selectable);
