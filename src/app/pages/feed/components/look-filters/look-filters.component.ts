import {
  Component,
  computed,
  inject,
  input,
  model,
  OnInit,
  output,
} from '@angular/core';
import {
  LookFilterPayload,
  LookFilterType,
} from '../../../../core/models/helpers/look-filter-type';
import { AttributeOption } from '../../../../core/models/attribute-option/attribute-option';
import { Gender } from '../../../../core/models/helpers/gender';
import { LookFiltersForm } from '../../../../core/models/helpers/look-filters-form';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { Select } from 'primeng/select';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NgClass, NgStyle } from '@angular/common';
import { ColorOption } from '../../../../core/models/helpers/colour-option';
import { Dialog } from 'primeng/dialog';

@UntilDestroy()
@Component({
  selector: 'app-look-filters',
  imports: [
    ReactiveFormsModule,
    IconField,
    InputIcon,
    InputText,
    DropdownModule,
    Select,
    NgClass,
    Dialog,
    NgStyle,
  ],
  templateUrl: './look-filters.component.html',
  styleUrl: './look-filters.component.css',
})
export class LookFiltersComponent implements OnInit {
  private formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  lookFilters = input<LookFilterPayload>({});
  attributeOptions = input<AttributeOption[]>([]);
  colours = input<ColorOption[]>([]);
  genders = input<Gender[]>([]);
  selectedAttributeIds = computed(
    () => (this.lookFilters()[LookFilterType.Attributes] ?? []) as string[],
  );

  selectedColors = computed(
    () => (this.lookFilters()[LookFilterType.Colours] ?? []) as string[],
  );

  showColors = model<boolean>(false);

  filtersChanged = output<LookFilterPayload>();
  filtersForm = this.formBuilder.group<LookFiltersForm>({
    searchTerm: this.formBuilder.control<string | null>(null),
    gender: this.formBuilder.control<Gender | null>(null),
  });
  preparedGenders = computed(() => [
    { label: 'All Genders', value: null },
    ...this.genders().map((g) => ({
      label: g,
      value: g,
    })),
  ]);

  ngOnInit(): void {
    this.fillForm();
    this.onFormChanged();
  }

  private fillForm() {
    this.filtersForm.controls.searchTerm.patchValue(
      this.lookFilters()[LookFilterType.SearchTerm],
    );
    this.filtersForm.controls.gender.patchValue(
      this.lookFilters()[LookFilterType.Gender],
    );
  }

  private onFormChanged() {
    this.filtersForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        tap((formValue) => {
          const filters: LookFilterPayload = {};
          const selectedAttributeIds = this.selectedAttributeIds();
          const selectedColors = this.selectedColors();

          if (formValue.gender) {
            filters[LookFilterType.Gender] = formValue.gender;
          }

          const trimmed = formValue.searchTerm?.trim();
          if (trimmed) {
            filters[LookFilterType.SearchTerm] = trimmed;
          }
          if (selectedAttributeIds.length) {
            filters[LookFilterType.Attributes] = selectedAttributeIds;
          }
          if (selectedColors.length) {
            filters[LookFilterType.Colours] = selectedColors;
          }
          this.filtersChanged.emit(filters);
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }
  toggleAttribute(attributeId: string) {
    const current = this.selectedAttributeIds();
    const updated = current.includes(attributeId)
      ? current.filter((id) => id !== attributeId)
      : [...current, attributeId];
    this.filtersChanged.emit({
      ...this.lookFilters(),
      [LookFilterType.Attributes]: updated,
    });
  }

  toggleColor(colorName: string) {
    const current = this.selectedColors();
    const updated = current.includes(colorName)
      ? current.filter((name) => name !== colorName)
      : [...current, colorName];
    this.filtersChanged.emit({
      ...this.lookFilters(),
      [LookFilterType.Colours]: updated,
    });
  }
}
