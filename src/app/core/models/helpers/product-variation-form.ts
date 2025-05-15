import { FormControl } from '@angular/forms';

export interface ProductVariationForm {
  id: FormControl<string>;
  name: FormControl<string>;
  price: FormControl<number>;
  size: FormControl<string | null>;
  productId: FormControl<string>;
  productItemId: FormControl<string>;
  imageUrl: FormControl<string | null>;
  isSelected: FormControl<boolean>;
}
