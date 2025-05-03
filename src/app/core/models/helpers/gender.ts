export const Gender = {
  Man: 'MEN',
  Woman: 'WOMEN',
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];
