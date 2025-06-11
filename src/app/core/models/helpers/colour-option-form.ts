import { ColorOption } from './colour-option';
import { FormControl } from '@angular/forms';

export interface ColourOptionForm {
  option: FormControl<ColorOption>;
  isSelected: FormControl<boolean>;
}
