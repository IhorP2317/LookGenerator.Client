import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { LOOK_MANAGEMENT_STATE_TOKEN } from '../../../tokens';
import { inject, Injectable } from '@angular/core';
import { Look } from '../../../core/models/look/look';
import { patch } from '@ngxs/store/operators';
import { LookApiService } from '../../../core/services/look.api.service';
import { GetLook } from '../look/look.actions';
import { switchMap, take, tap } from 'rxjs';
import {
  ClearLookToManage,
  CreateLook,
  GetLookManagementAttributeOptions,
  GetLookManagementProductCategories,
  GetLookManagementProductsToSelect,
  GetLookManagementProductVariations,
  GetLookToManage,
  UpdateLook,
} from './look-management.actions';
import { LookManagementStateModel } from './look-management.state.model';
import { COLOR_OPTIONS } from '../../../core/constants/constants';
import { Gender } from '../../../core/models/helpers/gender';
import { ProductCategory } from '../../../core/models/product-category/product-category';
import { PagedList } from '../../../core/models/helpers/paged-list';
import { ProductToSelect } from '../../../core/models/product/product-to-select';
import {
  ProductCategoryFilterPayload,
  ProductCategoryFilterType,
} from '../../../core/models/helpers/product-category-filter-type';
import { ProductCategoryApiService } from '../../../core/services/product-category.api.service';
import { ProductItemApiService } from '../../../core/services/product-item.api.service';
import { AttributeOptionApiService } from '../../../core/services/attribute-option.api.service';
import { AttributeOption } from '../../../core/models/attribute-option/attribute-option';
import {
  ProductVariationFilterPayload,
  ProductVariationFilterType,
} from '../../../core/models/helpers/product-variation-filter-type';
import { ProductVariationApiService } from '../../../core/services/product-variation.api.service';
import { ProductVariation } from '../../../core/models/product-variation/product-variation';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { cleanFilterPayload } from '../../../core/helpers/utils/clean-filter-payload-util';

@UntilDestroy()
@State<LookManagementStateModel>({
  name: LOOK_MANAGEMENT_STATE_TOKEN,
  defaults: {
    attributeOptions: [],
    colours: COLOR_OPTIONS,
    genders: [Gender.Man, Gender.Woman],
    look: null,
    categories: [],
    products: {
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    productVariations: [],
    newLookId: null,
  },
})
@Injectable()
export class LookManagementState implements NgxsOnInit {
  private lookApiService: LookApiService = inject(LookApiService);
  private productCategoryApiService: ProductCategoryApiService = inject(
    ProductCategoryApiService,
  );
  private productItemApiService: ProductItemApiService = inject(
    ProductItemApiService,
  );
  private attributeOptionApiService: AttributeOptionApiService = inject(
    AttributeOptionApiService,
  );
  private productVariationApiService: ProductVariationApiService = inject(
    ProductVariationApiService,
  );

  ngxsOnInit(ctx: StateContext<LookManagementStateModel>): void {
    this.loadAttributeOptions(ctx);
  }

  @Selector([LookManagementState])
  public static getLook(state: LookManagementStateModel) {
    return state?.look;
  }
  @Selector([LookManagementState])
  public static getAttributeOptions(state: LookManagementStateModel) {
    return state?.attributeOptions;
  }
  @Selector([LookManagementState])
  public static getCategories(state: LookManagementStateModel) {
    return state?.categories;
  }
  @Selector([LookManagementState])
  public static getProducts(state: LookManagementStateModel) {
    return state?.products;
  }
  @Selector([LookManagementState])
  public static getProductVariations(state: LookManagementStateModel) {
    return state?.productVariations;
  }
  @Selector([LookManagementState])
  public static getGenders(state: LookManagementStateModel) {
    return state?.genders;
  }
  @Selector([LookManagementState])
  public static getColours(state: LookManagementStateModel) {
    return state?.colours;
  }
  @Selector([LookManagementState])
  public static getLookId(state: LookManagementStateModel) {
    return state?.look?.id;
  }
  @Selector([LookManagementState])
  public static getNewLookId(state: LookManagementStateModel) {
    return state?.newLookId;
  }

  @Action(GetLookToManage)
  getLook(ctx: StateContext<LookManagementStateModel>, action: GetLook) {
    return this.lookApiService
      .getLook(action.lookId)
      .pipe(tap((look: Look) => this.setLook(ctx, look)));
  }

  @Action(GetLookManagementAttributeOptions)
  getAttributeOptions(ctx: StateContext<LookManagementStateModel>) {
    return this.attributeOptionApiService
      .getAttributeOptions()
      .pipe(
        tap((attributeOptions: AttributeOption[]) =>
          this.setAttributeOptions(ctx, attributeOptions),
        ),
      );
  }

  @Action(GetLookManagementProductCategories)
  getProductCategories(
    ctx: StateContext<LookManagementStateModel>,
    action: GetLookManagementProductCategories,
  ) {
    const filters: ProductCategoryFilterPayload = {
      [ProductCategoryFilterType.Gender]: action.gender,
      [ProductCategoryFilterType.HasProducts]: true,
    };
    return this.productCategoryApiService
      .getAll(filters)
      .pipe(
        tap((categories: ProductCategory[]) =>
          this.setCategories(ctx, categories),
        ),
      );
  }

  @Action(GetLookManagementProductsToSelect)
  getProductsToSelect(
    ctx: StateContext<LookManagementStateModel>,
    action: GetLookManagementProductsToSelect,
  ) {
    const cleanedFilters = cleanFilterPayload(action.filters);
    return this.productItemApiService
      .getAllToSelect(cleanedFilters)
      .pipe(
        tap((products: PagedList<ProductToSelect>) =>
          this.setProducts(ctx, products),
        ),
      );
  }
  @Action(GetLookManagementProductVariations)
  getProductVariations(
    ctx: StateContext<LookManagementStateModel>,
    action: GetLookManagementProductVariations,
  ) {
    const filters: ProductVariationFilterPayload = {
      [ProductVariationFilterType.ProductItem]: action.productItemId,
    };
    return this.productVariationApiService
      .getAll(filters)
      .pipe(tap((variations) => this.setProductVariations(ctx, variations)));
  }

  @Action(CreateLook)
  createLook(ctx: StateContext<LookManagementStateModel>, action: CreateLook) {
    return this.lookApiService
      .createLook(
        action.name,
        action.description,
        action.colorPalette,
        action.productVariationIds,
      )
      .pipe(tap((id) => this.setNewLookId(ctx, id)));
  }

  @Action(UpdateLook)
  updateLook(ctx: StateContext<LookManagementStateModel>, action: UpdateLook) {
    return this.lookApiService
      .updateLook(
        action.id,
        action.name,
        action.description,
        action.colorPalette,
        action.status,
        action.productVariationIds,
      )
      .pipe(
        switchMap(() => ctx.dispatch(new GetLookToManage(action.id))),
        take(1),
      );
  }
  @Action(ClearLookToManage)
  clearLookToManage(ctx: StateContext<LookManagementStateModel>) {
    ctx.patchState({ look: null, newLookId: null });
  }

  private setLook(
    ctx: StateContext<LookManagementStateModel>,
    look: Look | null,
  ) {
    ctx.setState(
      patch({
        look,
      }),
    );
  }
  private setAttributeOptions(
    ctx: StateContext<LookManagementStateModel>,
    attributeOptions: AttributeOption[],
  ) {
    ctx.setState(
      patch({
        attributeOptions,
      }),
    );
  }

  private setCategories(
    ctx: StateContext<LookManagementStateModel>,
    categories: ProductCategory[],
  ) {
    ctx.setState(
      patch({
        categories,
      }),
    );
  }

  private setProducts(
    ctx: StateContext<LookManagementStateModel>,
    products: PagedList<ProductToSelect>,
  ) {
    ctx.setState(
      patch({
        products,
      }),
    );
  }
  private setProductVariations(
    ctx: StateContext<LookManagementStateModel>,
    variations: ProductVariation[],
  ) {
    ctx.setState(
      patch({
        productVariations: variations,
      }),
    );
  }
  private loadAttributeOptions(
    ctx: StateContext<LookManagementStateModel>,
  ): void {
    ctx
      .dispatch([new GetLookManagementAttributeOptions()])
      .pipe(untilDestroyed(this))
      .subscribe();
  }
  private setNewLookId(
    ctx: StateContext<LookManagementStateModel>,
    newLookId: string,
  ) {
    ctx.setState(
      patch({
        newLookId,
      }),
    );
  }
}
