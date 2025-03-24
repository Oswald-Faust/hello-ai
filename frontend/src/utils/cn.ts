import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine et fusionne les classes CSS avec tailwind-merge
 * @param inputs - Classes CSS à combiner
 * @returns Classes CSS combinées et fusionnées
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 