import { Component, inject, model, OnInit, ViewChild } from '@angular/core';
import { ProductVariationToSelectModalComponent } from '../../shared/components/product-variation-to-select-modal/product-variation-to-select-modal.component';
import { Store } from '@ngxs/store';
import {
  FormArray,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { AuthState } from '../../shared/store/auth/auth.state';
import { LookGenerationState } from '../../shared/store/look-generation/look-generation.state';
import { ProductSelectionForm } from '../../core/models/helpers/product-selection-form';
import { AttributeOptionForm } from '../../core/models/helpers/attribute-option-form';
import { Gender } from '../../core/models/helpers/gender';
import { ProductToSelect } from '../../core/models/product/product-to-select';
import { ColorOption } from '../../core/models/helpers/colour-option';
import { ProductVariationForm } from '../../core/models/helpers/product-variation-form';
import { ColourOptionForm } from '../../core/models/helpers/colour-option-form';
import {
  combineLatest,
  filter,
  finalize,
  map,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { ProductVariation } from '../../core/models/product-variation/product-variation';
import { AsyncPipe, CurrencyPipe, NgClass, NgStyle } from '@angular/common';
import { ProductFilterPayload } from '../../core/models/helpers/product-filter-type';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  DeleteGeneratedLook,
  GenerateLooks,
  GenerateLooksByItem,
  GetGeneratedLooks,
  GetLookGenerationProductCategories,
  GetLookGenerationProductsToSelect,
  GetLookGenerationProductVariations,
  LikeGeneratedLook,
} from '../../shared/store/look-generation/look-generation.actions';
import { AttributeOption } from '../../core/models/attribute-option/attribute-option';
import { FloatingToolbarComponent } from '../../shared/components/floating-toolbar/floating-toolbar.component';
import { ProductVariationToSelect } from '../../core/models/product-variation/product-variation-to-select';
import { ProductBodyZone } from '../../core/models/product/product-body-zone';
import { Dialog } from 'primeng/dialog';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { getRequiredMeasures } from '../../core/helpers/utils/get-required-measurements.util';
import {
  ALL_MEASURES,
  BodyZoneToMeasureType,
} from '../../core/constants/constants';
import { DraftLookFeedComponent } from './components/draft-look-feed/draft-look-feed.component';
import { LookFilterType } from '../../core/models/helpers/look-filter-type';
import { catchErrorWithNotification } from '../../core/helpers/utils/catch-error-with-notification.util';
import { LoadingService } from '../../shared/services/loading.service';
import { MeasureKey } from '../../core/models/helpers/measure-key';
@UntilDestroy()
@Component({
  selector: 'app-look-generation',
  imports: [
    ProductVariationToSelectModalComponent,
    AsyncPipe,
    FloatingToolbarComponent,
    ReactiveFormsModule,
    NgClass,
    Dialog,
    NgStyle,
    Card,
    Button,
    CurrencyPipe,
    DraftLookFeedComponent,
    PrimeTemplate,
  ],
  templateUrl: './look-generation.component.html',
  styleUrl: './look-generation.component.css',
})
export class LookGenerationComponent implements OnInit {
  @ViewChild(ProductVariationToSelectModalComponent)
  modalComponent!: ProductVariationToSelectModalComponent;
  private store: Store = inject(Store);
  private loadingService: LoadingService = inject(LoadingService);
  private formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private messageService: MessageService = inject(MessageService);
  lookIdToDelete: string | null = null;
  isLoading = inject(LoadingService).isLoading;
  currentUser = this.store.selectSignal(AuthState.getCurrentUser);
  genders = this.store.selectSignal(LookGenerationState.getGenders);
  productCategories$ = this.store.select(LookGenerationState.getCategories);
  products = this.store.selectSignal(LookGenerationState.getProducts);
  colors = this.store.selectSignal(LookGenerationState.getColours);
  generatedLooks = this.store.selectSignal(
    LookGenerationState.getGeneratedLooks,
  );
  isDialogVisible = model<boolean>(false);
  attributes$ = this.store.select(LookGenerationState.getAttributeOptions);
  productVariations$ = this.store.select(
    LookGenerationState.getProductVariations,
  );
  attributesForm = this.formBuilder.group({
    gender: this.formBuilder.control<Gender>(Gender.Man),
    attributes: this.formBuilder.array<FormGroup<AttributeOptionForm>>([]),
    colors: this.formBuilder.array<FormGroup<ColourOptionForm>>([]),
  });
  measuresForm = this.formBuilder.group({
    chestContour: this.formBuilder.control<number>(0.1, [Validators.min(0.1)]),
    hipContour: this.formBuilder.control<number>(0.1, [Validators.min(0.1)]),
    waistContour: this.formBuilder.control<number>(0.1, [Validators.min(0.1)]),
    footMeasure: this.formBuilder.control<number>(0.1, [Validators.min(0.1)]),
  });
  itemForm = this.formBuilder.group({
    selectedVariation:
      this.formBuilder.control<ProductVariationToSelect | null>(null),
  });

  selectProductForm = this.formBuilder.group<ProductSelectionForm>({
    searchTerm: this.formBuilder.control<string | null>(null as string | null),
    attributes: this.formBuilder.array<FormGroup<AttributeOptionForm>>([]),
    gender: this.formBuilder.control<Gender>(Gender.Man),
    category: this.formBuilder.control<string | null>(null as string | null),
    product: this.formBuilder.control<ProductToSelect | null>(
      null as ProductToSelect | null,
    ),
    color: this.formBuilder.control<ColorOption | null>(
      null as ColorOption | null,
    ),
    sizes: this.formBuilder.array<FormGroup<ProductVariationForm>>([]),
    productPageSize: this.formBuilder.control<number>(20),
    productPageNumber: this.formBuilder.control<number>(1),
  });
  showColors = model<boolean>(false);
  isAnyColorSelected$ = this.attributesForm.controls.colors.valueChanges.pipe(
    startWith(this.attributesForm.controls.colors.value),
    map((colors) => colors.some((color) => color.isSelected === true)),
  );
  generateByAttributesDisable$ = combineLatest([
    this.attributesForm.valueChanges.pipe(startWith(this.attributesForm.value)),
    this.measuresForm.valueChanges.pipe(startWith(this.measuresForm.value)),
  ]).pipe(
    map(([attributes, measures]) => {
      return (
        !attributes.gender ||
        !attributes.attributes?.some(
          (attribute) => attribute.isSelected === true,
        ) ||
        !attributes.colors?.some((color) => color.isSelected === true) ||
        !measures.footMeasure ||
        !measures.waistContour ||
        !measures.chestContour ||
        !measures.hipContour
      );
    }),
  );
  generateByItemDisable$ = combineLatest([
    this.itemForm.valueChanges.pipe(startWith(this.itemForm.value)),
    this.measuresForm.valueChanges.pipe(startWith(this.measuresForm.value)),
  ]).pipe(
    map(([item, measures]) => {
      if (!item.selectedVariation) return true;

      const { gender, bodyZone, parentCategory } = item.selectedVariation;
      const measureType = BodyZoneToMeasureType[bodyZone];

      const providedMeasures = !measureType
        ? []
        : getRequiredMeasures(gender, measureType);

      if (parentCategory === 'Belts') {
        return (
          !measures.chestContour ||
          !measures.hipContour ||
          !measures.footMeasure
        );
      }

      const measuresToInput = ALL_MEASURES.filter(
        (m) => !providedMeasures.includes(m),
      );

      return measuresToInput.some((m) => !measures[m]);
    }),
  );

  ngOnInit(): void {
    this.fillProductSelectForm();
    this.fillAttributesForm();
    this.loadCategoriesByGender(Gender.Man, true);
  }
  onGenderChanged(gender: Gender) {
    this.loadCategoriesByGender(gender, true);
  }
  onProductFiltersChanged(filters: ProductFilterPayload) {
    this.loadProducts(filters);
  }

  onProductSelected(product: ProductToSelect) {
    this.store
      .dispatch(new GetLookGenerationProductVariations(product.productItemId))
      .pipe(
        switchMap(() =>
          this.productVariations$.pipe(
            filter((variations) => variations.length > 0),
            take(1),
          ),
        ),
        tap(() => this.modalComponent.showSizes.set(true)),
        untilDestroyed(this),
      )
      .subscribe();
  }

  onAddingProductVariations() {
    const selectedVariations = this.selectProductForm.controls.sizes.controls
      .filter((variationForm) => variationForm.controls.isSelected.value)
      .map((variationForm) => variationForm.getRawValue());

    const alreadyExists =
      this.itemForm.value.selectedVariation?.id === selectedVariations[0].id;
    if (!alreadyExists) {
      this.itemForm.controls.selectedVariation.setValue(selectedVariations[0]);
    }
  }
  toggleColor(color: FormGroup<ColourOptionForm>) {
    color.controls.isSelected.setValue(!color.controls.isSelected.value);
  }
  onDeleteLookClick(lookId: string) {
    this.lookIdToDelete = lookId;
    this.isDialogVisible.set(true);
  }
  confirmLookDelete() {
    if (!this.lookIdToDelete) return;

    this.store
      .dispatch(new DeleteGeneratedLook(this.lookIdToDelete))
      .pipe(untilDestroyed(this))
      .subscribe();

    this.lookIdToDelete = null;
    this.isDialogVisible.set(false);
  }
  onGenerateLookSubmit() {
    if (this.attributesForm.valid && this.measuresForm.valid) {
      const measurements: Record<string, number> = {
        chestContour: this.measuresForm.controls.chestContour.value,
        hipContour: this.measuresForm.controls.hipContour.value,
        waistContour: this.measuresForm.controls.waistContour.value,
        footMeasure: this.measuresForm.controls.footMeasure.value,
      };

      this.loadingService.startLoading();
      this.store
        .dispatch(
          new GenerateLooks(
            this.attributesForm.controls.gender.value,
            this.attributesForm.value.attributes
              ?.filter((attribute) => attribute.isSelected === true)
              ?.map((attribute) => attribute.attribute?.id)
              .filter((id): id is string => id !== undefined) || [],
            this.attributesForm.value.colors
              ?.filter((color) => color.isSelected === true)
              ?.map((color) => color.option?.name)
              .filter((name): name is string => name !== undefined) || [],
            measurements,
          ),
        )
        .pipe(
          catchErrorWithNotification<void>(this.messageService),
          finalize(() => this.loadingService.endLoading()),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }
  onGenerateLookByItemSubmit() {
    const selected = this.itemForm.value.selectedVariation;
    if (!selected) return;

    const { id, gender, bodyZone, parentCategory } = selected;
    // Get which measurement types are "covered" by item
    const measureType = BodyZoneToMeasureType[bodyZone];
    const providedMeasures: string[] = measureType
      ? getRequiredMeasures(gender, measureType)
      : [];
    const requiredMeasures =
      parentCategory === 'Belts'
        ? ALL_MEASURES.filter((m) => m !== 'waistContour')
        : ALL_MEASURES.filter((m) => !providedMeasures.includes(m));

    const measurements: Record<string, number> = {};
    for (const key of requiredMeasures) {
      const typedKey = key as MeasureKey;
      const value = this.measuresForm.controls[typedKey].value;
      if (!isNaN(value) && value > 0) {
        measurements[key] = value;
      }
    }
    this.loadingService.startLoading();
    this.store
      .dispatch(new GenerateLooksByItem(id, measurements))
      .pipe(
        catchErrorWithNotification<void>(this.messageService),
        finalize(() => this.loadingService.endLoading()),
        untilDestroyed(this),
      )
      .subscribe();
  }

  onItemRemoved() {
    this.itemForm.controls.selectedVariation.setValue(null);
  }
  onNextPageClick(page: number) {
    this.store
      .dispatch(
        new GetGeneratedLooks({
          [LookFilterType.PageNumber]: page,
          [LookFilterType.PageSize]: this.generatedLooks()?.pageSize,
        }),
      )
      .pipe(
        catchErrorWithNotification<void>(this.messageService),
        untilDestroyed(this),
      )
      .subscribe();
  }

  onLikeLookClick(lookId: string) {
    this.store
      .dispatch(new LikeGeneratedLook(lookId))
      .pipe(
        catchErrorWithNotification<void>(this.messageService),
        untilDestroyed(this),
      )
      .subscribe();
  }

  private fillAttributesForm() {
    this.fillAttributes(this.attributesForm.controls.attributes);
    this.fillColors();
  }
  private fillProductSelectForm() {
    this.fillAttributes(this.selectProductForm.controls.attributes);
    this.fillVariations();
  }

  private fillAttributes(
    attributesFormArray: FormArray<FormGroup<AttributeOptionForm>>,
  ) {
    this.attributes$
      .pipe(
        tap((attributes) => {
          if (attributes) {
            attributes.forEach((attribute) => {
              attributesFormArray.push(
                this.formBuilder.group<AttributeOptionForm>({
                  attribute:
                    this.formBuilder.control<AttributeOption>(attribute),
                  isSelected: this.formBuilder.control<boolean>(false),
                }),
              );
            });
          }
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }
  private fillVariations() {
    this.productVariations$
      .pipe(
        tap((variations) => {
          const product = this.selectProductForm.controls.product.value;
          if (variations && !!product) {
            this.selectProductForm.controls.sizes.clear();
            variations.forEach((variation) => {
              this.selectProductForm.controls.sizes.push(
                this.createProductVariationForm(variation, product, false),
              );
            });
          }
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }
  private fillColors() {
    this.colors()?.forEach((color) =>
      this.attributesForm.controls.colors.push(
        this.formBuilder.group<ColourOptionForm>({
          option: this.formBuilder.control<ColorOption>(color),
          isSelected: this.formBuilder.control<boolean>(false),
        }),
      ),
    );
  }
  private loadCategoriesByGender(
    gender: Gender,
    autoSelectFirst: boolean = false,
  ) {
    this.store
      .dispatch(new GetLookGenerationProductCategories(gender))
      .pipe(
        switchMap(() => this.productCategories$),
        filter((categories) => categories.length > 0),
        take(1),
        tap((categories) => {
          if (autoSelectFirst) {
            this.selectProductForm.controls.category.setValue(categories[0].id);
          }
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  private createProductVariationForm(
    variation: ProductVariation,
    product: ProductToSelect,
    isSelected = true,
  ): FormGroup<ProductVariationForm> {
    return this.formBuilder.group<ProductVariationForm>({
      id: this.formBuilder.control<string>(variation.id),
      name: this.formBuilder.control<string>(product.name),
      price: this.formBuilder.control<number>(variation.price),
      size: this.formBuilder.control<string | null>(variation.size),
      productId: this.formBuilder.control<string>(product.id),
      productItemId: this.formBuilder.control<string>(product.productItemId),
      imageUrl: this.formBuilder.control<string | null>(product.productImage),
      bodyZone: this.formBuilder.control<ProductBodyZone>(product.bodyZone),
      parentCategory: this.formBuilder.control<string>(product.parentCategory),
      gender: this.formBuilder.control<Gender>(product.gender),
      isSelected: this.formBuilder.control<boolean>(isSelected),
    });
  }
  private loadProducts(filters: ProductFilterPayload) {
    this.store
      .dispatch(new GetLookGenerationProductsToSelect(filters))
      .pipe(untilDestroyed(this))
      .subscribe();
  }
}
