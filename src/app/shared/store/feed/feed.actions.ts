import { LookFilterPayload } from '../../../core/models/helpers/look-filter-type';
import {
  ReactionType,
  ReactionTypeEnum,
} from '../../../core/models/reaction/reaction-type';

const ACTION_SCOPE = '[Feed]';

export class GetFeedAttributeOptions {
  static readonly type = `${ACTION_SCOPE} Get Attribute Options`;
}

export class GetColours {
  static readonly type = `${ACTION_SCOPE} Get Colours`;
}

export class GetLooks {
  static readonly type = `${ACTION_SCOPE} Get Looks`;

  constructor(public filters: LookFilterPayload) {}
}

export class CreateFeedReaction {
  static readonly type = `${ACTION_SCOPE} Create Reaction`;

  constructor(
    public lookId: string,
    public reactionType: ReactionType,
  ) {}
}
export class DeleteFeedReaction {
  static readonly type = `${ACTION_SCOPE} Delete Reaction`;
  constructor(
    public lookId: string,
    public reactionType: ReactionType,
  ) {}
}
export class HideLook {
  static readonly type = `${ACTION_SCOPE} Hide Look`;
  constructor(public lookId: string) {}
}

export class DeleteFeedLook {
  static readonly type = `${ACTION_SCOPE} Delete Look`;
  constructor(public lookId: string) {}
}
export class ResetFeedState {
  static readonly type = `${ACTION_SCOPE} Reset State`;
}
