export const SizeGuideFilterType = {
  Gender: 0,
  BodyZone: 1,
} as const;

export type SizeGuideFilterTypeEnum =
  (typeof SizeGuideFilterType)[keyof typeof SizeGuideFilterType];

export type SizeGuideFilterPayload = Partial<
  Record<SizeGuideFilterTypeEnum, any>
>;
