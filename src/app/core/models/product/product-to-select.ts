import { ProductBodyZone } from './product-body-zone';
import { Gender } from '../helpers/gender';

export interface ProductToSelect {
  id: string;
  name: string;
  description: string | null;
  productItemId: string;
  color: string;
  productImage: string | null;
  bodyZone: ProductBodyZone;
  parentCategory: string;
  gender: Gender;
}
