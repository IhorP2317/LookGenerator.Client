import { User } from '../../../core/models/user/user';
import { PagedList } from '../../../core/models/helpers/paged-list';
import { FeedLook } from '../../../core/models/look/feed-look';

export interface UserProfileStateModel {
  user: User | null;
  looks: PagedList<FeedLook>;
}
