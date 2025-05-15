export const ReactionTypeEnum = {
  Like: 0,
  Pin: 1,
} as const;
export type ReactionType =
  (typeof ReactionTypeEnum)[keyof typeof ReactionTypeEnum];
