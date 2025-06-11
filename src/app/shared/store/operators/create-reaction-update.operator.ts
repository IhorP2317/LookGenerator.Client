import { FeedLook } from '../../../core/models/look/feed-look';
import {
  ReactionType,
  ReactionTypeEnum,
} from '../../../core/models/reaction/reaction-type';
import { StateOperator } from '@ngxs/store';
import { patch, updateItem } from '@ngxs/store/operators';

export function createReactionUpdateOperator(
  lookId: string,
  reactionType: ReactionType,
  isIncrement: boolean,
): StateOperator<FeedLook[]> {
  return updateItem<FeedLook>(
    (look) => look.id === lookId,
    (look) => ({
      ...look,
      likeCount:
        reactionType === ReactionTypeEnum.Like
          ? look.likeCount + (isIncrement ? 1 : -1)
          : look.likeCount,
      pinCount:
        reactionType === ReactionTypeEnum.Pin
          ? look.pinCount + (isIncrement ? 1 : -1)
          : look.pinCount,
      isLiked:
        reactionType === ReactionTypeEnum.Like ? isIncrement : look.isLiked,
      isPinned:
        reactionType === ReactionTypeEnum.Pin ? isIncrement : look.isPinned,
    }),
  );
}
