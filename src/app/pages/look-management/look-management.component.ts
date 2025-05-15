import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngxs/store';
import {
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LookForm } from '../../core/models/helpers/look-form';
import { LookStatus } from '../../core/models/look/look-status';
import { ProductVariationForm } from '../../core/models/helpers/product-variation-form';
import { concatMap, filter, of, switchMap, take, tap } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CreateLook,
  GetLookManagementProductCategories,
  GetLookManagementProductsToSelect,
  GetLookManagementProductVariations,
  GetLookToManage,
  UpdateLook,
} from '../../shared/store/look-management/look-management.actions';
import { LookManagementState } from '../../shared/store/look-management/look-management.state';
import { IconField } from 'primeng/iconfield';
import { InputText } from 'primeng/inputtext';
import { InputIcon } from 'primeng/inputicon';
import { Textarea } from 'primeng/textarea';
import { SelectButton } from 'primeng/selectbutton';
import { Button } from 'primeng/button';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { ProductSelectionForm } from '../../core/models/helpers/product-selection-form';
import { Gender } from '../../core/models/helpers/gender';
import { ProductToSelect } from '../../core/models/product/product-to-select';
import { ColorOption } from '../../core/models/helpers/colour-option';
import { AttributeOptionForm } from '../../core/models/helpers/attribute-option-form';
import { ProductVariationToSelectModalComponent } from '../../shared/components/product-variation-to-select-modal/product-variation-to-select-modal.component';
import { ProductFilterPayload } from '../../core/models/helpers/product-filter-type';
import { AttributeOption } from '../../core/models/attribute-option/attribute-option';
import { ProductVariation } from '../../core/models/product-variation/product-variation';
import { catchErrorWithNotification } from '../../core/helpers/utils/catch-error-with-notification.util';
import { MessageService } from 'primeng/api';

@UntilDestroy()
@Component({
  selector: 'app-look-management',
  imports: [
    IconField,
    InputText,
    ReactiveFormsModule,
    InputIcon,
    Textarea,
    SelectButton,
    Button,
    CurrencyPipe,
    ProductVariationToSelectModalComponent,
    AsyncPipe,
  ],
  templateUrl: './look-management.component.html',
  styleUrl: './look-management.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LookManagementComponent implements OnInit {
  @ViewChild(ProductVariationToSelectModalComponent)
  modalComponent!: ProductVariationToSelectModalComponent;
  private store: Store = inject(Store);
  private formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private messageService: MessageService = inject(MessageService);
  private router: Router = inject(Router);
  genders = this.store.selectSignal(LookManagementState.getGenders);

  productCategories$ = this.store.select(LookManagementState.getCategories);
  products = this.store.selectSignal(LookManagementState.getProducts);
  colors = this.store.selectSignal(LookManagementState.getColours);
  attributes$ = this.store.select(LookManagementState.getAttributeOptions);
  productVariations$ = this.store.select(
    LookManagementState.getProductVariations,
  );

  form: FormGroup<LookForm> = this.formBuilder.group<LookForm>({
    id: this.formBuilder.control<string | null>(null),
    name: this.formBuilder.control<string>('', [Validators.required]),
    description: this.formBuilder.control<string | null>(null),
    colorPalette: this.formBuilder.control<string>('', [Validators.required]),
    lookStatus: this.formBuilder.control<LookStatus>(LookStatus.Draft),
    productVariations: this.formBuilder.array<FormGroup<ProductVariationForm>>(
      [],
      [Validators.required],
    ),
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
  lookToManage = this.store.selectSignal(LookManagementState.getLook);

  ngOnInit(): void {
    this.loadLook();
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
      .dispatch(new GetLookManagementProductVariations(product.productItemId))
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

  onProductAdded(variations: ProductVariationForm[]) {
    const array = this.form.controls.productVariations;
    for (const variation of variations) {
      array.push(this.formBuilder.group<ProductVariationForm>(variation));
    }
  }

  removeVariation(index: number): void {
    this.form.controls.productVariations.removeAt(index);
  }
  onAddingProductVariations() {
    const selectedVariations = this.selectProductForm.controls.sizes.controls
      .filter((variationForm) => !variationForm.controls.isSelected.value)
      .map((variationForm) => variationForm.getRawValue());

    const targetArray = this.form.controls.productVariations;

    for (const variation of selectedVariations) {
      const alreadyExists = targetArray.controls.some(
        (existing) => existing.controls.id.value === variation.id,
      );

      if (!alreadyExists) {
        targetArray.push(
          this.formBuilder.group<ProductVariationForm>({
            id: this.formBuilder.control<string>(variation.id),
            name: this.formBuilder.control<string>(variation.name),
            price: this.formBuilder.control<number>(variation.price),
            size: this.formBuilder.control<string | null>(variation.size),
            productId: this.formBuilder.control<string>(variation.productId),
            productItemId: this.formBuilder.control<string>(
              variation.productItemId,
            ),
            imageUrl: this.formBuilder.control<string | null>(
              variation.imageUrl,
            ),
            isSelected: this.formBuilder.control<boolean>(true),
          }),
        );
      }
    }
  }
  onSaveLookClicked() {
    if (this.form.valid) {
      const request = this.buildLookRequest();

      this.store
        .dispatch(request)
        .pipe(
          concatMap(() =>
            this.store.select(LookManagementState.getNewLookId).pipe(
              filter((id): id is string => !!id),
              take(1),
            ),
          ),
          tap((id) => this.router.navigate(['looks/management/', id])),
          catchErrorWithNotification<string>(this.messageService),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }

  private loadLook() {
    this.activatedRoute.paramMap
      .pipe(
        take(1),
        switchMap((params) => {
          const id: string | null = params.get('id');
          if (!id) {
            return of(null); // Emit null so that `tap` is still executed
          }
          return this.store.dispatch(new GetLookToManage(id));
        }),
        tap(() => {
          this.fillLookForm();
          this.fillProductSelectForm();
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  private fillLookForm() {
    const look = this.lookToManage();
    if (!look) return;
    this.form.patchValue({
      id: look.id,
      name: look.name,
      description: look.description,
      colorPalette: look.colorPalette,
      lookStatus: look.lookStatus,
    });
    const variationsArray = this.form.controls.productVariations;
    variationsArray.clear();
    look.products.forEach((product) => {
      product.productVariations.forEach((variation) => {
        variationsArray.push(
          this.createProductVariationForm(variation, product),
        );
      });
    });
  }

  private fillProductSelectForm() {
    this.fillAttributes();
    this.fillVariations();
  }

  private fillAttributes() {
    this.attributes$
      .pipe(
        tap((attributes) => {
          if (attributes) {
            attributes.forEach((attribute) => {
              this.selectProductForm.controls.attributes.push(
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
                this.createProductVariationForm(variation, product),
              );
            });
          }
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  private loadCategoriesByGender(
    gender: Gender,
    autoSelectFirst: boolean = false,
  ) {
    this.store
      .dispatch(new GetLookManagementProductCategories(gender))
      .pipe(
        switchMap(() => this.productCategories$), // дочекатись оновлених категорій
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

  private loadProducts(filters: ProductFilterPayload) {
    this.store
      .dispatch(new GetLookManagementProductsToSelect(filters))
      .pipe(untilDestroyed(this))
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
      isSelected: this.formBuilder.control<boolean>(isSelected),
    });
  }
  private buildLookRequest(): CreateLook | UpdateLook {
    const lookForm = this.form.getRawValue();
    const productVariationIds = lookForm.productVariations.map(
      (variation) => variation.id,
    );
    return !!this.lookToManage()
      ? new UpdateLook(
          lookForm.id!,
          lookForm.name,
          lookForm.description,
          lookForm.colorPalette,
          lookForm.lookStatus,
          productVariationIds,
        )
      : new CreateLook(
          lookForm.name,
          lookForm.description,
          lookForm.colorPalette,
          productVariationIds,
        );
  }
}
