import { LookStatus } from '../look/look-status';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ProductVariationForm } from './product-variation-form';

export interface LookForm {
  id: FormControl<string | null>;
  name: FormControl<string>;
  description: FormControl<string | null>;
  colorPalette: FormControl<string>;
  lookStatus: FormControl<LookStatus>;
  productVariations: FormArray<FormGroup<ProductVariationForm>>;
}
