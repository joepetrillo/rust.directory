import { ExplosiveItem, RaidableItem } from "@/types/calculator";
import raidData from "./raid-data.json";

export const { explosiveItems, raidableItems } = raidData as {
  explosiveItems: ExplosiveItem[];
  raidableItems: RaidableItem[];
};
