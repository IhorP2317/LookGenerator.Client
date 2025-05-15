import { ReactionType } from '../../../core/models/reaction/reaction-type';

const ACTION_SCOPE = '[Look]';

export class GetLook {
  static readonly type = `${ACTION_SCOPE} Get Look`;
  constructor(public lookId: string) {}
}
export class CreateLookReaction {
  static readonly type = `${ACTION_SCOPE} Create Reaction`;

  constructor(public reactionType: ReactionType) {}
}
export class DeleteLookReaction {
  static readonly type = `${ACTION_SCOPE} Delete Reaction`;
  constructor(public reactionType: ReactionType) {}
}
