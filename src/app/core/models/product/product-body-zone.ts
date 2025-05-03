export const ProductBodyZone = {
  LowerBody: 0,
  UpperBody: 1,
  HeadOrExtras: 2,
  Feet: 3,
} as const;
export type ProductBodyZone =
  (typeof ProductBodyZone)[keyof typeof ProductBodyZone];
