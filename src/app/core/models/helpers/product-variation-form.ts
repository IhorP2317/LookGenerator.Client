import { FormControl } from '@angular/forms';
import { ProductBodyZone } from '../product/product-body-zone';
import { Gender } from './gender';

export interface ProductVariationForm {
  id: FormControl<string>;
  name: FormControl<string>;
  price: FormControl<number>;
  size: FormControl<string | null>;
  productId: FormControl<string>;
  productItemId: FormControl<string>;
  imageUrl: FormControl<string | null>;
  bodyZone: FormControl<ProductBodyZone>;
  parentCategory: FormControl<string>;
  gender: FormControl<Gender>;
  isSelected: FormControl<boolean>;
}
