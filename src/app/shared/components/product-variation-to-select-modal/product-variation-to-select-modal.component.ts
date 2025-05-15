import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  OnInit,
  output,
} from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { ProductSelectionForm } from '../../../core/models/helpers/product-selection-form';
import { Gender } from '../../../core/models/helpers/gender';
import { PagedList } from '../../../core/models/helpers/paged-list';
import { ProductToSelect } from '../../../core/models/product/product-to-select';
import { ProductCategory } from '../../../core/models/product-category/product-category';
import { ColorOption } from '../../../core/models/helpers/colour-option';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  startWith,
  tap,
} from 'rxjs';
import {
  ProductFilterPayload,
  ProductFilterType,
} from '../../../core/models/helpers/product-filter-type';
import { CurrencyPipe, NgClass, NgStyle } from '@angular/common';
import { ProductVariationForm } from '../../../core/models/helpers/product-variation-form';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Button } from 'primeng/button';
@UntilDestroy()
@Component({
  selector: 'app-product-variation-to-select-modal',
  imports: [
    Dialog,
    FormsModule,
    IconField,
    InputIcon,
    InputText,
    ReactiveFormsModule,
    NgClass,
    NgStyle,
    Paginator,
    CurrencyPipe,
    Button,
  ],
  templateUrl: './product-variation-to-select-modal.component.html',
  styleUrl: './product-variation-to-select-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductVariationToSelectModalComponent implements OnInit {
  form = input.required<FormGroup<ProductSelectionForm>>();
  genders = input.required<Gender[]>();
  productCategories = input.required<ProductCategory[]>();
  products = input.required<PagedList<ProductToSelect>>();
  colors = input.required<ColorOption[]>();
  genderChanged = output<Gender>();
  productFiltersChanged = output<ProductFilterPayload>();
  productSelected = output<ProductToSelect>();
  selectionConfirmed = output<ProductVariationForm[]>();
  selectedProductVariations = output<void>();
  showColors = model<boolean>(false);
  showSizes = model<boolean>(false);
  visible = model<boolean>(false);

  ngOnInit(): void {
    this.onGenderChange();
    this.onProductFilterChange();
    this.onProductChange();
  }
  onGenderChange() {
    const form = this.form();
    form.controls.gender.valueChanges
      .pipe(
        tap((gender) => {
          this.genderChanged.emit(gender);
          form.controls.category.setValue(null);
          form.controls.product.setValue(null);
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  onProductFilterChange() {
    const form = this.form();

    combineLatest([
      form.controls.searchTerm.valueChanges.pipe(
        startWith(form.controls.searchTerm.value),
        debounceTime(300),
        distinctUntilChanged(),
      ),
      form.controls.category.valueChanges.pipe(
        startWith(form.controls.category.value),
        distinctUntilChanged(),
      ),
      form.controls.attributes.valueChanges.pipe(
        startWith(form.controls.attributes.value),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
        ),
      ),
      form.controls.color.valueChanges.pipe(
        startWith(form.controls.color.value),
        distinctUntilChanged(),
      ),
      form.controls.productPageNumber.valueChanges.pipe(
        startWith(form.controls.productPageNumber.value),
        distinctUntilChanged(),
      ),
      form.controls.productPageSize.valueChanges.pipe(
        startWith(form.controls.productPageSize.value),
        distinctUntilChanged(),
      ),
    ])
      .pipe(
        debounceTime(50), // small debounce to group rapid sequential form control changes
        tap(([searchingTerm, categoryId]) => {
          if (!categoryId) return;

          const color = form.controls.color.value;
          const pageNumber = form.controls.productPageNumber.value;
          const pageSize = form.controls.productPageSize.value;

          const selectedAttributes = form.controls.attributes.controls
            .filter((attrForm) => attrForm.controls.isSelected.value)
            .map((attrForm) => attrForm.controls.attribute.value.id);

          const filters: ProductFilterPayload = {
            [ProductFilterType.ParentCategory]: categoryId,
            [ProductFilterType.Attributes]: selectedAttributes,
            [ProductFilterType.Colours]: color ? [color.name] : [],
            [ProductFilterType.PageNumber]: pageNumber,
            [ProductFilterType.PageSize]: pageSize,
          };

          if (searchingTerm?.trim()) {
            filters[ProductFilterType.SearchTerm] = searchingTerm.trim();
          }

          this.productFiltersChanged.emit(filters);
          form.controls.product.setValue(null, { emitEvent: false });
          form.controls.sizes.clear({ emitEvent: false });
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  onProductChange() {
    const form = this.form();
    form.controls.product.valueChanges
      .pipe(
        tap((product) => {
          if (!product) return;
          this.productSelected.emit(product);
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }
  toggleColor(ColorOption: ColorOption) {
    const currentColor = this.form().value.color;
    if (currentColor?.name === ColorOption.name) {
      this.form().controls.color.setValue(null);
    } else {
      this.form().controls.color.setValue(ColorOption);
    }
  }
  toggleGender(gender: Gender) {
    const currentGender = this.form().value.gender;
    if (currentGender !== gender) {
      this.form().controls.gender.setValue(gender);
    }
  }
  onPageChange(event: PaginatorState): void {
    const form = this.form();
    const currentSize = form.controls.productPageSize.value;
    const newSize = event.rows ?? 20;

    form.patchValue({
      productPageNumber: currentSize !== newSize ? 1 : (event.page ?? 0) + 1,
      productPageSize: newSize,
    });
  }

  onOpen() {
    this.visible.set(true);
  }
  onProductSelect(product: ProductToSelect) {
    const productForm = this.form().controls.product;
    productForm.setValue(product);
  }
  onProductVariationsPlace() {
    this.selectedProductVariations.emit();
    this.showSizes.set(false);
  }
}
