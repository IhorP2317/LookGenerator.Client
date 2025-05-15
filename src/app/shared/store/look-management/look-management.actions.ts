import { LookStatus } from '../../../core/models/look/look-status';
import { ProductCategoryFilterPayload } from '../../../core/models/helpers/product-category-filter-type';
import { ProductFilterPayload } from '../../../core/models/helpers/product-filter-type';
import { ProductVariationFilterPayload } from '../../../core/models/helpers/product-variation-filter-type';
import { Gender } from '../../../core/models/helpers/gender';

const ACTION_SCOPE = '[LookManagement]';
export class GetLookManagementAttributeOptions {
  static readonly type = `${ACTION_SCOPE} Get Attribute Options`;
}
export class GetLookManagementProductCategories {
  static readonly type = `${ACTION_SCOPE} Get Product Categories`;
  constructor(public gender: Gender) {}
}
export class GetLookManagementProductsToSelect {
  static readonly type = `${ACTION_SCOPE} Get Products To Select`;
  constructor(public filters: ProductFilterPayload) {}
}
export class GetLookManagementProductVariations {
  static readonly type = `${ACTION_SCOPE} Get Product Variations`;
  constructor(public productItemId: string) {}
}

export class GetLookToManage {
  static readonly type = `${ACTION_SCOPE} Get Look`;
  constructor(public lookId: string) {}
}
export class CreateLook {
  static readonly type = `${ACTION_SCOPE} Create Look`;
  constructor(
    public name: string,
    public description: string | null,
    public colorPalette: string,
    public productVariationIds: string[],
  ) {}
}

export class UpdateLook {
  static readonly type = `${ACTION_SCOPE} Update Look`;
  constructor(
    public id: string,
    public name: string,
    public description: string | null,
    public colorPalette: string,
    public status: LookStatus,
    public productVariationIds: string[],
  ) {}
}
