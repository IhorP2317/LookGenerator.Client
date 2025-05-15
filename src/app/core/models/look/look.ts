import { LookStatus } from './look-status';
import { LookProduct } from '../product/look-product';
import { BaseEntity } from '../base-entity';
import { LookUser } from '../user/look-user';

export interface Look extends BaseEntity {
  name: string;
  description: string | null;
  colorPalette: string;
  lookStatus: LookStatus;
  products: LookProduct[];
  creator: LookUser | null;
  likeCount: number;
  pinCount: number;
  isLiked: boolean;
  isPinned: boolean;
  totalPrice: number;
}
