export const LookFilterType = {
  SearchTerm: 0,
  Gender: 1,
  Attributes: 2,
  Colours: 3,
  Status: 4,
  PageNumber: 5,
  PageSize: 6,
  OrderByAscending: 7,
  OrderByDescending: 8,
} as const;
export type LookFilterTypeEnum =
  (typeof LookFilterType)[keyof typeof LookFilterType];

export type LookFilterPayload = Partial<Record<LookFilterTypeEnum, any>>;
