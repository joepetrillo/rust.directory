import { explosiveItems } from "@/constants/typed-consts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function roundToIncrement(value: number, increment: number): number {
  return Math.ceil(value / increment) * increment;
}

export function getItemDetails(shortName: string) {
  return explosiveItems.find((i) => i.shortName === shortName);
}
