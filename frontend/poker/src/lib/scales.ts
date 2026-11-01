import type { EstimationScale } from "../types";

export const SCALE_CARDS: Record<EstimationScale, string[]> = {
  fibonacci: ["0", "1", "2", "3", "5", "8", "13", "21", "34", "?"],
  modifiedFibonacci: ["0", "0.5", "1", "2", "3", "5", "8", "13", "20", "40", "100", "?"],
  tshirt: ["XS", "S", "M", "L", "XL", "XXL", "?"],
  powersOf2: ["1", "2", "4", "8", "16", "32", "64", "?"],
};

export const SCALE_LABELS: Record<EstimationScale, string> = {
  fibonacci: "Fibonacci",
  modifiedFibonacci: "Modified Fibonacci",
  tshirt: "T-Shirt Sizes",
  powersOf2: "Powers of 2",
};

export function cardsFor(scale?: string): string[] {
  return SCALE_CARDS[scale as EstimationScale] ?? [];
}

export function labelFor(scale?: string): string {
  return SCALE_LABELS[scale as EstimationScale] ?? "";
}
