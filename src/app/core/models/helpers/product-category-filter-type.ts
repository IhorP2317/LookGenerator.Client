export const ProductCategoryFilterType = {
  Gender: 0,
  HasProducts: 1,
};
export type ProductCategoryFilterTypeEnum =
  (typeof ProductCategoryFilterType)[keyof typeof ProductCategoryFilterType];

export type ProductCategoryFilterPayload = Partial<
  Record<ProductCategoryFilterTypeEnum, any>
>;
