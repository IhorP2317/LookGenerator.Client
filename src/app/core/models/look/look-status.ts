export const LookStatus = {
  Draft: 0,
  Private: 1,
  Public: 2,
} as const;
export type LookStatus = (typeof LookStatus)[keyof typeof LookStatus];
export const LookStatusLabel = Object.fromEntries(
  Object.entries(LookStatus).map(([k, v]) => [v, k]),
) as Record<LookStatus, keyof typeof LookStatus>;
