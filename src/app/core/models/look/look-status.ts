export const LookStatus = {
  Draft: 0,
  Private: 1,
  Public: 2,
} as const;
export type LookStatus = (typeof LookStatus)[keyof typeof LookStatus];
