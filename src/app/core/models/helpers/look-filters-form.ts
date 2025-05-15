import { FormControl } from '@angular/forms';
import { Gender } from './gender';

export interface LookFiltersForm {
  searchTerm: FormControl<string | null>;
  gender: FormControl<Gender | null>;
}
