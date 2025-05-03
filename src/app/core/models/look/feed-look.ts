import { LookStatus } from './look-status';
import { LookUser } from '../user/look-user';

export interface FeedLook {
  id: string;
  name: string;
  description: string | null;
  colorPalette: string;
  lookStatus: LookStatus;
  productImageUrls: string[];
  creator: LookUser | null;
}
