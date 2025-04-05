import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function roundToIncrement(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}
