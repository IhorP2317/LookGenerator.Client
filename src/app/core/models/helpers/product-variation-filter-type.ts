export const ProductVariationFilterType = {
  ProductItem: 0,
} as const;
export type ProductVariationFilterTypeEnum =
  (typeof ProductVariationFilterType)[keyof typeof ProductVariationFilterType];
export type ProductVariationFilterPayload = Partial<
  Record<ProductVariationFilterTypeEnum, any>
>;
