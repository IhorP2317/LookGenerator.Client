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
  CreatedBy: 9,
  LikedBy: 10,
  PinnedBy: 11,
} as const;
export type LookFilterTypeEnum =
  (typeof LookFilterType)[keyof typeof LookFilterType];

export type LookFilterPayload = Partial<Record<LookFilterTypeEnum, any>>;
export type LookScopeFilter =
  | typeof LookFilterType.CreatedBy
  | typeof LookFilterType.LikedBy
  | typeof LookFilterType.PinnedBy;
