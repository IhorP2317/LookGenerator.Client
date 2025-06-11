import {
  LookFilterPayload,
  LookScopeFilter,
} from '../../../core/models/helpers/look-filter-type';
import { ReactionType } from '../../../core/models/reaction/reaction-type';

const ACTION_SCOPE = '[UserProfile]';

export class GetProfileUser {
  static readonly type = `${ACTION_SCOPE} Get User`;
  constructor(public userId: string) {}
}

export class GetUserProfileLooks {
  static readonly type = `${ACTION_SCOPE} Get Looks`;
  constructor(public filters: LookFilterPayload) {}
}
export class CreateUserProfileLookReaction {
  static readonly type = `${ACTION_SCOPE} Create Look Reaction`;

  constructor(
    public lookId: string,
    public reactionType: ReactionType,
  ) {}
}
export class DeleteUserProfileLookReaction {
  static readonly type = `${ACTION_SCOPE} Delete Look Reaction`;
  constructor(
    public lookId: string,
    public reactionType: ReactionType,
  ) {}
}
export class DeleteUserProfileLook {
  static readonly type = `${ACTION_SCOPE} Delete Look`;
  constructor(public lookId: string) {}
}
