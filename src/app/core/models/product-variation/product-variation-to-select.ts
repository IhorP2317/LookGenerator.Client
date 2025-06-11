import { FormControl } from '@angular/forms';
import { ProductBodyZone } from '../product/product-body-zone';
import { Gender } from '../helpers/gender';

export interface ProductVariationToSelect {
  id: string;
  name: string;
  price: number;
  size: string | null;
  productId: string;
  productItemId: string;
  imageUrl: string | null;
  bodyZone: ProductBodyZone;
  parentCategory: string;
  gender: Gender;
}
