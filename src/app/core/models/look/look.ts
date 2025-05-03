import { LookStatus } from './look-status';
import { LookProduct } from '../product/look-product';
import { BaseEntity } from '../base-entity';

export interface Look extends BaseEntity {
  name: string;
  description: string | null;
  colorPalette: string;
  lookStatus: LookStatus;
  products: LookProduct[];
}
