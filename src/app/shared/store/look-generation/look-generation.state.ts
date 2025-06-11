import { inject, Injectable } from '@angular/core';
import {
  Action,
  NgxsOnInit,
  Selector,
  State,
  StateContext,
  Store,
} from '@ngxs/store';
import { LookGenerationStateModel } from './look-generation.state.model';
import { LOOK_GENERATION_STATE_TOKEN } from '../../../tokens';
import { Gender } from '../../../core/models/helpers/gender';
import { COLOR_OPTIONS } from '../../../core/constants/constants';
import { LookApiService } from '../../../core/services/look.api.service';
import { ProductCategoryApiService } from '../../../core/services/product-category.api.service';
import { ProductItemApiService } from '../../../core/services/product-item.api.service';
import { AttributeOptionApiService } from '../../../core/services/attribute-option.api.service';
import {
  DeleteGeneratedLook,
  GenerateLooks,
  GenerateLooksByItem,
  GetGeneratedLooks,
  GetLookGenerationAttributeOptions,
  GetLookGenerationProductCategories,
  GetLookGenerationProductsToSelect,
  GetLookGenerationProductVariations,
  LikeGeneratedLook,
} from './look-generation.actions';
import { AttributeOption } from '../../../core/models/attribute-option/attribute-option';
import { patch } from '@ngxs/store/operators';
import { filter, switchMap, take, tap } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ProductCategoryFilterPayload,
  ProductCategoryFilterType,
} from '../../../core/models/helpers/product-category-filter-type';
import { ProductCategory } from '../../../core/models/product-category/product-category';
import { ProductToSelect } from '../../../core/models/product/product-to-select';
import { PagedList } from '../../../core/models/helpers/paged-list';
import { cleanFilterPayload } from '../../../core/helpers/utils/clean-filter-payload-util';
import { ProductVariation } from '../../../core/models/product-variation/product-variation';
import { FeedLook } from '../../../core/models/look/feed-look';
import { ProductVariationApiService } from '../../../core/services/product-variation.api.service';
import {
  ProductVariationFilterPayload,
  ProductVariationFilterType,
} from '../../../core/models/helpers/product-variation-filter-type';
import { AuthState } from '../auth/auth.state';
import { LookFilterType } from '../../../core/models/helpers/look-filter-type';

import { LookStatus } from '../../../core/models/look/look-status';
@UntilDestroy()
@State<LookGenerationStateModel>({
  name: LOOK_GENERATION_STATE_TOKEN,
  defaults: {
    attributeOptions: [],
    genders: [Gender.Man, Gender.Woman],
    colours: COLOR_OPTIONS,
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
    generatedLooks: {
      items: [],
      page: 1,
      pageSize: 5,
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    newGeneratedLookIds: [],
  },
})
@Injectable()
export class LookGenerationState implements NgxsOnInit {
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
  private currentUser$ = inject(Store).selectOnce(AuthState.getCurrentUser);

  @Selector([LookGenerationState])
  public static getAttributeOptions(state: LookGenerationStateModel) {
    return state?.attributeOptions;
  }
  @Selector([LookGenerationState])
  public static getGenders(state: LookGenerationStateModel) {
    return state?.genders;
  }
  @Selector([LookGenerationState])
  public static getColours(state: LookGenerationStateModel) {
    return state?.colours;
  }
  @Selector([LookGenerationState])
  public static getCategories(state: LookGenerationStateModel) {
    return state?.categories;
  }
  @Selector([LookGenerationState])
  public static getProducts(state: LookGenerationStateModel) {
    return state?.products;
  }
  @Selector([LookGenerationState])
  public static getProductVariations(state: LookGenerationStateModel) {
    return state?.productVariations;
  }
  @Selector([LookGenerationState])
  public static getGeneratedLooks(state: LookGenerationStateModel) {
    return state?.generatedLooks;
  }

  @Action(GetLookGenerationAttributeOptions)
  getAttributeOptions(ctx: StateContext<LookGenerationStateModel>) {
    return this.attributeOptionApiService
      .getAttributeOptions()
      .pipe(
        tap((attributeOptions) =>
          this.setAttributeOptions(ctx, attributeOptions),
        ),
      );
  }
  @Action(GetLookGenerationProductCategories)
  getProductCategories(
    ctx: StateContext<LookGenerationStateModel>,
    action: GetLookGenerationProductCategories,
  ) {
    const filters: ProductCategoryFilterPayload = {
      [ProductCategoryFilterType.Gender]: action.gender,
      [ProductCategoryFilterType.HasProducts]: true,
    };
    return this.productCategoryApiService
      .getAll(filters)
      .pipe(tap((categories) => this.setCategories(ctx, categories)));
  }
  @Action(GetLookGenerationProductsToSelect)
  getProductsToSelect(
    ctx: StateContext<LookGenerationStateModel>,
    action: GetLookGenerationProductsToSelect,
  ) {
    const cleanedFilters = cleanFilterPayload(action.filters);
    return this.productItemApiService
      .getAllToSelect(cleanedFilters)
      .pipe(tap((products) => this.setProducts(ctx, products)));
  }

  @Action(GetLookGenerationProductVariations)
  getProductVariations(
    ctx: StateContext<LookGenerationStateModel>,
    action: GetLookGenerationProductVariations,
  ) {
    const filters: ProductVariationFilterPayload = {
      [ProductVariationFilterType.ProductItem]: action.productItemId,
    };
    return this.productVariationApiService
      .getAll(filters)
      .pipe(tap((variations) => this.setProductVariations(ctx, variations)));
  }

  @Action(GetGeneratedLooks)
  getGeneratedLooks(
    ctx: StateContext<LookGenerationStateModel>,
    action: GetGeneratedLooks,
  ) {
    const cleanedFilters = cleanFilterPayload(action.filters);
    cleanedFilters[LookFilterType.Status] = LookStatus.Draft;
    cleanedFilters[LookFilterType.OrderByDescending] = 'date';

    return this.currentUser$.pipe(
      switchMap((currentUser) => {
        if (currentUser) {
          cleanedFilters[LookFilterType.CreatedBy] = currentUser.id;
        }

        return this.lookApiService.getLooks(cleanedFilters).pipe(
          tap((generatedLooks) => {
            const newLookIds = ctx.getState().newGeneratedLookIds;

            const updatedItems = generatedLooks.items.map((look) => ({
              ...look,
              isNew: newLookIds.includes(look.id),
            }));
            this.setGeneratedLooks(ctx, {
              ...generatedLooks,
              items: updatedItems,
            });
          }),
        );
      }),
    );
  }
  @Action(LikeGeneratedLook)
  likeGeneratedLook(
    ctx: StateContext<LookGenerationStateModel>,
    action: LikeGeneratedLook,
  ) {
    return this.lookApiService
      .updateLookStatus(action.lookId, LookStatus.Private)
      .pipe(
        switchMap(() => {
          const currentLooks = ctx.getState().generatedLooks;
          const pageSize = currentLooks.pageSize;
          const pageNumber =
            currentLooks.items.length === 1 && currentLooks.hasPreviousPage
              ? Math.max(currentLooks.page - 1, 1)
              : currentLooks.page;
          return ctx
            .dispatch(
              new GetGeneratedLooks({
                [LookFilterType.PageNumber]: pageNumber,
                [LookFilterType.PageSize]: pageSize,
              }),
            )
            .pipe(take(1));
        }),
        untilDestroyed(this),
      );
  }
  @Action(DeleteGeneratedLook)
  deleteGeneratedLook(
    ctx: StateContext<LookGenerationStateModel>,
    action: LikeGeneratedLook,
  ) {
    return this.lookApiService.deleteLook(action.lookId).pipe(
      switchMap(() => {
        const currentLooks = ctx.getState().generatedLooks;
        const pageSize = currentLooks.pageSize;
        const pageNumber =
          currentLooks.items.length === 1 && currentLooks.hasPreviousPage
            ? Math.max(currentLooks.page - 1, 1)
            : currentLooks.page;
        return ctx.dispatch(
          new GetGeneratedLooks({
            [LookFilterType.PageNumber]: pageNumber,
            [LookFilterType.PageSize]: pageSize,
          }),
        );
      }),
      untilDestroyed(this),
    );
  }

  @Action(GenerateLooks)
  generateLooks(
    ctx: StateContext<LookGenerationStateModel>,
    action: GenerateLooks,
  ) {
    return this.lookApiService
      .generateLook(
        action.gender,
        action.attributeOptionIds,
        action.colours,
        action.measurements,
      )
      .pipe(
        filter((looks) => looks.length > 0),
        tap((looks) => {
          this.setNewGeneratedLookIds(
            ctx,
            looks.map((look) => look.id),
          );
        }),
        switchMap((_) =>
          ctx.dispatch(
            new GetGeneratedLooks({
              [LookFilterType.PageNumber]: 1,
              [LookFilterType.PageSize]: 4,
            }),
          ),
        ),
      );
  }

  @Action(GenerateLooksByItem)
  generateLookByItem(
    ctx: StateContext<LookGenerationStateModel>,
    action: GenerateLooksByItem,
  ) {
    this.setNewGeneratedLookIds(ctx, []);
    return this.lookApiService
      .generateLookByItem(action.productVariationId, action.measurements)
      .pipe(
        filter((looks) => looks.length > 0),
        tap((looks) => {
          this.setNewGeneratedLookIds(
            ctx,
            looks.map((look) => look.id),
          );
        }),
        switchMap((_) =>
          ctx.dispatch(
            new GetGeneratedLooks({
              [LookFilterType.PageNumber]: 1,
              [LookFilterType.PageSize]: 4,
            }),
          ),
        ),
      );
  }

  ngxsOnInit(ctx: StateContext<LookGenerationStateModel>): void {
    this.loadAttributeOptions(ctx);
    this.loadGeneratedLooks(ctx);
    this.setNewGeneratedLookIds(ctx, []);
  }
  private loadAttributeOptions(
    ctx: StateContext<LookGenerationStateModel>,
  ): void {
    ctx
      .dispatch(new GetLookGenerationAttributeOptions())
      .pipe(untilDestroyed(this))
      .subscribe();
  }
  private loadGeneratedLooks(ctx: StateContext<LookGenerationStateModel>) {
    ctx
      .dispatch(
        new GetGeneratedLooks({
          [LookFilterType.PageNumber]: 1,
          [LookFilterType.PageSize]: 4,
        }),
      )
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  private setAttributeOptions(
    ctx: StateContext<LookGenerationStateModel>,
    attributeOptions: AttributeOption[],
  ) {
    ctx.setState(
      patch({
        attributeOptions,
      }),
    );
  }
  private setCategories(
    ctx: StateContext<LookGenerationStateModel>,
    categories: ProductCategory[],
  ) {
    ctx.setState(
      patch({
        categories,
      }),
    );
  }
  private setProducts(
    ctx: StateContext<LookGenerationStateModel>,
    products: PagedList<ProductToSelect>,
  ) {
    ctx.setState(
      patch({
        products,
      }),
    );
  }

  private setProductVariations(
    ctx: StateContext<LookGenerationStateModel>,
    variations: ProductVariation[],
  ) {
    ctx.setState(
      patch({
        productVariations: variations,
      }),
    );
  }
  private setGeneratedLooks(
    ctx: StateContext<LookGenerationStateModel>,
    generatedLooks: PagedList<FeedLook>,
  ) {
    ctx.setState(
      patch({
        generatedLooks,
      }),
    );
  }
  private setNewGeneratedLookIds(
    ctx: StateContext<LookGenerationStateModel>,
    newGeneratedLookIds: string[],
  ) {
    ctx.setState(
      patch({
        newGeneratedLookIds,
      }),
    );
  }
}
