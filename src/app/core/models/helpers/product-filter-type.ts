export const ProductFilterType = {
  SearchTerm: 0,
  Gender: 1,
  ParentCategory: 2,
  Attributes: 3,
  Colours: 4,
  PageNumber: 5,
  PageSize: 6,
  OrderByAscending: 7,
  OrderByDescending: 8,
};
export type ProductFilterTypeEnum =
  (typeof ProductFilterType)[keyof typeof ProductFilterType];
export type ProductFilterPayload = Partial<Record<ProductFilterTypeEnum, any>>;
