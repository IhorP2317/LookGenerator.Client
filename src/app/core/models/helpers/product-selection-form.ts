import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Gender } from './gender';
import { ProductToSelect } from '../product/product-to-select';
import { ProductVariationForm } from './product-variation-form';
import { AttributeOptionForm } from './attribute-option-form';
import { ColorOption } from './colour-option';

export interface ProductSelectionForm {
  searchTerm: FormControl<string | null>;
  attributes: FormArray<FormGroup<AttributeOptionForm>>;
  gender: FormControl<Gender>;
  category: FormControl<string | null>;
  product: FormControl<ProductToSelect | null>;
  color: FormControl<ColorOption | null>;
  sizes: FormArray<FormGroup<ProductVariationForm>>;
  productPageSize: FormControl<number>;
  productPageNumber: FormControl<number>;
}
