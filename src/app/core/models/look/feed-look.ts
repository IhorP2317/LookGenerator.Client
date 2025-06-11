import { LookStatus } from './look-status';
import { LookUser } from '../user/look-user';

export interface FeedLook {
  id: string;
  name: string;
  description: string | null;
  colorPalette: string;
  lookStatus: LookStatus;
  productImageUrls: string[];
  likeCount: number;
  pinCount: number;
  isLiked: boolean;
  isPinned: boolean;
  creator: LookUser | null;
  isNew: boolean;
}
