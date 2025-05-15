import { FormControl } from '@angular/forms';
import { AttributeOption } from '../attribute-option/attribute-option';

export interface AttributeOptionForm {
  attribute: FormControl<AttributeOption>;
  isSelected: FormControl<boolean>;
}
